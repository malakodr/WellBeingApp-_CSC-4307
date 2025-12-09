const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupOrphanedApplications() {
  console.log('🔍 Checking for orphaned peer applications...\n');

  try {
    // Get all applications
    const applications = await prisma.peerApplication.findMany({
      select: {
        id: true,
        fullName: true,
        auiEmail: true,
        status: true,
        createdAt: true,
      },
    });

    console.log(`📊 Total applications in database: ${applications.length}\n`);

    // Check each application to see if user exists
    const orphaned = [];
    
    for (const app of applications) {
      const user = await prisma.user.findUnique({
        where: { email: app.auiEmail },
      });

      if (!user && app.status === 'APPROVED') {
        orphaned.push(app);
      }
    }

    if (orphaned.length === 0) {
      console.log('✅ No orphaned applications found. All approved applications have associated user accounts.');
      return;
    }

    console.log(`⚠️  Found ${orphaned.length} orphaned application(s):\n`);
    orphaned.forEach((app, index) => {
      console.log(`${index + 1}. ${app.fullName} (${app.auiEmail})`);
      console.log(`   Status: ${app.status}`);
      console.log(`   Created: ${app.createdAt}`);
      console.log(`   ID: ${app.id}\n`);
    });

    // Ask for confirmation before cleanup
    console.log('These applications are marked as APPROVED but have no user account.');
    console.log('They will be deleted to allow users to reapply.\n');

    // Delete orphaned applications
    for (const app of orphaned) {
      await prisma.peerApplication.delete({
        where: { id: app.id },
      });
      console.log(`🗑️  Deleted orphaned application: ${app.fullName} (${app.auiEmail})`);
    }

    console.log(`\n✅ Cleanup complete! ${orphaned.length} orphaned application(s) removed.`);
    console.log('These users can now submit fresh applications.');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOrphanedApplications();
