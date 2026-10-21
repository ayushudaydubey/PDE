const User = require("../../models/user.model");

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select("-password");
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user (e.g. role)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const { name, email, phone, role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    
    if (role && role !== user.role) {
      if (user.role === 'admin' && user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You cannot update the role of another admin" });
      }
      user.role = role;
    }

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Optional: Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own admin account" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const getUsersForFilter = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    let query = {};

    const targetRole = req.query.targetRole || userRole;
    
    // Everyone should see the target role (or their own role) PLUS admin and superadmin
    query.role = { $in: [targetRole, "admin", "superadmin"] };

    const users = await User.find(query).select("name email role _id").sort({ name: 1 });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  updateUser,
  deleteUser,
  getUsersForFilter,
};
