const Notification = require("../../models/notification.model");
const TargetList = require("../../models/targetList.model");

const getNotifications = async (req, res, next) => {
  try {
    // Automatic sync: ensure any target list assigned to this user has a corresponding notification
    const assignedLists = await TargetList.find({ "assignments.user": req.user._id })
      .populate("assignments.assignedBy", "name")
      .lean();

    for (const list of assignedLists) {
      const assignment = (list.assignments || []).find(
        (a) => a.user && a.user.toString() === req.user._id.toString()
      );
      if (assignment) {
        const exists = await Notification.findOne({
          user: req.user._id,
          targetListId: list._id,
          type: "target_list_assigned",
        });
        if (!exists) {
          const assignedByName = assignment.assignedBy ? assignment.assignedBy.name : "Admin";
          // If assigned in the last 7 days, mark as unread so user sees badge count. Otherwise mark read.
          const isRecent = assignment.assignedAt && (new Date() - new Date(assignment.assignedAt) < 7 * 24 * 60 * 60 * 1000);
          await Notification.create({
            user: req.user._id,
            title: "Target List Assigned",
            message: `You have been assigned target list "${list.name}" by ${assignedByName}.${
              assignment.description ? ` Note: ${assignment.description}` : ""
            }`,
            type: "target_list_assigned",
            targetListId: list._id,
            isRead: !isRecent,
            createdAt: assignment.assignedAt || list.createdAt,
          });
        }
      }
    }

    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

    res.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAllAsRead,
};
