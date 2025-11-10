import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).optional(),
  displayName: z.string().min(2),
  age: z.number().int().min(13).max(100),
  role: z.enum(['student', 'counselor', 'moderator', 'admin']),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const consentSchema = z.object({
  userId: z.string(),
  accepted: z.boolean(),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);

    // Block admin role registration
    if (validatedData.role && (validatedData.role.toLowerCase() === 'admin' || validatedData.role.toLowerCase() === 'administrator')) {
      res.status(403).json({ error: 'You cannot self-register as administrator.' });
      return;
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Determine age bracket and consent status
    const ageBracket = validatedData.age < 18 ? 'UNDER18' : 'ADULT';
    const consentMinorOk = validatedData.age >= 18; // Adults don't need consent flow

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        displayName: validatedData.displayName,
        role: validatedData.role,
        ageBracket,
        consentMinorOk,
      },
      select: {
        id: true,
        email: true,
        name: true,
        displayName: true,
        role: true,
        ageBracket: true,
        consentMinorOk: true,
        createdAt: true,
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        ageBracket: user.ageBracket,
        consentMinorOk: user.consentMinorOk 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check password
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password);

    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        ageBracket: user.ageBracket,
        consentMinorOk: user.consentMinorOk 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        displayName: user.displayName,
        role: user.role,
        ageBracket: user.ageBracket,
        consentMinorOk: user.consentMinorOk,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        displayName: true,
        role: true,
        ageBracket: true,
        consentMinorOk: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const consent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = consentSchema.parse(req.body);

    // Verify the user exists and is a minor
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.ageBracket !== 'UNDER18') {
      res.status(400).json({ error: 'Consent flow only applies to minors' });
      return;
    }

    if (!validatedData.accepted) {
      res.status(400).json({ error: 'Consent must be accepted to continue' });
      return;
    }

    // Update user consent status
    const updatedUser = await prisma.user.update({
      where: { id: validatedData.userId },
      data: { consentMinorOk: true },
      select: {
        id: true,
        email: true,
        name: true,
        displayName: true,
        role: true,
        ageBracket: true,
        consentMinorOk: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: validatedData.userId,
        action: 'CONSENT_ACCEPTED',
        metadata: JSON.stringify({
          timestamp: new Date().toISOString(),
          userAgent: req.headers['user-agent'],
        }),
      },
    });

    res.json({ user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('Consent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
