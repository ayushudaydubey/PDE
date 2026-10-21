const express = require("express");
const { getCompanyActivities, createActivity } = require("../../controllers/activity/activityController");
const { protect } = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/company/:companyId", protect, getCompanyActivities);
router.post("/", protect, createActivity);

module.exports = router;
