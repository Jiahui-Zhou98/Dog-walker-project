import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = "pawsitiveWalks";

// ========== Expanded Data Pools ==========

const dogNames = [
  // Common names
  "Max",
  "Bella",
  "Charlie",
  "Luna",
  "Cooper",
  "Rocky",
  "Daisy",
  "Bailey",
  "Lucy",
  "Duke",
  "Sadie",
  "Jack",
  "Molly",
  "Buddy",
  "Maggie",
  "Bear",
  "Sophie",
  "Zeus",
  "Chloe",
  "Tucker",
  "Lola",
  "Oliver",
  "Zoe",
  "Leo",
  // Additional names
  "Milo",
  "Nala",
  "Thor",
  "Stella",
  "Finn",
  "Penny",
  "Oscar",
  "Ruby",
  "Murphy",
  "Rosie",
  "Gus",
  "Willow",
  "Teddy",
  "Pepper",
  "Archie",
  "Coco",
  "Winston",
  "Gracie",
  "Bentley",
  "Ellie",
  "Toby",
  "Millie",
  "Sam",
  "Ivy",
  "Harley",
  "Lily",
  "Apollo",
  "Maya",
  "Rex",
  "Hazel",
  "Louie",
  "Winnie",
];

const breeds = [
  // Common breeds
  "Golden Retriever",
  "Labrador Retriever",
  "German Shepherd",
  "Beagle",
  "Bulldog",
  "Poodle",
  "Siberian Husky",
  "Pembroke Welsh Corgi",
  "Dachshund",
  "Boxer",
  "Shiba Inu",
  "Boston Terrier",
  // Additional breeds
  "Pomeranian",
  "Yorkshire Terrier",
  "French Bulldog",
  "Chihuahua",
  "Border Collie",
  "Australian Shepherd",
  "Cocker Spaniel",
  "Maltese",
  "Cavalier King Charles Spaniel",
  "Shih Tzu",
  "Miniature Schnauzer",
  "Doberman Pinscher",
  "Great Dane",
  "Bernese Mountain Dog",
  "Rottweiler",
  "English Springer Spaniel",
  "Havanese",
  "Bichon Frise",
  "Akita",
  "Rhodesian Ridgeback",
  "Newfoundland",
  "West Highland White Terrier",
  "Shetland Sheepdog",
  "Basset Hound",
  "Pug",
  "Weimaraner",
  "Dalmatian",
  "Jack Russell Terrier",
  "Vizsla",
  "Samoyed",
  "Bull Terrier",
  "Mixed Breed",
];

const sizes = ["small", "medium", "large"];

const temperaments = ["friendly", "shy", "energetic", "calm"];

const frequencies = ["once", "daily", "weekly", "weekdays", "weekends"];

const times = ["morning", "afternoon", "evening"];

const statuses = ["open", "matched", "completed"];

const locations = [
  // Boston neighborhoods
  "Back Bay, Boston",
  "Fenway, Boston",
  "Allston, Boston",
  "Brighton, Boston",
  "South End, Boston",
  "Beacon Hill, Boston",
  "North End, Boston",
  "South Boston",
  "West End, Boston",
  "Downtown Boston",
  "Chinatown, Boston",
  "Bay Village, Boston",
  "Leather District, Boston",
  // Greater Boston
  "Brookline, MA",
  "Cambridge, MA",
  "Somerville, MA",
  "Jamaica Plain, Boston",
  "Dorchester, Boston",
  "Roxbury, Boston",
  "Roslindale, Boston",
  "West Roxbury, Boston",
  "Hyde Park, Boston",
  "Mattapan, Boston",
  // Nearby cities
  "Newton, MA",
  "Watertown, MA",
  "Medford, MA",
  "Malden, MA",
  "Quincy, MA",
  "Waltham, MA",
  "Arlington, MA",
  "Belmont, MA",
];

const ownerNames = [
  "Sarah Johnson",
  "Mike Chen",
  "Emily Davis",
  "James Wilson",
  "Lisa Brown",
  "David Lee",
  "Maria Garcia",
  "John Smith",
  "Anna Wang",
  "Tom Anderson",
  "Jennifer Martinez",
  "Chris Taylor",
  "Amanda Rodriguez",
  "Kevin Park",
  "Michelle Kim",
  "Brian O'Connor",
  "Samantha Green",
  "Daniel Nguyen",
  "Rachel Cohen",
  "Andrew Patel",
  "Jessica Liu",
  "Matthew White",
  "Laura Thompson",
  "Ryan Murphy",
  "Nicole Rossi",
  "Eric Zhang",
  "Ashley Santos",
  "Jason Lee",
  "Stephanie Adams",
  "Brandon Wu",
];

const specialNeedsList = [
  "", // 70% no special needs
  "",
  "",
  "",
  "",
  "",
  "",
  "Pulls on leash, needs harness",
  "Reactive to other dogs, needs space",
  "Senior dog, walks slowly",
  "Puppy, still learning leash manners",
  "Needs medication during walk",
  "Allergies to certain treats",
  "Fear of loud noises",
  "Must stay on sidewalk, fears grass",
  "Needs to be carried up stairs",
];

const socialNotes = [
  "Looking for walking buddies with friendly dogs!",
  "Would love to meet other Golden Retriever owners",
  "Seeking regular walking partners for weekend mornings",
  "My dog loves to socialize, happy to do group walks",
  "Looking to connect with other dog owners in the area",
  "Open to carpooling to nearby dog parks",
  "Interested in puppy playdate meetups",
  "Would enjoy walking with other large breed owners",
  "Hope to find friends for both me and my pup!",
  "New to the area, would love to meet fellow dog lovers",
];

// ========== Helper Functions ==========

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomBoolean(probability = 0.5) {
  return Math.random() < probability;
}

function randomDate(daysBack = 60) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date;
}

function randomFutureDate(daysAhead = 30) {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead));
  return date.toISOString().split("T")[0];
}

function randomIntInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getBudgetRangeByDuration(duration) {
  const budgetByDuration = {
    15: { min: 12, max: 22 },
    30: { min: 18, max: 32 },
    45: { min: 25, max: 42 },
    60: { min: 32, max: 55 },
  };

  return budgetByDuration[duration] || { min: 15, max: 50 };
}

// ========== Generate Request ==========

function generateRequest(index) {
  const createdDate = randomDate(60);
  const duration = [15, 30, 45, 60][Math.floor(Math.random() * 4)];
  const budgetRange = getBudgetRangeByDuration(duration);

  // 30% of requests are open to social interaction
  const isOpenToSocial = randomBoolean(0.3);

  return {
    dogName: randomItem(dogNames),
    breed: randomItem(breeds),
    age: Math.floor(Math.random() * 15) + 1,
    size: randomItem(sizes),
    temperament: randomItem(temperaments),
    specialNeeds: randomItem(specialNeedsList),

    frequency: randomItem(frequencies),
    preferredTime: randomItem(times),
    duration,
    startDate: randomFutureDate(30),

    location: randomItem(locations),
    pickupLocation: randomBoolean(0.7)
      ? "Apartment lobby"
      : "Building entrance",

    budget: randomIntInRange(budgetRange.min, budgetRange.max),

    ownerName: randomItem(ownerNames),
    ownerPhone: `617-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
    ownerEmail: `${randomItem(ownerNames).toLowerCase().replace(/ /g, ".")}${index}@example.com`,

    // Social interaction fields
    openToSocial: isOpenToSocial,
    socialNote: isOpenToSocial ? randomItem(socialNotes) : "",

    status: randomItem(statuses),

    createdAt: createdDate,
    updatedAt: createdDate,
  };
}

// ========== Main Function ==========

async function seedRequests() {
  console.log("\n🌱 Starting to generate 1000 dog walking requests...");
  console.log("📊 Data pools expanded:");
  console.log(`   - ${dogNames.length} dog names`);
  console.log(`   - ${breeds.length} breeds`);
  console.log(`   - ${locations.length} locations`);
  console.log(`   - ${ownerNames.length} owner names`);
  console.log(`   - ${socialNotes.length} social notes`);
  console.log("");

  const client = new MongoClient(URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB at:", URI);

    const db = client.db(dbName);
    const collection = db.collection("requests");

    // Clear old data
    const deleteResult = await collection.deleteMany({});
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} old documents`);

    // Generate 1000 requests
    console.log("🎲 Generating requests...");
    const requests = [];
    for (let i = 1; i <= 1000; i++) {
      requests.push(generateRequest(i));

      if (i % 200 === 0) {
        console.log(`   📝 Generated ${i}/1000...`);
      }
    }

    // Insert into database
    console.log("💾 Inserting into MongoDB...");
    const result = await collection.insertMany(requests);
    console.log(`✅ Success! Inserted ${result.insertedCount} requests`);

    // Statistics
    const stats = {
      total: await collection.countDocuments(),
      openRequests: await collection.countDocuments({ status: "open" }),
      withSocialNote: await collection.countDocuments({ openToSocial: true }),
      largeDogsCount: await collection.countDocuments({ size: "large" }),
      smallDogsCount: await collection.countDocuments({ size: "small" }),
      mediumDogsCount: await collection.countDocuments({ size: "medium" }),
    };

    console.log("\n📊 Database Statistics:");
    console.log(`   Total requests: ${stats.total}`);
    console.log(`   Open requests: ${stats.openRequests}`);
    console.log(
      `   Open to social: ${stats.withSocialNote} (${Math.round((stats.withSocialNote / stats.total) * 100)}%)`,
    );
    console.log(
      `   By size: Small=${stats.smallDogsCount}, Medium=${stats.mediumDogsCount}, Large=${stats.largeDogsCount}`,
    );
    console.log("");
    console.log("🎉 Sample request:");
    const sampleRequest = await collection.findOne({ openToSocial: true });
    console.log(JSON.stringify(sampleRequest, null, 2));
  } catch (error) {
    console.error("\n❌ Error seeding data:", error.message);
    console.error("   Make sure MongoDB is running!");
    console.error("   Try running: brew services start mongodb-community");
  } finally {
    await client.close();
    console.log("\n👋 Disconnected from MongoDB. All done!\n");
  }
}

seedRequests();
