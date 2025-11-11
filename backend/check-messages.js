const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMessages() {
  try {
    const messages = await prisma.peerMessage.findMany({
      include: {
        user: {
          select: { id: true, displayName: true, name: true }
        },
        room: {
          select: { slug: true, title: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log('\n=== Last 10 Messages ===\n');
    
    if (messages.length === 0) {
      console.log('No messages found in database.');
    } else {
      messages.forEach((msg, i) => {
        console.log(`${i + 1}. [${msg.room.slug}] ${msg.user.displayName || msg.user.name}: ${msg.body.substring(0, 50)}...`);
        console.log(`   ID: ${msg.id}, Created: ${msg.createdAt}, Flagged: ${msg.flagged}`);
        console.log('');
      });
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkMessages();
