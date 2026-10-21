const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const exportToExcel = (rows, filename = "export.xlsx", headers = null) => {
  const wb = xlsx.utils.book_new();
  const options = headers ? { header: headers } : {};
  const ws = xlsx.utils.json_to_sheet(rows, options);
  xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
  const outDir = path.join(process.cwd(), "exports");
  ensureDir(outDir);
  const outPath = path.join(outDir, filename);
  xlsx.writeFile(wb, outPath);
  return outPath;
};

const exportToCSV = (rows, filename = "export.csv", headers = null) => {
  const options = headers ? { header: headers } : {};
  const ws = xlsx.utils.json_to_sheet(rows, options);
  const csv = xlsx.utils.sheet_to_csv(ws);
  const outDir = path.join(process.cwd(), "exports");
  ensureDir(outDir);
  const outPath = path.join(outDir, filename);
  fs.writeFileSync(outPath, csv, "utf8");
  return outPath;
};

module.exports = {
  exportToExcel,
  exportToCSV,
};
