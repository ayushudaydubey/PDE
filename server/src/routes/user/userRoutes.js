const express = require("express");
const { getAllUsers, updateUser, deleteUser, getUsersForFilter } = require("../../controllers/user/userController");
const { protect, authorize } = require("../../middleware/authMiddleware");

const router = express.Router();

// Route accessible to any logged-in user to populate filters
router.get("/filter-list", protect, getUsersForFilter);

// All routes below here are restricted to logged-in admins
router.use(protect, authorize("admin"));

router.get("/", getAllUsers);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
