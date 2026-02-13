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

function generateWalker(index) {
  const createdAt = randomDate();

  return {
    name: randomItem(walkerNames),
    email: `walker${index}@example.com`,
    phone: `617-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,

    experienceYears: Math.floor(Math.random() * 6),
    preferredDogSizes: sizes.filter(() => Math.random() > 0.4),

    availability: {
      weekdays: randomBoolean(0.7),
      weekends: randomBoolean(0.5),
      times: times.filter(() => Math.random() > 0.4),
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

async function seedWalkers() {
  console.log("🌱 Seeding walkers...");

  const client = new MongoClient(URI);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("walkers");

    await collection.deleteMany({});
    console.log("🗑️ Cleared old walkers");

    const walkers = [];
    for (let i = 1; i <= 200; i++) {
      walkers.push(generateWalker(i));
    }

    const result = await collection.insertMany(walkers);
    console.log(`✅ Inserted ${result.insertedCount} walkers`);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
  } finally {
    await client.close();
    console.log("👋 Done");
  }
}

seedWalkers();
