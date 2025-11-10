const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRooms() {
  try {
    const rooms = await prisma.peerRoom.findMany();
    console.log('Rooms in database:', rooms.length);
    console.log(JSON.stringify(rooms, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRooms();
