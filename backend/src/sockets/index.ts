import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { moderateContent, canAccessRoom } from '../lib/moderation';

interface AuthSocket extends Socket {
  userId?: string;
  userRole?: string;
  ageBracket?: string | null;
  consentMinorOk?: boolean;
}

interface JoinRoomData {
  slug: string;
  userId: string;
  displayName?: string;
}

interface SendMessageData {
  slug: string;
  body: string;
  authorId: string;
}

export const initializeSocket = (httpServer: HTTPServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:5174',
      ],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      socket.ageBracket = decoded.ageBracket;
      socket.consentMinorOk = decoded.consentMinorOk;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join a peer room
    socket.on('joinRoom', async (data: JoinRoomData) => {
      try {
        const { slug, userId, displayName } = data;

        // Verify room exists
        const room = await prisma.peerRoom.findUnique({
          where: { slug },
          select: {
            id: true,
            slug: true,
            title: true,
            isMinorSafe: true,
          },
        });

        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Check if user can access this room
        const accessCheck = canAccessRoom(
          socket.ageBracket || null,
          socket.consentMinorOk || false,
          room.isMinorSafe
        );

        if (!accessCheck.allowed) {
          socket.emit('error', { message: accessCheck.reason });
          return;
        }

        // Join the socket.io room
        socket.join(`room:${slug}`);
        socket.emit('joinedRoom', { 
          roomSlug: slug, 
          roomTitle: room.title,
          roomId: room.id,
        });
        
        // Notify others
        socket.to(`room:${slug}`).emit('userJoined', {
          userId,
          displayName,
          roomSlug: slug,
        });

        console.log(`User ${socket.userId} joined room ${slug}`);
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Send a message
    socket.on('sendMessage', async (data: SendMessageData) => {
      try {
        const { slug, body, authorId } = data;

        if (!body || body.trim().length === 0) {
          socket.emit('error', { message: 'Message cannot be empty' });
          return;
        }

        if (body.length > 1000) {
          socket.emit('error', { message: 'Message too long (max 1000 characters)' });
          return;
        }

        // Get room
        const room = await prisma.peerRoom.findUnique({
          where: { slug },
          select: { id: true, title: true, isMinorSafe: true },
        });

        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Moderate content
        const moderation = moderateContent(body, room.isMinorSafe);

        // Save message to database
        const message = await prisma.peerMessage.create({
          data: {
            roomId: room.id,
            authorId: authorId,
            body: body.trim(),
            flagged: moderation.flagged,
            flags: JSON.stringify(moderation.flags),
          },
          include: {
            user: {
              select: { id: true, displayName: true, name: true },
            },
          },
        });

        // Emit message to all users in the room
        io.to(`room:${slug}`).emit('receiveMessage', {
          id: message.id,
          body: message.body,
          createdAt: message.createdAt,
          flagged: message.flagged,
          flags: JSON.parse(message.flags),
          author: {
            id: message.user.id,
            displayName: message.user.displayName || message.user.name,
          },
        });

        // If flagged, log and notify moderators
        if (moderation.flagged) {
          await prisma.auditLog.create({
            data: {
              actorId: authorId,
              action: 'MESSAGE_FLAGGED_REALTIME',
              metadata: JSON.stringify({
                messageId: message.id,
                roomSlug: slug,
                roomTitle: room.title,
                flags: moderation.flags,
                preview: body.substring(0, 100),
              }),
            },
          });

          // Emit to moderators only (they would need to join a special moderator room)
          io.to('moderators').emit('messageFlagged', {
            messageId: message.id,
            roomSlug: slug,
            roomTitle: room.title,
            userId: authorId,
            flags: moderation.flags,
          });

          console.warn(`⚠️  Real-time message flagged in room ${slug}:`, {
            messageId: message.id,
            userId: authorId,
            flags: moderation.flags,
          });
        }
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Leave room
    socket.on('leaveRoom', (data: { slug: string }) => {
      const { slug } = data;
      socket.leave(`room:${slug}`);
      socket.to(`room:${slug}`).emit('userLeft', { 
        userId: socket.userId, 
        roomSlug: slug 
      });
      console.log(`User ${socket.userId} left room ${slug}`);
    });

    // Moderators can join the moderators room to receive flagged message notifications
    if (socket.userRole === 'moderator' || socket.userRole === 'admin') {
      socket.join('moderators');
      console.log(`Moderator ${socket.userId} joined moderators room`);
    }

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};
