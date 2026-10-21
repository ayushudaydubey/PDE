const express = require("express");
const { getCountries, getCities, getIndustries, getTags } = require("../../controllers/filters/filtersController");
const { protect } = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/countries", protect, getCountries);
router.get("/cities", protect, getCities);
router.get("/industries", protect, getIndustries);
router.get("/tags", protect, getTags);

module.exports = router;
