const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { Worker } = require("worker_threads");

const fileService = require("../../services/fileService");
const workerPool = require("../../workers/workerPool");
const companyService = require("../../services/companyService");

const UploadedFile = require("../../models/uploadedFile.model");

// =======================================
// Upload Directory
// =======================================

const uploadDir = path.join(
  process.cwd(),
  "server",
  "uploads"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

// =======================================
// Multer Storage
// =======================================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const unique =
      Date.now() +
      "-" +
      file.originalname.replace(/\s+/g, "_");

    cb(null, unique);
  },
});

const upload = multer({ storage });

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
  // =======================================
  // Smart Getter
  // =======================================

  const get = (keys) => {
    const normalizedRowKeys = Object.keys(row);

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
          return value;
        }
      }
    }

    return undefined;
  };

  // =======================================
  // Company Data
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
  // Employee / Contact Data (strictly contact number only)
  // =======================================

  const employeePhone = get([
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
  ]);

  company.contacts = [
    {
      name: null,
      position: null,
      contactNumber: (employeePhone && employeePhone !== company.phone) ? employeePhone : "",
      email: null,
    },
  ];

  // =======================================
  // Remove Empty Fields
  // =======================================

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
  // Extract Social Media Links
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

  return company;
};

// =======================================
// Upload Handler (Pre-check duplicates, no import)
// =======================================

const uploadHandler = [
  upload.single("file"),

  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }

      // =======================================
      // Duplicate File Check (by name)
      // =======================================

      const existingFile = await UploadedFile.findOne({
        originalName: req.file.originalname,
      });

      if (existingFile) {
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(400).json({
          message: "This file already exists with file name: " + req.file.originalname,
        });
      }

      // =======================================
      // Instant Upload Response (< 2 seconds, zero main-thread pre-scan)
      // =======================================
      let mimetype = req.file.mimetype;
      if (req.file.originalname && (req.file.originalname.endsWith(".xlsx") || req.file.originalname.endsWith(".xls"))) {
        mimetype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      }

      const uploadedDoc = await fileService.saveUploadedFile({
        fileName: req.file.filename,
        originalName: req.file.originalname,
        sourceType: path.extname(req.file.originalname).replace(".", ""),
        totalRecords: 0, 
        uploadedBy: req.user ? req.user._id : null,
        uploadPath: req.file.path,
      });

      uploadedDoc.status = "queued";
      uploadedDoc.progress = 0;
      await uploadedDoc.save();

      // Enqueue job immediately into CPU bounded WorkerPool
      workerPool.addJob({
        fileId: uploadedDoc._id.toString(),
        filePath: uploadedDoc.uploadPath,
        mimetype: mimetype,
        originalName: uploadedDoc.originalName || uploadedDoc.fileName
      });

      return res.status(200).json({
        success: true,
        message: "File uploaded and queued successfully.",
        file: uploadedDoc,
        totalRecords: 0,
        duplicateCount: 0,
        fileId: uploadedDoc._id
      });
    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      next(error);
    }
  },
];

// =======================================
// Confirm Import Handler (Idempotent for frontend auto-confirm compatibility)
// =======================================
const confirmImportHandler = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    
    const uploadedDoc = await UploadedFile.findById(fileId);
    if (!uploadedDoc) {
      return res.status(404).json({ message: "File not found" });
    }

    if (uploadedDoc.status === "queued" || uploadedDoc.status === "processing" || uploadedDoc.status === "completed") {
      return res.status(200).json({
        success: true,
        message: "Import process already queued/started.",
      });
    }

    if (uploadedDoc.status !== "pending") {
      return res.status(400).json({ message: "File cannot be started from current status." });
    }

    let mimetype = "text/csv";
    if (uploadedDoc.uploadPath && (uploadedDoc.uploadPath.endsWith(".xlsx") || uploadedDoc.uploadPath.endsWith(".xls"))) {
      mimetype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }

    uploadedDoc.status = "queued";
    await uploadedDoc.save();

    workerPool.addJob({
      fileId: uploadedDoc._id.toString(),
      filePath: uploadedDoc.uploadPath,
      mimetype: mimetype,
      originalName: uploadedDoc.originalName || uploadedDoc.fileName
    });

    return res.status(200).json({
      success: true,
      message: "Import process started.",
    });

  } catch (error) {
    console.error("CONFIRM ERROR:", error);
    next(error);
  }
};

// =======================================
// Cancel Import Handler (Deletes file)
// =======================================
const cancelImportHandler = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    
    const uploadedDoc = await UploadedFile.findById(fileId);
    if (!uploadedDoc) {
      return res.status(404).json({ message: "File not found" });
    }

    if (uploadedDoc.uploadPath && fs.existsSync(uploadedDoc.uploadPath)) {
      fs.unlinkSync(uploadedDoc.uploadPath);
    }

    await UploadedFile.findByIdAndDelete(fileId);

    return res.status(200).json({
      success: true,
      message: "Import cancelled and file deleted.",
    });

  } catch (error) {
    console.error("CANCEL ERROR:", error);
    next(error);
  }
};

// =======================================
// SSE Real-Time Event Stream Handler
// =======================================
const sseEventsHandler = (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no"
  });
  res.write("data: {\"connected\": true}\n\n");
  workerPool.addSSEClient(res);
};

module.exports = {
  uploadHandler,
  confirmImportHandler,
  cancelImportHandler,
  sseEventsHandler
};