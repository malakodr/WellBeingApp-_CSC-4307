const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeUser() {
  const email = 'm.tantaouielaraki@aui.ma';
  
  console.log(`🔍 Looking for user: ${email}\n`);

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('❌ User not found in database.');
      
      // Check if there's an application
      const app = await prisma.peerApplication.findUnique({
        where: { auiEmail: email },
      });

      if (app) {
        console.log('⚠️  Found peer application for this email.');
        await prisma.peerApplication.delete({
          where: { auiEmail: email },
        });
        console.log('🗑️  Deleted peer application.');
      } else {
        console.log('ℹ️  No application found either.');
      }
      
      return;
    }

    console.log(`Found user: ${user.name || user.displayName} (${user.email})`);
    console.log(`Role: ${user.role}`);
    console.log(`ID: ${user.id}\n`);

    // Check for peer application
    const app = await prisma.peerApplication.findUnique({
      where: { auiEmail: email },
    });

    // Delete user
    await prisma.user.delete({
      where: { id: user.id },
    });
    console.log('🗑️  Deleted user account.');

    // Delete peer application if exists
    if (app) {
      await prisma.peerApplication.delete({
        where: { id: app.id },
      });
      console.log('🗑️  Deleted associated peer application.');
    }

    console.log('\n✅ Removal complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

removeUser();
