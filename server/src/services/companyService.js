const mongoose = require("mongoose");
const Company = require("../models/company.model");
const ImportFailure = require("../models/importFailure.model");
const FailedBatch = require("../models/failedBatch.model");
const UploadedFile = require("../models/uploadedFile.model");

// ==========================================
// BULK INSERT COMPANIES
// ==========================================

const bulkInsertCompanies = async (
  companies,
  fileId,
  options = {}
) => {
  try {
    // ==============================
    // Validate Array
    // ==============================

    if (
      !Array.isArray(companies) ||
      companies.length === 0
    ) {
      return {
        inserted: 0,
        updated: 0,
      };
    }

    // ==============================
    // Remove Invalid Rows
    // company_name required
    // ==============================

    const validCompanies = companies.filter(
      (c) =>
        c &&
        typeof c === "object" &&
        c.company_name &&
        String(c.company_name).trim() !== ""
    );

    if (validCompanies.length === 0) {
      return {
        inserted: 0,
        updated: 0,
      };
    }

    // ==============================
    // Process in Chunks
    // ==============================

    const INSERT_BATCH_SIZE = parseInt(process.env.INSERT_BATCH_SIZE) || 1000;
    let totalInserted = 0;
    let totalUpdated = 0;

    for (let i = 0; i < validCompanies.length; i += INSERT_BATCH_SIZE) {
      const chunk = validCompanies.slice(i, i + INSERT_BATCH_SIZE);

      const ops = chunk.map((c) => {
        // Clean Undefined Values
        const cleanedDoc = {};

        Object.keys(c).forEach((key) => {
          if (
            key !== "_rowNumber" &&
            c[key] !== undefined &&
            c[key] !== null &&
            c[key] !== ""
          ) {
            cleanedDoc[key] = c[key];
          }
        });

        // attach file id
        cleanedDoc.fileId = fileId;

        // For import we will not upsert by company_name (company_name is not unique).
        // Instead, bulk insertion will be handled after duplicates (city+email) are filtered
        // by the worker. Here we prepare cleaned documents for insertion.
        return cleanedDoc;
      });
      // Insert chunk documents using high-performance MongoDB bulkWrite
      if (ops.length > 0) {
        const bulkOps = ops.map((doc) => ({
          insertOne: {
            document: doc,
          },
        }));
        try {
          const writeResult = await Company.bulkWrite(bulkOps, { ordered: false });
          totalInserted += writeResult.insertedCount || 0;
        } catch (err) {
          const insertedBeforeFailure = (err.result && err.result.insertedCount) || err.insertedCount || 0;
          totalInserted += insertedBeforeFailure;

          const writeErrors = err.writeErrors || (err.result && typeof err.result.getWriteErrors === "function" ? err.result.getWriteErrors() : (err.result && err.result.writeErrors ? err.result.writeErrors : []));
          const mongoErrorCode = err.code || (writeErrors[0] && writeErrors[0].code) || null;
          const mongoErrorMessage = err.message || (writeErrors[0] && (writeErrors[0].errmsg || writeErrors[0].message)) || "Bulk write error";

          console.log(`\n[FAILED BATCH]\nFile: ${fileId}\nBatch: ${options.batchNumber || 1}\nRows: ${options.startRow || 0}-${options.endRow || 0}\nInserted: ${insertedBeforeFailure}\nSkipped: ${options.skippedDuplicates || 0}\nReason: ${mongoErrorMessage}\nTimestamp: ${new Date().toISOString()}\n`);
          console.log(`\nFAILED Batch ${options.batchNumber || 1}\nRows ${options.startRow || 0}-${options.endRow || 0}\nReason ${mongoErrorMessage}\nMongo Code ${mongoErrorCode}\nCheckpoint Saved\n`);

          try {
            await FailedBatch.create({
              fileId,
              batchNumber: options.batchNumber || 1,
              startRow: options.startRow || 0,
              endRow: options.endRow || 0,
              recordsInBatch: chunk.length,
              insertedBeforeFailure,
              skippedDuplicates: options.skippedDuplicates || 0,
              mongoErrorMessage,
              mongoErrorCode
            });

            await UploadedFile.findByIdAndUpdate(fileId, {
              lastFailedBatch: options.batchNumber || 1,
              errorMessage: mongoErrorMessage
            });
          } catch (logErr) {
            console.error("Error logging failed batch:", logErr.message);
          }

          if (writeErrors && writeErrors.length > 0) {
            const failureDocs = writeErrors.map((we) => {
              const failedOp = chunk[we.index || 0] || {};
              return {
                fileId,
                batchNumber: options.batchNumber || 1,
                rowNumber: failedOp._rowNumber || (options.startRow ? options.startRow + (we.index || 0) : 0),
                companyName: failedOp.company_name || null,
                duplicateKey: failedOp.duplicateKey || null,
                error: we.errmsg || we.message || String(we),
                errorCode: we.code || null
              };
            });
            try {
              await ImportFailure.insertMany(failureDocs, { ordered: false });
            } catch (failInsertErr) {
              console.error("Failed to insert into ImportFailures:", failInsertErr.message);
            }
          }
        }
      }
    }

    return {
      inserted: totalInserted,
      updated: totalUpdated,
    };
  } catch (err) {
    console.error(
      "MongoDB BulkWrite Error:",
      err
    );

    throw err;
  }
};

// ==========================================
// BUILD FILTER QUERY
// ==========================================

const addStatusFilter = (query, statusVal) => {
  if (!statusVal || statusVal === 'All Statuses' || statusVal === 'all') return;

  let statusCondition = null;
  if (statusVal === 'New') {
    statusCondition = {
      $or: [
        { 'leadStatus.status': 'New' },
        { 'leadStatus.status': 'none' },
        { leadStatus: { $exists: false } },
        { 'leadStatus.status': { $exists: false } },
        { 'leadStatus.status': null }
      ]
    };
  } else if (statusVal === 'Won') {
    statusCondition = { 'leadStatus.status': { $in: ['Won', 'converted'] } };
  } else if (statusVal === 'Lost') {
    statusCondition = { 'leadStatus.status': { $in: ['Lost', 'dead'] } };
  } else {
    statusCondition = { 'leadStatus.status': statusVal };
  }

  if (statusCondition) {
    if (statusCondition.$or) {
      if (query.$or) {
        query.$and = query.$and || [];
        query.$and.push({ $or: query.$or });
        query.$and.push(statusCondition);
        delete query.$or;
      } else if (query.$and) {
        query.$and.push(statusCondition);
      } else {
        query.$or = statusCondition.$or;
      }
    } else {
      if (query.$and) {
        query.$and.push(statusCondition);
      } else {
        Object.assign(query, statusCondition);
      }
    }
  }
};

const buildFilterQuery = ({
  fileId,
  city,
  industry,
  country,
  search,
  tagId,
  leadStatus,
  status,
}) => {
  const query = { fileId };

  // ==============================
  // Filters
  // ==============================

  if (city) {
    query.city = city;
  }

  if (industry) {
    query.industry = industry;
  }

  if (country) {
    query.country = country;
  }

  if (tagId) {
    query.tags = tagId;
  }

  // ==============================
  // Search
  // ==============================

  if (search) {
    const regex = new RegExp(search, "i");

    query.$or = [
      { company_name: regex },
      { email: regex },
      { website: regex },
      { city: regex },
      { country: regex },
      { phone: regex },
    ];
  }

  addStatusFilter(query, leadStatus || status);

  return query;
};

// ==========================================
// GET COMPANIES BY FILE
// ==========================================

const getCompaniesByFile = async ({
  fileId,
  page = 1,
  limit = 25,
  search,
  sortBy,
  sortDir,
  city,
  industry,
  country,
  tagId,
}) => {
  const query = buildFilterQuery({
    fileId,
    city,
    industry,
    country,
    search,
    tagId,
  });

  const skip =
    (Math.max(1, page) - 1) *
    parseInt(limit);

  // ==============================
  // Sorting
  // ==============================

  const sort = {};

  if (sortBy) {
    sort[sortBy] =
      sortDir === "desc" ? -1 : 1;
  } else {
    sort.createdAt = -1;
  }

  // ==============================
  // Fetch Data
  // ==============================

  const [data, total] =
    await Promise.all([
      Company.find(query)
        .populate("tags")
        .populate("leadStatus.updatedBy", "name email")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),

      Company.countDocuments(query),
    ]);

  return {
    data,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
  };
};

// ==========================================
// DISTINCT CITIES
// ==========================================

const getDistinctCities = async (
  fileId,
  { country, industry, tagId } = {}
) => {
  const filter = { fileId };

  if (country) {
    filter.country = country;
  }

  if (industry) {
    filter.industry = industry;
  }

  if (tagId) {
    filter.tags = tagId;
  }

  return Company.distinct(
    "city",
    filter
  );
};

// ==========================================
// DISTINCT INDUSTRIES
// ==========================================

const getDistinctIndustries =
  async (
    fileId,
    { country, city, tagId } = {}
  ) => {
    const filter = { fileId };

    if (country) {
      filter.country = country;
    }

    if (city) {
      filter.city = city;
    }

    if (tagId) {
      filter.tags = tagId;
    }

    return Company.distinct(
      "industry",
      filter
    );
  };

// ==========================================
// DISTINCT COUNTRIES
// ==========================================

const getDistinctCountries =
  async (
    fileId,
    { industry, city, tagId } = {}
  ) => {
    const filter = { fileId };

    if (industry) {
      filter.industry = industry;
    }

    if (city) {
      filter.city = city;
    }

    if (tagId) {
      filter.tags = tagId;
    }

    return Company.distinct(
      "country",
      filter
    );
  };

// ==========================================
// DISTINCT TAGS
// ==========================================

const getDistinctTags =
  async (
    fileId,
    { industry, city, country } = {}
  ) => {
    const filter = { fileId };

    if (industry) {
      filter.industry = industry;
    }

    if (city) {
      filter.city = city;
    }

    if (country) {
      filter.country = country;
    }

    return Company.distinct(
      "tags",
      filter
    );
  };

// ==========================================
// CHECK DUPLICATE DATA
// ==========================================

const checkDuplicateData = async (companies) => {
  if (!Array.isArray(companies) || companies.length === 0) {
    return {
      totalChecked: 0,
      duplicateCount: 0,
      duplicates: [],
    };
  }

  const validCompanies = companies.filter(
    (c) => c.company_name && String(c.company_name).trim() !== ""
  );

  if (validCompanies.length === 0) {
    return {
      totalChecked: 0,
      duplicateCount: 0,
      duplicates: [],
    };
  }

  // ==============================
  // Batch duplicate check using $or
  // Process in chunks to avoid too-large queries
  // ==============================

  const DUPLICATE_BATCH_SIZE = parseInt(process.env.DUPLICATE_BATCH_SIZE) || 5000;
  const duplicates = [];

  for (let i = 0; i < validCompanies.length; i += DUPLICATE_BATCH_SIZE) {
    const chunk = validCompanies.slice(i, i + DUPLICATE_BATCH_SIZE);

    // Collect all duplicateKeys from this chunk
    const duplicateKeys = [];

    for (const c of chunk) {
      const companyName = c.company_name && String(c.company_name).toLowerCase().trim();
      if (companyName) {
        duplicateKeys.push(companyName);
      }
    }

    if (duplicateKeys.length === 0) continue;

    // Use covered index scan to find existing duplicates with zero disk I/O
    const existingRecords = await Company.find(
      { duplicateKey: { $in: duplicateKeys } }, 
      { duplicateKey: 1, company_name: 1, city: 1, email: 1, _id: 0 }
    ).lean();

    const existingPairSet = new Set(
      existingRecords
        .filter((r) => r.duplicateKey)
        .map((r) => r.duplicateKey)
    );

    for (const c of chunk) {
      const companyName = c.company_name && String(c.company_name).toLowerCase().trim();
      if (companyName) {
        const key = companyName;
        if (existingPairSet.has(key)) {
          duplicates.push({ company_name: c.company_name, city: c.city, email: c.email });
        }
      }
    }
  }

  return {
    totalChecked: validCompanies.length,
    duplicateCount: duplicates.length,
    duplicates,
  };
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  bulkInsertCompanies,
  checkDuplicateData,
  buildFilterQuery,
  getCompaniesByFile,
  getDistinctCities,
  getDistinctIndustries,
  getDistinctCountries,
  getDistinctTags,
  addStatusFilter,
};