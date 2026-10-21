const express = require("express");
const { getCompanyFollowUps, createFollowUp, updateFollowUp } = require("../../controllers/followUp/followUpController");
const { protect } = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/company/:companyId", protect, getCompanyFollowUps);
router.post("/", protect, createFollowUp);
router.put("/:id", protect, updateFollowUp);

module.exports = router;
