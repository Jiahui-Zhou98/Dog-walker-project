import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = "pawsitiveWalks";

// ===== Walker Data Pools =====

const walkerNames = [
  "Alex Chen",
  "Mia Johnson",
  "Ryan Park",
  "Emily Wong",
  "Daniel Kim",
  "Sophia Lee",
  "Jason Wu",
  "Olivia Brown",
  "Kevin Zhang",
  "Hannah Miller",
];

const bios = [
  "Experienced dog walker who loves long walks",
  "Great with puppies and senior dogs",
  "Patient, calm, and safety-focused",
  "Energetic walker for high-energy dogs",
  "Reliable and punctual, safety first",
];

const sizes = ["small", "medium", "large"];
const times = ["morning", "afternoon", "evening"];
const locations = [
  "Cambridge, MA",
  "Somerville, MA",
  "Brookline, MA",
  "Allston, Boston",
  "Brighton, Boston",
];

// ========== Helper Functions ==========

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBoolean(p = 0.5) {
  return Math.random() < p;
}

function randomDate(daysBack = 120) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  return d;
}

// ========== Generate Walker ==========

function generateWalker(index) {
  const createdAt = randomDate();

  // Ensure these arrays are not empty (optional but prevents weird empty data)
  const preferredDogSizes = sizes.filter(() => Math.random() > 0.4);
  if (preferredDogSizes.length === 0) preferredDogSizes.push(randomItem(sizes));

  const availableTimes = times.filter(() => Math.random() > 0.4);
  if (availableTimes.length === 0) availableTimes.push(randomItem(times));

  return {
    name: randomItem(walkerNames),
    email: `walker${index}@example.com`,
    phone: `617-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,

    experienceYears: Math.floor(Math.random() * 6),
    preferredDogSizes,

    availability: {
      weekdays: randomBoolean(0.7),
      weekends: randomBoolean(0.5),
      times: availableTimes,
    },

    maxDogsPerWalk: Math.floor(Math.random() * 3) + 1,
    hourlyRate: Math.floor(Math.random() * 15) + 20,

    serviceAreas: [randomItem(locations)],
    openToGroupWalks: randomBoolean(0.6),

    bio: randomItem(bios),
    rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
    completedWalks: Math.floor(Math.random() * 200),

    createdAt,
    updatedAt: createdAt,
  };
}

// ========== Main Function ==========

async function seedWalkers() {
  console.log("\n🌱 Starting to generate 1000 walkers...");
  console.log("📊 Data pools:");
  console.log(`   - ${walkerNames.length} walker names`);
  console.log(`   - ${bios.length} bios`);
  console.log(`   - ${sizes.length} dog sizes`);
  console.log(`   - ${times.length} time slots`);
  console.log(`   - ${locations.length} locations`);
  console.log("");

  const client = new MongoClient(URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB at:", URI);

    const db = client.db(dbName);
    const collection = db.collection("walkers");

    // Clear old data
    const deleteResult = await collection.deleteMany({});
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} old documents`);

    // Generate walkers
    console.log("🎲 Generating walkers...");
    const walkers = [];
    const TOTAL = 1000;

    for (let i = 1; i <= TOTAL; i++) {
      walkers.push(generateWalker(i));

      if (i % 200 === 0) {
        console.log(`   📝 Generated ${i}/${TOTAL}...`);
      }
    }

    // Insert into database
    console.log("💾 Inserting into MongoDB...");
    const result = await collection.insertMany(walkers);
    console.log(`✅ Success! Inserted ${result.insertedCount} walkers`);

    // Statistics (similar vibe to seedRequests)
    const stats = {
      total: await collection.countDocuments(),
      openToGroupWalks: await collection.countDocuments({ openToGroupWalks: true }),
      morningAvailable: await collection.countDocuments({ "availability.times": "morning" }),
      smallPref: await collection.countDocuments({ preferredDogSizes: "small" }),
      mediumPref: await collection.countDocuments({ preferredDogSizes: "medium" }),
      largePref: await collection.countDocuments({ preferredDogSizes: "large" }),
    };

    console.log("\n📊 Database Statistics:");
    console.log(`   Total walkers: ${stats.total}`);
    console.log(
      `   Open to group walks: ${stats.openToGroupWalks} (${Math.round((stats.openToGroupWalks / stats.total) * 100)}%)`,
    );
    console.log(
      `   Available in the morning: ${stats.morningAvailable} (${Math.round((stats.morningAvailable / stats.total) * 100)}%)`,
    );
    console.log(
      `   Preferred sizes (counts): Small=${stats.smallPref}, Medium=${stats.mediumPref}, Large=${stats.largePref}`,
    );

    console.log("\n🎉 Sample walker:");
    const sampleWalker = await collection.findOne({ openToGroupWalks: true });
    console.log(JSON.stringify(sampleWalker, null, 2));
  } catch (error) {
    console.error("\n❌ Error seeding data:", error.message);
    console.error("   Make sure MongoDB is running!");
    console.error("   If on Mac with Homebrew, try: brew services start mongodb-community");
  } finally {
    await client.close();
    console.log("\n👋 Disconnected from MongoDB. All done!\n");
  }
}

seedWalkers();
