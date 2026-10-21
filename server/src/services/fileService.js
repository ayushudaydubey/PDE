const fs = require("fs");
const path = require("path");

const csv = require("csv-parser");
const xlsx = require("xlsx");
const ExcelJS = require("exceljs");

const UploadedFile = require("../models/uploadedFile.model");

// =======================================
// Parse CSV
// =======================================

const parseCSV = (filePath) =>
  new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => rows.push(data))
      .on("end", () => resolve(rows))
      .on("error", (err) => reject(err));
  });

// =======================================
// Parse Excel
// =======================================

const parseExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  let allData = [];

  console.log(`[PARSE] Excel file has ${workbook.SheetNames.length} sheet(s): ${workbook.SheetNames.join(", ")}`);

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const data = xlsx.utils.sheet_to_json(sheet, {
      defval: "",
      raw: false, // convert everything to strings for consistent mapping
    });

    console.log(`[PARSE] Sheet "${sheetName}": ${data.length} rows found`);

    if (data.length > 0) {
      allData = allData.concat(data);
    }
  }

  console.log(`[PARSE] Total rows from all sheets: ${allData.length}`);
  return allData;
};

// =======================================
// Parse File
// =======================================

const parseFile = async (
  filePath,
  mimetype
) => {
  const ext = path
    .extname(filePath)
    .toLowerCase();

  if (
    ext === ".csv" ||
    mimetype === "text/csv"
  ) {
    return parseCSV(filePath);
  }

  return parseExcel(filePath);
};

// =======================================
// Save Upload History
// =======================================

const saveUploadedFile = async ({
  fileName,
  originalName,
  sourceType,
  totalRecords,
  uploadedBy,
  uploadPath,
}) => {
  return UploadedFile.create({
    fileName,
    originalName,
    sourceType,
    totalRecords,
    uploadedBy,
    uploadPath,
  });
};

// =======================================
// Streaming Row Iterator (Constant RAM)
// =======================================
async function* streamFileRows(filePath, mimetype) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".csv" || mimetype === "text/csv") {
    const stream = fs.createReadStream(filePath).pipe(csv());
    for await (const row of stream) {
      yield row;
    }
    return;
  }

  // Handle Excel (.xlsx) via ExcelJS streaming reader
  if (ext === ".xlsx" || mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
    const options = {
      sharedStrings: 'cache',
      hyperlinks: 'ignore',
      styles: 'ignore',
      worksheets: 'emit'
    };
    const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(filePath, options);
    
    for await (const worksheetReader of workbookReader) {
      let headers = null;
      for await (const row of worksheetReader) {
        if (!row.values || !Array.isArray(row.values)) continue;
        const values = row.values.slice(1);
        if (values.length === 0 || values.every(v => v === undefined || v === null || v === "")) continue;

        if (!headers) {
          headers = values.map(v => (v !== undefined && v !== null) ? String(v).trim() : "");
          continue;
        }

        const rowObj = {};
        for (let idx = 0; idx < headers.length; idx++) {
          const header = headers[idx];
          if (!header) continue;
          let val = values[idx];
          if (val && typeof val === 'object') {
            val = val.text || val.result || val.hyperlink || (Array.isArray(val.richText) ? val.richText.map(t => t.text).join("") : "");
          }
          rowObj[header] = (val !== undefined && val !== null) ? String(val) : "";
        }
        yield rowObj;
      }
    }
    return;
  }

  // Fallback for legacy .xls files via SheetJS
  const allData = parseExcel(filePath);
  for (const row of allData) {
    yield row;
  }
}

module.exports = {
  parseFile,
  streamFileRows,
  saveUploadedFile,
};