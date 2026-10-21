const TargetList = require("../../models/targetList.model");
const Company = require("../../models/company.model");
const Tag = require("../../models/tag.model");
const User = require("../../models/user.model");
const Notification = require("../../models/notification.model");
const { sendNotificationToUser } = require("../../utils/sseManager");
const { sendAssignmentEmail } = require("../../utils/emailService");

// Helper to build filter query, similar to company.controller.js getCompanies
const buildFilterQuery = async (queryObj) => {
  const filters = {};

  if (queryObj.search) {
    filters.company_name = { $regex: queryObj.search, $options: "i" };
  }
  if (queryObj.city) {
    filters.city = { $regex: queryObj.city, $options: "i" };
  }
  if (queryObj.industry) {
    filters.industry = { $regex: queryObj.industry, $options: "i" };
  }
  if (queryObj.country) {
    filters.country = { $regex: queryObj.country, $options: "i" };
  }
  if (queryObj.tag) {
    const tagDoc = await Tag.findOne({ name: queryObj.tag });
    if (tagDoc) {
      filters.tags = tagDoc._id;
    } else {
      // If tag not found, force no results
      filters.tags = "000000000000000000000000"; 
    }
  }

  return filters;
};

const createTargetList = async (req, res, next) => {
  try {
    const { name, filters } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Target list name is required." });
    }

    const existingList = await TargetList.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingList) {
      return res.status(400).json({ message: "A target list with this name already exists." });
    }

    // Build the query to find companies
    const query = await buildFilterQuery(filters || {});
    
    // Get all matching companies (just their IDs)
    const companies = await Company.find(query).select("_id").lean();
    const companyIds = companies.map(c => c._id);

    const targetList = await TargetList.create({
      name,
      filters: filters || {},
      companies: companyIds,
      createdBy: req.user._id,
    });

    res.status(201).json(targetList);
  } catch (error) {
    next(error);
  }
};

const getTargetLists = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', createdBy = '', assignedUser = '' } = req.query;

    const query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (createdBy) {
      query.createdBy = createdBy;
    }

    if (assignedUser) {
      query['assignments.user'] = assignedUser;
    }

    if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.role !== 'marketing') {
      query.$or = [
        { createdBy: req.user._id },
        { 'assignments.user': req.user._id }
      ];
    }

    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const total = await TargetList.countDocuments(query);

    const targetLists = await TargetList.find(query)
      .populate("createdBy", "name email")
      .populate("assignments.user", "name email")
      .populate("assignments.assignedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      data: targetLists,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};

const getTargetListById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, filterStat } = req.query;

    const targetList = await TargetList.findById(id)
      .populate("createdBy", "name email role")
      .populate("assignments.user", "name email role")
      .populate("assignments.assignedBy", "name email role")
      .lean();

    if (!targetList) {
      return res.status(404).json({ message: "Target list not found." });
    }

    const query = { _id: { $in: targetList.companies } };

    if (filterStat) {
      if (filterStat === 'assigned') {
        query['leadStatus.status'] = { $nin: ['New', 'none', null] };
      } else if (filterStat === 'unassigned') {
        query.$or = [
          { 'leadStatus.status': 'New' },
          { 'leadStatus.status': 'none' },
          { leadStatus: { $exists: false } },
          { 'leadStatus.status': { $exists: false } }
        ];
      } else if (filterStat === 'active_followups') {
        query['nextFollowUp.date'] = { $gte: new Date() };
      } else if (filterStat === 'won') {
        query['leadStatus.status'] = { $in: ['Won', 'converted'] };
      } else if (filterStat === 'lost') {
        query['leadStatus.status'] = { $in: ['Lost', 'dead'] };
      }
    }

    const skip = (Math.max(1, page) - 1) * parseInt(limit);
    const total = await Company.countDocuments(query);

    // Fetch the companies with pagination
    const companies = await Company.find(query)
      .populate("tags")
      .populate("leadStatus.updatedBy", "name email")
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      targetList,
      companies: {
        data: companies,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      }
    });
  } catch (error) {
    next(error);
  }
};

const repopulateTargetList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const targetList = await TargetList.findById(id);

    if (!targetList) {
      return res.status(404).json({ message: "Target list not found." });
    }

    // Build query using saved filters
    const query = await buildFilterQuery(targetList.filters || {});
    
    // Find all matching company IDs
    const matchingCompanies = await Company.find(query).select("_id").lean();
    const matchingIds = matchingCompanies.map(c => c._id.toString());

    // Current IDs
    const currentIdsSet = new Set(targetList.companies.map(id => id.toString()));

    // Find new IDs
    const newIds = matchingIds.filter(id => !currentIdsSet.has(id));

    if (newIds.length > 0) {
      targetList.companies.push(...newIds);
      await targetList.save();
    }

    res.json({ 
      message: `Repopulated successfully. Added ${newIds.length} new companies.`,
      addedCount: newIds.length,
      totalCount: targetList.companies.length
    });
  } catch (error) {
    next(error);
  }
};

const deleteTargetList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const targetList = await TargetList.findByIdAndDelete(id);

    if (!targetList) {
      return res.status(404).json({ message: "Target list not found." });
    }

    res.json({ message: "Target list deleted successfully." });
  } catch (error) {
    next(error);
  }
};

const assignTargetList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, description, priority } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "Salesman user ID is required." });
    }

    const targetList = await TargetList.findById(id);
    if (!targetList) {
      return res.status(404).json({ message: "Target list not found." });
    }

    const salesman = await User.findById(userId);
    if (!salesman) {
      return res.status(404).json({ message: "Salesman not found." });
    }

    // Check if already assigned
    const alreadyAssigned = targetList.assignments.find(a => a.user.toString() === userId);
    if (alreadyAssigned) {
      return res.status(400).json({ message: "Target list is already assigned to this salesman." });
    }

    targetList.assignments.push({
      user: userId,
      description: description || "",
      assignedBy: req.user._id,
      assignedAt: new Date(),
    });
    
    if (priority) {
      targetList.priority = priority;
    }

    await targetList.save();

    // Create Notification
    try {
      const newNotif = await Notification.create({
        user: userId,
        title: "Target List Assigned",
        message: `You have been assigned target list "${targetList.name}" by ${req.user.name}.${description ? ` Note: ${description}` : ""}`,
        type: "target_list_assigned",
        targetListId: targetList._id,
        isRead: false,
      });

      // Send real-time SSE push notification immediately
      sendNotificationToUser(userId, {
        type: "new_notification",
        notification: newNotif,
      });
    } catch (notifErr) {
      console.error("Failed to create/send notification:", notifErr);
    }

    // Send email
    await sendAssignmentEmail(
      salesman.email,
      salesman.name,
      targetList.name,
      description,
      req.user.name,
      req.user.email
    );

    res.json({ message: "Target list assigned successfully." });
  } catch (error) {
    next(error);
  }
};

const getTargetListStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const targetList = await TargetList.findById(id).lean();

    if (!targetList) {
      return res.status(404).json({ message: "Target list not found." });
    }

    const companyIds = targetList.companies;

    // Fetch all companies in this list to aggregate stats
    const companies = await Company.find({ _id: { $in: companyIds } }).lean();

    let totalTargets = companies.length;
    let assignedLeads = 0;
    let unassignedLeads = 0;
    let activeFollowUps = 0; // We'll query FollowUp collection for this later
    let wonOpportunities = 0;
    let lostOpportunities = 0;

    companies.forEach(company => {
      // Assuming unassigned means 'none' or 'New' status, and no assignedTo? Wait,
      // Target list assignments vs Company assignments. We might just look at Company leadStatus
      const status = company.leadStatus?.status || "New";
      if (status === "Won" || status === "converted") wonOpportunities++;
      if (status === "Lost" || status === "dead") lostOpportunities++;
      if (status === "New" || status === "none") unassignedLeads++;
      else assignedLeads++; // any other status implies someone is working on it
    });
    
    // Get active follow ups
    activeFollowUps = await Company.countDocuments({
      _id: { $in: companyIds },
      "nextFollowUp.date": { $gte: new Date() }
    });

    res.json({
      totalTargets,
      assignedLeads,
      unassignedLeads,
      activeFollowUps,
      wonOpportunities,
      lostOpportunities
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTargetList,
  getTargetLists,
  getTargetListById,
  repopulateTargetList,
  deleteTargetList,
  assignTargetList,
  getTargetListStats,
};
