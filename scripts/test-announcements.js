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

async function testAnnouncementsCollection() {
  try {
    console.log('🧪 Testing Announcements Collection');
    console.log('===================================\n');
    
    // Test 1: Check if collection exists and has data
    console.log('1️⃣ Testing collection access...');
    const snapshot = await db.collection('announcements').get();
    
    if (snapshot.empty) {
      console.log('❌ No announcements found. Run setup first: npm run setup-announcements');
      return;
    }
    
    console.log(`✅ Found ${snapshot.size} announcements in collection`);
    
    // Test 2: Test querying published announcements
    console.log('\n2️⃣ Testing published announcements query...');
    const publishedSnapshot = await db.collection('announcements')
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .limit(3)
      .get();
    
    console.log(`✅ Found ${publishedSnapshot.size} published announcements`);
    
    // Test 3: Test querying by category
    console.log('\n3️⃣ Testing category-based queries...');
    const categories = ['Community', 'Health', 'Governance', 'Education', 'Safety', 'Events'];
    
    for (const category of categories) {
      const categorySnapshot = await db.collection('announcements')
        .where('category', '==', category)
        .get();
      
      console.log(`   ${category}: ${categorySnapshot.size} announcements`);
    }
    
    // Test 4: Display sample data
    console.log('\n4️⃣ Sample announcement data:');
    const sampleDoc = snapshot.docs[0];
    const sampleData = sampleDoc.data();
    
    console.log('   Document ID:', sampleDoc.id);
    console.log('   Title:', sampleData.title);
    console.log('   Category:', sampleData.category);
    console.log('   Status:', sampleData.status);
    console.log('   Created:', sampleData.createdAt?.toDate?.() || sampleData.createdAt);
    console.log('   Views:', sampleData.views || 0);
    
    // Test 5: Test API endpoint simulation
    console.log('\n5️⃣ Testing API endpoint simulation...');
    
    // Simulate GET /api/announcements
    const allAnnouncements = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
    }));
    
    console.log(`✅ API simulation: ${allAnnouncements.length} announcements retrieved`);
    
    // Simulate GET /api/announcements?status=published&limit=3
    const publishedAnnouncements = allAnnouncements
      .filter(a => a.status === 'published')
      .slice(0, 3);
    
    console.log(`✅ API simulation with filters: ${publishedAnnouncements.length} published announcements`);
    
    console.log('\n🎉 All tests passed!');
    console.log('\n📋 Collection Statistics:');
    console.log(`   Total announcements: ${snapshot.size}`);
    console.log(`   Published: ${publishedSnapshot.size}`);
    console.log(`   Draft: ${allAnnouncements.filter(a => a.status === 'draft').length}`);
    console.log(`   Archived: ${allAnnouncements.filter(a => a.status === 'archived').length}`);
    
    // Category breakdown
    const categoryStats = {};
    allAnnouncements.forEach(announcement => {
      categoryStats[announcement.category] = (categoryStats[announcement.category] || 0) + 1;
    });
    
    console.log('\n📊 Category Breakdown:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

async function main() {
  try {
    await testAnnouncementsCollection();
  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the tests
main(); 