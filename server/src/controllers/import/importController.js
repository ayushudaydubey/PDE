const importModel  = require("../../models/import.model");
const UploadedFile = require("../../models/uploadedFile.model");
const importCSV = async (req, res) => {
  try {
    const {
      source_type,
      file_name,
      total_records,
      imported_records,
      duplicates_skipped,
    } = req.body;

    const newImport = await importModel.create({
      source_type,
      file_name,
      total_records,
      imported_records,
      duplicates_skipped,
    });

    res.status(201).json({
      message: "CSV Imported Successfully",
      data: newImport,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    const { userId } = req.query;

    if (userId) {
      query.uploadedBy = userId;
    } else if (req.user && req.user.role !== "admin" && req.user.role !== "superadmin") {
      const User = require("../../models/user.model");
      const roleUsers = await User.find({ role: { $in: [req.user.role, "admin", "superadmin"] } }).select("_id");
      query.uploadedBy = { $in: roleUsers.map((u) => u._id) };
    }

    const total = await UploadedFile.countDocuments(query);
    const history = await UploadedFile.find(query)
      .populate("uploadedBy", "name email role")
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ 
      history,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  importCSV,
  getHistory,
};