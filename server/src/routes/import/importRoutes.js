const express = require("express");

const { importCSV, getHistory } = require("../../controllers/import/importController");
const { uploadHandler, confirmImportHandler, cancelImportHandler, sseEventsHandler } = require("../../controllers/import/uploadController");
const { protect, authorize } = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/events", protect, authorize("admin", "sales"), sseEventsHandler);

router.post("/csv", protect, authorize("admin", "sales"), importCSV);

router.get("/history", protect, authorize("admin", "sales"), getHistory);

// Upload endpoint: accepts file form-data under field name `file`
router.post("/upload", protect, authorize("admin", "sales"), uploadHandler);

router.post("/confirm/:fileId", protect, authorize("admin", "sales"), confirmImportHandler);
router.post("/cancel/:fileId", protect, authorize("admin", "sales"), cancelImportHandler);

module.exports = router;