const FollowUp = require("../../models/followUp.model");

const getCompanyFollowUps = async (req, res) => {
  try {
    const followUps = await FollowUp.find({ companyId: req.params.companyId })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ date: 1 });
    res.json(followUps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createFollowUp = async (req, res) => {
  try {
    const { companyId, targetListId, date, time, notes, assignedTo } = req.body;
    const followUp = await FollowUp.create({
      companyId,
      targetListId,
      date,
      time,
      notes,
      assignedTo: assignedTo || req.user._id,
      createdBy: req.user._id,
      status: "Pending",
    });
    
    const populated = await FollowUp.findById(followUp._id).populate("assignedTo", "name email").populate("createdBy", "name email");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFollowUp = async (req, res) => {
  try {
    const { status } = req.body;
    const followUp = await FollowUp.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("assignedTo", "name email").populate("createdBy", "name email");
    
    if (!followUp) return res.status(404).json({ message: "Follow-up not found" });
    res.json(followUp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCompanyFollowUps,
  createFollowUp,
  updateFollowUp,
};
