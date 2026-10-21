const mongoose = require("mongoose");
const Company = require("../models/company.model");
const dotenv = require("dotenv");

// Load env vars
dotenv.config({ path: __dirname + "/../../.env" });

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    const collection = mongoose.connection.db.collection('companies');
    const companies = await collection.find({}).toArray();
    console.log(`Found ${companies.length} companies to migrate.`);

    let migratedCount = 0;

    for (const company of companies) {
      let changed = false;
      const platforms = ["facebook", "youtube", "instagram", "x", "linkedin"];
      
      if (!company.socialMedia) {
        company.socialMedia = { facebook: [], youtube: [], instagram: [], x: [], linkedin: [] };
        changed = true;
      }

      for (const platform of platforms) {
        if (company.socialMedia && typeof company.socialMedia[platform] === "string" && company.socialMedia[platform].trim() !== "") {
          const url = company.socialMedia[platform].trim();
          company.socialMedia[platform] = [{ url, username: "" }];
          changed = true;
        } else if (company.socialMedia && typeof company.socialMedia[platform] === "string") {
            company.socialMedia[platform] = [];
            changed = true;
        } else if (company.socialMedia && !company.socialMedia[platform]) {
            company.socialMedia[platform] = [];
            changed = true;
        }
      }

      if (changed) {
        await collection.updateOne({ _id: company._id }, { $set: { socialMedia: company.socialMedia } });
        migratedCount++;
      }
    }

    console.log(`Migration complete. Migrated ${migratedCount} companies.`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrate();
