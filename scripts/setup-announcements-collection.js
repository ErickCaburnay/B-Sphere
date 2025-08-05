const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();

// Helper function to safely get and format private key
function getPrivateKey() {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) {
    return null;
  }
  
  // Handle different private key formats
  try {
    // If it's a JSON string, parse it
    if (privateKey.startsWith('{')) {
      const parsed = JSON.parse(privateKey);
      return parsed.private_key || parsed.privateKey || privateKey;
    }
    
    // Handle escaped newlines
    return privateKey.replace(/\\n/g, '\n');
  } catch (error) {
    // If parsing fails, try to use as-is with newline replacement
    return privateKey.replace(/\\n/g, '\n');
  }
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = getPrivateKey();

if (!projectId || !clientEmail || !privateKey) {
  console.error('Firebase Admin SDK environment variables are not properly configured');
  console.error('Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
  process.exit(1);
}

// Initialize Firebase Admin
const serviceAccount = {
  projectId,
  clientEmail,
  privateKey,
};

const app = initializeApp({
  credential: cert(serviceAccount),
  projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
});

const db = getFirestore(app);

// Sample announcements data
const sampleAnnouncements = [
  {
    title: "Monthly Barangay Clean-up Drive",
    description: "Join us this Saturday at 8 AM for our monthly clean-up drive. Let's work together to keep our barangay clean and beautiful. All residents are encouraged to participate. Bring your own cleaning materials.",
    category: "Community",
    status: "published",
    color: "green",
    imageUrl: "",
    autoPublishDate: null,
    autoArchiveDate: null,
    createdAt: new Date("2025-01-20"),
    updatedAt: new Date("2025-01-20"),
    createdBy: "admin",
    views: 45,
    isActive: true
  },
  {
    title: "Vaccination Schedule Update",
    description: "The next vaccination schedule will be on the 15th of this month at the barangay health center. Be sure to register online through our website or visit the barangay hall for assistance. Priority will be given to senior citizens and persons with comorbidities.",
    category: "Health",
    status: "published",
    color: "yellow",
    imageUrl: "",
    autoPublishDate: null,
    autoArchiveDate: null,
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15"),
    createdBy: "admin",
    views: 78,
    isActive: true
  },
  {
    title: "Barangay Council Meeting",
    description: "Attend the Barangay Council meeting on the 10th. Important decisions regarding local projects and budgets will be discussed. All residents are welcome to attend and voice their concerns. Meeting will be held at the barangay hall.",
    category: "Governance",
    status: "published",
    color: "blue",
    imageUrl: "",
    autoPublishDate: null,
    autoArchiveDate: null,
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-10"),
    createdBy: "admin",
    views: 32,
    isActive: true
  },
  {
    title: "Educational Scholarship Program",
    description: "Applications are now open for the barangay educational scholarship program. This program aims to support deserving students from low-income families. Requirements and application forms are available at the barangay hall.",
    category: "Education",
    status: "published",
    color: "purple",
    imageUrl: "",
    autoPublishDate: null,
    autoArchiveDate: null,
    createdAt: new Date("2025-01-05"),
    updatedAt: new Date("2025-01-05"),
    createdBy: "admin",
    views: 56,
    isActive: true
  },
  {
    title: "Community Safety Awareness",
    description: "Join our community safety awareness program this weekend. Learn about emergency preparedness, fire safety, and crime prevention. The program will include practical demonstrations and free safety kits for participants.",
    category: "Safety",
    status: "published",
    color: "red",
    imageUrl: "",
    autoPublishDate: null,
    autoArchiveDate: null,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    createdBy: "admin",
    views: 89,
    isActive: true
  },
  {
    title: "Barangay Fiesta Celebration",
    description: "Save the date for our annual barangay fiesta celebration! This year's theme is 'Unity in Diversity'. The celebration will include cultural performances, food festivals, and various competitions. More details to be announced soon.",
    category: "Events",
    status: "draft",
    color: "pink",
    imageUrl: "",
    autoPublishDate: null,
    autoArchiveDate: null,
    createdAt: new Date("2024-12-28"),
    updatedAt: new Date("2024-12-28"),
    createdBy: "admin",
    views: 0,
    isActive: true
  }
];

async function setupAnnouncementsCollection() {
  try {
    console.log('🚀 Setting up announcements collection...');
    
    // Check if collection exists and has data
    const snapshot = await db.collection('announcements').limit(1).get();
    
    if (!snapshot.empty) {
      console.log('⚠️  Announcements collection already exists with data. Skipping setup.');
      return;
    }
    
    // Add sample announcements
    const batch = db.batch();
    
    sampleAnnouncements.forEach((announcement, index) => {
      const docRef = db.collection('announcements').doc();
      batch.set(docRef, {
        ...announcement,
        id: docRef.id // Add the document ID to the data
      });
    });
    
    await batch.commit();
    
    console.log('✅ Successfully created announcements collection with sample data!');
    console.log(`📊 Added ${sampleAnnouncements.length} sample announcements`);
    
    // Display the created announcements
    console.log('\n📋 Sample announcements created:');
    sampleAnnouncements.forEach((announcement, index) => {
      console.log(`${index + 1}. ${announcement.title} (${announcement.category}) - ${announcement.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error setting up announcements collection:', error);
    throw error;
  }
}

async function createCollectionIndexes() {
  try {
    console.log('\n🔧 Setting up collection indexes...');
    
    // Create indexes for better query performance
    const indexes = [
      {
        collectionGroup: 'announcements',
        queryScope: 'COLLECTION',
        fields: [
          { fieldPath: 'status', order: 'ASCENDING' },
          { fieldPath: 'createdAt', order: 'DESCENDING' }
        ]
      },
      {
        collectionGroup: 'announcements',
        queryScope: 'COLLECTION',
        fields: [
          { fieldPath: 'category', order: 'ASCENDING' },
          { fieldPath: 'createdAt', order: 'DESCENDING' }
        ]
      },
      {
        collectionGroup: 'announcements',
        queryScope: 'COLLECTION',
        fields: [
          { fieldPath: 'isActive', order: 'ASCENDING' },
          { fieldPath: 'status', order: 'ASCENDING' },
          { fieldPath: 'createdAt', order: 'DESCENDING' }
        ]
      }
    ];
    
    console.log('📝 Note: Indexes will be created automatically when queries are first executed.');
    console.log('💡 You can also create them manually in the Firebase Console under Firestore > Indexes');
    
  } catch (error) {
    console.error('❌ Error setting up indexes:', error);
  }
}

async function main() {
  try {
    console.log('🎯 Firebase Announcements Collection Setup');
    console.log('==========================================\n');
    
    await setupAnnouncementsCollection();
    await createCollectionIndexes();
    
    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📖 Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Navigate to System Management > Announcements');
    console.log('3. Test creating, editing, and deleting announcements');
    console.log('4. Check the landing page to see published announcements');
    
  } catch (error) {
    console.error('\n💥 Setup failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the setup
main(); 