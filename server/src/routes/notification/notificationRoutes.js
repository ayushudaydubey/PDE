const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const { getNotifications, markAllAsRead } = require("../../controllers/notification/notificationController");
const { sseHandler } = require("../../utils/sseManager");

const router = express.Router();

router.use(protect);

router.get("/stream", sseHandler);
router.get("/", getNotifications);
router.put("/mark-read", markAllAsRead);

module.exports = router;
