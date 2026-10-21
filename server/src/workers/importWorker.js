const { parentPort, workerData } = require("worker_threads");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const fileService = require("../services/fileService");
const companyService = require("../services/companyService");
const UploadedFile = require("../models/uploadedFile.model");

const { filePath, fileId, MONGO_URI, mimetype } = workerData;

// =======================================
// Normalize Function
// =======================================
const normalize = (str) =>
  String(str || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");

// =======================================
// Row Mapping
// =======================================
const mapRowToCompany = (row) => {
  const normalizedRowKeys = Object.keys(row);
  const consumedColumns = new Set(); // Track which columns are used for company fields

  // get(): finds first matching column and marks it as consumed
  const get = (keys, trackConsumed = true) => {
    for (const key of keys) {
      const normalizedKey = normalize(key);

      const foundKey = normalizedRowKeys.find((rk) => {
        const normalizedRowKey = normalize(rk);
        return (
          normalizedRowKey === normalizedKey ||
          normalizedRowKey.includes(normalizedKey) ||
          normalizedKey.includes(normalizedRowKey)
        );
      });

      if (
        foundKey &&
        row[foundKey] !== null &&
        row[foundKey] !== undefined
      ) {
        const value = String(row[foundKey]).trim();

        if (
          value !== "" &&
          value !== "-" &&
          value !== "--" &&
          value.toLowerCase() !== "nan" &&
          value.toLowerCase() !== "null" &&
          value.toLowerCase() !== "undefined" &&
          value.toLowerCase() !== "n/a"
        ) {
          if (trackConsumed) consumedColumns.add(foundKey);
          return value;
        }
      }
    }

    return undefined;
  };

  // getExcluding(): finds matching column but SKIPS columns already consumed by company fields
  const getExcluding = (keys) => {
    for (const key of keys) {
      const normalizedKey = normalize(key);

      const foundKey = normalizedRowKeys.find((rk) => {
        if (consumedColumns.has(rk)) return false; // Skip consumed columns
        const normalizedRowKey = normalize(rk);
        return (
          normalizedRowKey === normalizedKey ||
          normalizedRowKey.includes(normalizedKey) ||
          normalizedKey.includes(normalizedRowKey)
        );
      });

      if (
        foundKey &&
        row[foundKey] !== null &&
        row[foundKey] !== undefined
      ) {
        const value = String(row[foundKey]).trim();

        if (
          value !== "" &&
          value !== "-" &&
          value !== "--" &&
          value.toLowerCase() !== "nan" &&
          value.toLowerCase() !== "null" &&
          value.toLowerCase() !== "undefined" &&
          value.toLowerCase() !== "n/a"
        ) {
          return value;
        }
      }
    }

    return undefined;
  };

  // =======================================
  // 1. Extract Company Fields (these consume columns)
  // =======================================
  const company = {
    company_name: get([
      "company_name",
      "company name",
      "company",
      "business name",
      "organization",
      "organisation",
      "firm",
      "name",
    ]),

    phone: get([
      "phone",
      "mobile",
      "contact",
      "contact no",
      "contact no.",
      "contact number",
      "company phone",
      "company mobile",
      "telephone",
      "tel",
      "office number",
      "office phone",
    ]),

    website: get([
      "website",
      "website url",
      "site",
      "company website",
      "url",
      "domain",
      "web",
    ]),

    email: get([
      "email",
      "email id",
      "emailid",
      "mail",
      "company email",
      "official email",
    ]),

    industry: get([
      "industry",
      "business type",
      "sector",
      "category",
      "domain",
    ]),

    city: get([
      "city",
      "town",
      "location",
      "district",
    ]),

    state: get([
      "state",
      "province",
      "region",
    ]),

    country: get([
      "country",
      "nation",
    ]),

    // Social Media will be handled below via full row scan
    socialMedia: {
        facebook: [],
        youtube: [],
        instagram: [],
        x: [],
        linkedin: []
    },

    companyOwnerName: get([
      "owner",
      "owner name",
      "company owner",
      "business owner",
      "founder",
      "founder name",
      "ceo",
      "director",
      "managing director",
      "proprietor",
    ]),

    turnover: get([
      "turnover",
      "revenue",
      "annual revenue",
      "income",
      "sales",
    ]),

    source: "excel",
  };

  // =======================================
  // 2. Extract Employee Contact Fields (strictly contact number only)
  // =======================================
  const employeePhone = getExcluding([
    "employee contact",
    "employee phone",
    "employee mobile",
    "employee number",
    "employee contact number",
    "employee contact no",
    "employee contact no.",
    "alternate contact",
    "alternate phone",
    "alternate mobile",
    "alternate no",
    "alternate number",
    "secondary contact",
    "secondary phone",
    "secondary mobile",
    "other contact",
    "other phone",
    "other mobile",
    "contact 2",
    "phone 2",
    "mobile 2",
    "tel 2",
    "contact no 2",
    "contact no",
    "contact no.",
    "contact number",
    "mobile number",
    "phone number",
    "employee telephone",
    "phone",
    "mobile",
    "telephone",
    "tel",
    "contact",
  ]);

  company.contacts = [
    {
      name: null,
      position: null,
      contactNumber: employeePhone || "",
      email: null,
    },
  ];

  Object.keys(company).forEach((key) => {
    if (
      company[key] === undefined ||
      company[key] === null ||
      company[key] === ""
    ) {
      delete company[key];
    }
  });

  // =======================================
  // 3. Extract Social Media Links
  // =======================================
  
  // Create a concatenated string of all values in the row to scan for URLs
  const rowString = Object.values(row)
    .filter(val => val !== null && val !== undefined)
    .join(" ");

  const extractLinks = (regex) => {
    const matches = [...rowString.matchAll(regex)];
    const uniqueUrls = [...new Set(matches.map(m => m[0].trim()))].slice(0, 3);
    return uniqueUrls.map(url => ({ url, username: "" }));
  };

  // Regular expressions to match platforms (case insensitive)
  const fbRegex = /https?:\/\/(www\.)?(facebook\.com|fb\.com)\/[a-zA-Z0-9.-]+/gi;
  const ytRegex = /https?:\/\/(www\.)?youtube\.com\/(channel\/|user\/|c\/|@)?[a-zA-Z0-9_-]+/gi;
  const igRegex = /https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._-]+/gi;
  const xRegex = /https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+/gi;
  const liRegex = /https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-]+/gi;

  if (company.socialMedia) {
    company.socialMedia.facebook = extractLinks(fbRegex);
    company.socialMedia.youtube = extractLinks(ytRegex);
    company.socialMedia.instagram = extractLinks(igRegex);
    company.socialMedia.x = extractLinks(xRegex);
    company.socialMedia.linkedin = extractLinks(liRegex);
  }

  // =======================================
  // 4. Duplicate Key
  // =======================================
  const c_company = (company.company_name || "").toLowerCase().trim();
  const c_city = (company.city || "").toLowerCase().trim();
  const c_email = (company.email || "").toLowerCase().trim();
  
  if (c_company || c_city || c_email) {
    company.companyNameNormalized = c_company || null;
    company.cityNormalized = c_city || null;
    company.emailNormalized = c_email || null;
    company.duplicateKey = c_company || null;
  }

  return company;
};

// Helper for formatting ETA seconds into readable string (e.g., "18m" or "45s")
const formatETA = (seconds) => {
  if (!seconds || seconds <= 0 || !isFinite(seconds)) return "0s";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs > 0 ? `${secs}s` : ""}`.trim();
};

// =======================================
// Worker Streaming Main Execution
// =======================================
const run = async () => {
  let dbConnection = null;
  const startTime = Date.now();

  try {
    console.log(`[Worker Started] File ID: ${fileId} | Worker PID: ${process.pid}`);

    dbConnection = await mongoose.connect(MONGO_URI);
    const uploadedDoc = await UploadedFile.findById(fileId);
    if (!uploadedDoc) {
      throw new Error(`UploadedFile document not found: ${fileId}`);
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`Physical file not found at path: ${filePath}`);
    }

    // Configurable chunk size
    const IMPORT_CHUNK_SIZE = parseInt(process.env.IMPORT_CHUNK_SIZE) || 2000;
    const CHUNK_SIZE = IMPORT_CHUNK_SIZE;
    const fileSize = fs.statSync(filePath).size || 1000;
    const estBytesPerRow = (mimetype && mimetype.includes("sheet")) ? 40 : 80;
    const estimatedTotalRecords = uploadedDoc.totalRecords > 0 ? uploadedDoc.totalRecords : Math.max(1000, Math.round(fileSize / estBytesPerRow));
    const estimatedTotalChunks = Math.ceil(estimatedTotalRecords / CHUNK_SIZE);

    // Resume capability: check last completed offset
    const startOffset = uploadedDoc.processedRecords || 0;
    let processedSoFar = startOffset;
    let totalInserted = uploadedDoc.insertedRecords || 0;
    let totalUpdated = uploadedDoc.updatedRecords || 0;
    let totalSkippedDuplicates = uploadedDoc.skippedDuplicates || 0;
    let currentChunkIndex = Math.floor(startOffset / CHUNK_SIZE);

    if (startOffset > 0) {
      console.log(`[Resume] Resuming import from checkpoint offset: ${startOffset} rows`);
    }

    await UploadedFile.findByIdAndUpdate(fileId, {
      status: "processing",
      totalRecords: estimatedTotalRecords,
      progress: Math.max(1, uploadedDoc.progress || 1)
    });

    let batch = [];
    let rowScanIndex = 0;
    const localSeenKeys = new Set(); // Fast in-memory intra-file dedup tracking

    // Stream file rows with constant memory footprint
    for await (const rawRow of fileService.streamFileRows(filePath, mimetype)) {
      const company = mapRowToCompany(rawRow);
      if (!company || Object.keys(company).length <= 1 || !company.company_name) {
        continue;
      }

      // If resuming, skip rows already completed before crash
      if (rowScanIndex < startOffset) {
        rowScanIndex++;
        if (company.duplicateKey) localSeenKeys.add(company.duplicateKey);
        continue;
      }

      rowScanIndex++;
      company._rowNumber = rowScanIndex;
      batch.push(company);

      // Process batch when CHUNK_SIZE is reached
      if (batch.length >= CHUNK_SIZE) {
        currentChunkIndex++;
        const startRow = processedSoFar + 1;
        const endRow = processedSoFar + batch.length;
        const { inserted, updated, skipped } = await processBatchChunk(batch, fileId, localSeenKeys, {
          batchNumber: currentChunkIndex,
          startRow,
          endRow
        });
        
        totalInserted += inserted;
        totalUpdated += updated;
        totalSkippedDuplicates += skipped;
        processedSoFar += batch.length;

        const progressPercent = Math.min(98, Math.round((processedSoFar / Math.max(processedSoFar + 100, estimatedTotalRecords)) * 100));

        const elapsedSec = (Date.now() - startTime) / 1000;
        const rowsPerSec = elapsedSec > 0 ? Math.round((processedSoFar - startOffset) / elapsedSec) : 0;
        const remainingRows = Math.max(0, estimatedTotalRecords - processedSoFar);
        const etaSec = rowsPerSec > 0 ? Math.round(remainingRows / rowsPerSec) : 0;
        const etaFormatted = formatETA(etaSec);

        // Update DB checkpoint and broadcast live progress
        await UploadedFile.findByIdAndUpdate(fileId, {
          totalRecords: Math.max(estimatedTotalRecords, processedSoFar),
          processedRecords: processedSoFar,
          insertedRecords: totalInserted,
          updatedRecords: totalUpdated,
          skippedDuplicates: totalSkippedDuplicates,
          progress: progressPercent,
          speed: rowsPerSec,
          eta: etaSec,
          lastCheckpoint: processedSoFar
        });

        parentPort.postMessage({
          type: "progress",
          progress: progressPercent,
          totalRecords: Math.max(estimatedTotalRecords, processedSoFar),
          processedRecords: processedSoFar,
          insertedRecords: totalInserted,
          updatedRecords: totalUpdated,
          skippedDuplicates: totalSkippedDuplicates,
          speed: rowsPerSec,
          eta: etaSec
        });

        console.log(`\nBatch ${currentChunkIndex}/${estimatedTotalChunks}\nRows ${startRow}-${endRow}\nInserted ${inserted}\nSkipped ${skipped}\nProgress ${progressPercent}%\nSpeed ${rowsPerSec} rows/sec\nETA ${etaFormatted}\n`);

        // Free memory immediately
        batch = [];
      }
    }

    // Process remaining trailing batch
    if (batch.length > 0) {
      currentChunkIndex++;
      const startRow = processedSoFar + 1;
      const endRow = processedSoFar + batch.length;
      const { inserted, updated, skipped } = await processBatchChunk(batch, fileId, localSeenKeys, {
        batchNumber: currentChunkIndex,
        startRow,
        endRow
      });
      
      totalInserted += inserted;
      totalUpdated += updated;
      totalSkippedDuplicates += skipped;
      processedSoFar += batch.length;

      const progressPercent = Math.min(100, Math.round((processedSoFar / Math.max(processedSoFar, estimatedTotalRecords)) * 100));
      const elapsedSec = (Date.now() - startTime) / 1000;
      const rowsPerSec = elapsedSec > 0 ? Math.round((processedSoFar - startOffset) / elapsedSec) : 0;
      const etaFormatted = "0s";

      console.log(`\nBatch ${currentChunkIndex}/${estimatedTotalChunks}\nRows ${startRow}-${endRow}\nInserted ${inserted}\nSkipped ${skipped}\nProgress ${progressPercent}%\nSpeed ${rowsPerSec} rows/sec\nETA ${etaFormatted}\n`);
      batch = [];
    }

    // Final completion update
    await UploadedFile.findByIdAndUpdate(fileId, {
      status: "completed",
      progress: 100,
      totalRecords: processedSoFar, // Exact total record count
      processedRecords: processedSoFar,
      insertedRecords: totalInserted,
      updatedRecords: totalUpdated,
      skippedDuplicates: totalSkippedDuplicates,
      speed: 0,
      eta: 0,
      lastCheckpoint: processedSoFar
    });

    parentPort.postMessage({
      type: "progress",
      progress: 100,
      totalRecords: processedSoFar,
      processedRecords: processedSoFar,
      insertedRecords: totalInserted,
      updatedRecords: totalUpdated,
      skippedDuplicates: totalSkippedDuplicates,
      speed: 0,
      eta: 0
    });

    console.log(`[Completed] File ID: ${fileId} | Total Processed: ${processedSoFar} | Inserted: ${totalInserted} | Skipped Duplicates: ${totalSkippedDuplicates}`);
    parentPort.postMessage({
      success: true,
      inserted: totalInserted,
      updated: totalUpdated,
      skippedDuplicates: totalSkippedDuplicates
    });

  } catch (err) {
    console.error(`[Error] Worker failed for File ID: ${fileId}:`, err);
    try {
      await UploadedFile.findByIdAndUpdate(fileId, {
        status: "failed",
        errorMessage: err.message || "An unexpected error occurred during processing."
      });
    } catch (dbErr) {
      console.error("[Error] Failed to write failure status to DB:", dbErr);
    }
    parentPort.postMessage({ success: false, error: err.message });
  } finally {
    if (dbConnection) {
      await mongoose.connection.close();
    }
    console.log("[Worker Exit] Thread execution finished.");
    process.exit(0);
  }
};

// Helper function to process individual chunks while preserving existing duplicate business logic
async function processBatchChunk(chunk, fileId, localSeenKeys, options = {}) {
  let skippedCount = 0;

  // 1. Local fast in-memory dedup within chunk
  const uniqueInChunk = [];
  for (const c of chunk) {
    if (c.duplicateKey && localSeenKeys.has(c.duplicateKey)) {
      skippedCount++;
      continue;
    }
    if (c.duplicateKey) localSeenKeys.add(c.duplicateKey);
    uniqueInChunk.push(c);
  }

  if (uniqueInChunk.length === 0) {
    return { inserted: 0, updated: 0, skipped: skippedCount };
  }

  // 2. Database covered duplicate check
  const dupCheck = await companyService.checkDuplicateData(uniqueInChunk);
  let chunkToInsert = uniqueInChunk;

  if (dupCheck.duplicateCount > 0) {
    const dupSet = new Set(
      dupCheck.duplicates
        .filter((d) => d.company_name)
        .map((d) => String(d.company_name).toLowerCase().trim())
    );

    chunkToInsert = uniqueInChunk.filter((c) => {
      const name = c.company_name && String(c.company_name).toLowerCase().trim();
      return !name || !dupSet.has(name);
    });
  }

  const dbSkipped = uniqueInChunk.length - chunkToInsert.length;
  skippedCount += dbSkipped;

  let insertedCount = 0;
  let updatedCount = 0;

  if (chunkToInsert.length > 0) {
    const writeRes = await companyService.bulkInsertCompanies(chunkToInsert, fileId, {
      ...options,
      skippedDuplicates: skippedCount
    });
    insertedCount = writeRes.inserted || 0;
    updatedCount = writeRes.updated || 0;
  }

  return { inserted: insertedCount, updated: updatedCount, skipped: skippedCount };
}

run();
