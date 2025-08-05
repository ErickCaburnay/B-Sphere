const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
};

const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);

async function testAutoManagement() {
  try {
    console.log('🧪 Testing Auto-Management Functionality');
    console.log('========================================\n');
    
    const now = new Date();
    const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    // Test 1: Create test announcements with auto-publish/archive dates
    console.log('1️⃣ Creating test announcements...');
    
    const testAnnouncements = [
      {
        title: 'Auto-Publish Test Announcement',
        description: 'This announcement should auto-publish in the past',
        category: 'Community',
        status: 'draft',
        color: 'green',
        imageUrl: '',
        autoPublishDate: pastDate,
        autoArchiveDate: null,
        createdAt: now,
        updatedAt: now,
        createdBy: 'admin',
        views: 0,
        isActive: true
      },
      {
        title: 'Auto-Archive Test Announcement',
        description: 'This announcement should auto-archive in the past',
        category: 'Health',
        status: 'published',
        color: 'yellow',
        imageUrl: '',
        autoPublishDate: null,
        autoArchiveDate: pastDate,
        createdAt: now,
        updatedAt: now,
        createdBy: 'admin',
        views: 10,
        isActive: true
      },
      {
        title: 'Future Auto-Publish Test',
        description: 'This announcement should auto-publish in the future',
        category: 'Governance',
        status: 'draft',
        color: 'blue',
        imageUrl: '',
        autoPublishDate: futureDate,
        autoArchiveDate: null,
        createdAt: now,
        updatedAt: now,
        createdBy: 'admin',
        views: 0,
        isActive: true
      }
    ];
    
    const batch = db.batch();
    const testDocRefs = [];
    
    testAnnouncements.forEach((announcement) => {
      const docRef = db.collection('announcements').doc();
      batch.set(docRef, announcement);
      testDocRefs.push(docRef);
    });
    
    await batch.commit();
    console.log('✅ Created 3 test announcements');
    
    // Test 2: Check auto-management status via API
    console.log('\n2️⃣ Testing auto-management API...');
    
    const response = await fetch('http://localhost:3000/api/announcements/auto-manage', {
      method: 'GET'
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Auto-management check successful:');
      console.log(`   To publish: ${result.toPublish}`);
      console.log(`   To archive: ${result.toArchive}`);
    } else {
      console.log('❌ Auto-management check failed');
    }
    
    // Test 3: Execute auto-management
    console.log('\n3️⃣ Executing auto-management...');
    
    const executeResponse = await fetch('http://localhost:3000/api/announcements/auto-manage', {
      method: 'POST'
    });
    
    if (executeResponse.ok) {
      const result = await executeResponse.json();
      console.log('✅ Auto-management execution successful:');
      console.log(`   Published: ${result.published}`);
      console.log(`   Archived: ${result.archived}`);
    } else {
      console.log('❌ Auto-management execution failed');
    }
    
    // Test 4: Verify changes
    console.log('\n4️⃣ Verifying changes...');
    
    const snapshot = await db.collection('announcements')
      .where('title', 'in', testAnnouncements.map(a => a.title))
      .get();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   ${data.title}: ${data.status}`);
    });
    
    // Cleanup test data
    console.log('\n5️⃣ Cleaning up test data...');
    const cleanupBatch = db.batch();
    testDocRefs.forEach(docRef => {
      cleanupBatch.delete(docRef);
    });
    await cleanupBatch.commit();
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 Auto-management test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

async function main() {
  try {
    await testAutoManagement();
  } catch (error) {
    console.error('\n💥 Auto-management test failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the test
main(); 