const express = require("express");

const {
  createTag,
  getTags,
  deleteTag,
} = require("../../controllers/tag/tagController");
const { protect, authorize } = require("../../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorize("admin", "sales"), createTag);

router.get("/", protect, getTags);

router.delete("/:id", protect, authorize("admin"), deleteTag);

module.exports = router;