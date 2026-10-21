const express = require("express");

const {
  createCompany,
  getCompanies,
  getCompany,
  updateCompany,
  deleteCompany,
  bulkTagCompanies,
  getDashboardStats,
  getDashboardCharts,
  updateCompanyStatus,
} = require("../../controllers/company/companyController");

const { protect, authorize } = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/stats", protect, getDashboardStats);
router.get("/charts", protect, getDashboardCharts);

router.post("/bulk-tag", protect, authorize("admin", "sales"), bulkTagCompanies);
router.post("/", protect, authorize("admin", "sales"), createCompany);

router.get("/", protect, getCompanies);

router.get("/:id", protect, getCompany);

router.put("/:id/status", protect, updateCompanyStatus);
router.put("/:id", protect, authorize("admin"), updateCompany);

router.delete("/:id", protect, authorize("admin"), deleteCompany);

module.exports = router;