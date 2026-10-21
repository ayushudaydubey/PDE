const Activity = require("../../models/activity.model");

const getCompanyActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ companyId: req.params.companyId })
      .populate("createdBy", "name email")
      .sort({ date: -1, createdAt: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createActivity = async (req, res) => {
  try {
    const { companyId, targetListId, type, notes, metadata } = req.body;
    const activity = await Activity.create({
      companyId,
      targetListId,
      type,
      notes,
      metadata,
      createdBy: req.user._id,
      date: new Date(),
    });
    
    const populated = await Activity.findById(activity._id).populate("createdBy", "name email");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCompanyActivities,
  createActivity,
};
