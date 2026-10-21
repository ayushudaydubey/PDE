const Company = require("../../models/company.model");
const UploadedFile = require("../../models/uploadedFile.model");
const Tag = require("../../models/tag.model");
const User = require("../../models/user.model");
const Activity = require("../../models/activity.model");
const companyService = require("../../services/companyService");

const createCompany = async (req, res) => {
  try {
    const companyData = { ...req.body };

    if (companyData.contacts && companyData.contacts.length > 5) {
      return res.status(400).json({ message: "A company can have a maximum of 5 employee contacts." });
    }

    if (companyData.contactPages && companyData.contactPages.length > 5) {
      return res.status(400).json({ message: "A company can have a maximum of 5 contact page links." });
    }

    if (companyData.phone && companyData.contacts && companyData.contacts.length > 0) {
      for (const contact of companyData.contacts) {
        if (contact.contactNumber && contact.contactNumber === companyData.phone) {
          return res.status(400).json({ message: "Employee contact number cannot be the same as the company contact number." });
        }
      }
    }

    // Resolve tags from request body if they are passed as array of strings
    if (companyData.tags && Array.isArray(companyData.tags)) {
      const tagIds = [];
      for (const tagName of companyData.tags) {
        const trimmedName = tagName.trim();
        if (!trimmedName) continue;

        let tag = await Tag.findOne({
          name: {
            $regex: new RegExp(
              "^" + trimmedName.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + "$",
              "i",
            ),
          },
        });

        if (!tag) {
          tag = await Tag.create({ name: trimmedName });
        }
        tagIds.push(tag._id);
      }
      companyData.tags = tagIds;
    } else {
      companyData.tags = [];
    }

    const company = await Company.create(companyData);

    // Return the company populated with tags
    const populated = await Company.findById(company._id).populate("tags");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getCompanies = async (req, res) => {
  try {
    const filters = {};

    if (req.query.search) {
      filters.company_name = { $regex: req.query.search, $options: "i" };
    }

    if (req.query.city) {
      filters.city = { $regex: req.query.city, $options: "i" };
    }

    if (req.query.industry) {
      filters.industry = { $regex: req.query.industry, $options: "i" };
    }

    if (req.query.country) {
      filters.country = { $regex: req.query.country, $options: "i" };
    }

    if (req.query.tag) {
      const tagDoc = await Tag.findOne({ name: req.query.tag });
      if (tagDoc) {
        filters.tags = tagDoc._id;
      } else {
        filters.tags = null;
      }
    }

    companyService.addStatusFilter(filters, req.query.leadStatus || req.query.status);

    const total = await Company.countDocuments(filters);

    // Pagination Parameters
    const page = parseInt(req.query.page) || 1;
    const isAll = req.query.limit === "all";
    const limit = isAll ? total : parseInt(req.query.limit) || 10;
    const skip = isAll ? 0 : (page - 1) * limit;

    const companies = await Company.find(filters)
      .populate("tags")
      .populate("leadStatus.updatedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(isAll ? 0 : limit);

    res.json({
      companies,
      total,
      page,
      limit: isAll ? "all" : limit,
      totalPages: isAll ? 1 : Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate("tags")
      .populate("leadStatus.updatedBy", "name email")
      .populate("fileId", "originalName fileName");

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const TargetList = require("../../models/targetList.model");
    const targetLists = await TargetList.find({ companies: company._id }, "name");

    const companyObj = company.toObject();
    companyObj.targetLists = targetLists;

    res.json(companyObj);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateCompany = async (req, res) => {
  try {
    const updateData = { ...req.body };
    const existingCompany = await Company.findById(req.params.id);

    if (!existingCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    const newPhone = updateData.phone !== undefined ? updateData.phone : existingCompany.phone;
    const newContacts = updateData.contacts !== undefined ? updateData.contacts : existingCompany.contacts;
    const newContactPages = updateData.contactPages !== undefined ? updateData.contactPages : existingCompany.contactPages;

    if (newContacts && newContacts.length > 5) {
      return res.status(400).json({ message: "A company can have a maximum of 5 employee contacts." });
    }

    if (newContactPages && newContactPages.length > 5) {
      return res.status(400).json({ message: "A company can have a maximum of 5 contact page links." });
    }

    if (newPhone && newContacts && newContacts.length > 0) {
      for (const contact of newContacts) {
        if (contact.contactNumber && contact.contactNumber === newPhone) {
          return res.status(400).json({ message: "Employee contact number cannot be the same as the company contact number." });
        }
      }
    }

    // If lead status is updated, track who updated it and when
    if (updateData.leadStatus && updateData.leadStatus.status) {
      // Ensure we keep existing leadStatus properties if only status is sent
      
      updateData.leadStatus = {
        ...existingCompany.leadStatus,
        status: updateData.leadStatus.status,
        updatedBy: req.user ? req.user._id : null,
        updatedAt: new Date()
      };
    }

    // Resolve tags from request body if they are passed as array of strings
    if (updateData.tags && Array.isArray(updateData.tags)) {
      const tagIds = [];
      for (const tagName of updateData.tags) {
        const trimmedName = tagName.trim();
        if (!trimmedName) continue;

        let tag = await Tag.findOne({
          name: {
            $regex: new RegExp(
              "^" + trimmedName.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + "$",
              "i",
            ),
          },
        });

        if (!tag) {
          tag = await Tag.create({ name: trimmedName });
        }
        tagIds.push(tag._id);
      }
      updateData.tags = tagIds;
    }

    const company = await Company.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).populate("tags").populate("leadStatus.updatedBy", "name email");

    res.json(company);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteCompany = async (req, res) => {
  try {
    await Company.findByIdAndDelete(req.params.id);

    res.json({
      message: "Company deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const bulkTagCompanies = async (req, res) => {
  try {
    const { companyIds, tagNames, action = "add" } = req.body;

    if (!Array.isArray(companyIds) || !Array.isArray(tagNames)) {
      return res.status(400).json({
        message: "companyIds and tagNames must be arrays",
      });
    }

    const tagIds = [];
    for (const name of tagNames) {
      const trimmedName = name.trim();
      if (!trimmedName) continue;

      // Find tag case-insensitively to avoid duplicates
      let tag = await Tag.findOne({
        name: {
          $regex: new RegExp(
            "^" + trimmedName.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + "$",
            "i",
          ),
        },
      });

      if (!tag) {
        tag = await Tag.create({ name: trimmedName });
      }
      tagIds.push(tag._id);
    }

    if (action === "replace") {
      // Replaces tags with the selected set
      await Company.updateMany(
        { _id: { $in: companyIds } },
        { $set: { tags: tagIds } },
      );
    } else {
      // Default: adds tags to the existing list, avoiding duplicates
      await Company.updateMany(
        { _id: { $in: companyIds } },
        { $addToSet: { tags: { $each: tagIds } } },
      );
    }

    res.json({
      message: "Tags updated successfully",
      tagIds,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalCompanies,
      totalCountries,
      totalCities,
      totalIndustries,
      activeTags,
      totalImports,
      totalUsers,
    ] = await Promise.all([
      Company.countDocuments(),
      Company.distinct("country").then(
        (countries) => countries.filter(Boolean).length,
      ),
      Company.distinct("city").then((cities) => cities.filter(Boolean).length),
      Company.distinct("industry").then(
        (industries) => industries.filter(Boolean).length,
      ),
      Tag.countDocuments(),
      UploadedFile.countDocuments(),
      User.countDocuments(),
    ]);

    res.json({
      totalCompanies,
      totalCountries,
      totalCities,
      totalIndustries,
      activeTags,
      totalImports,
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDashboardCharts = async (req, res) => {
  try {
    const [companiesByCountry, companiesByIndustry] = await Promise.all([
      Company.aggregate([
        { $match: { country: { $nin: [null, ""] } } },
        { $group: { _id: "$country", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Company.aggregate([
        { $match: { industry: { $nin: [null, ""] } } },
        { $group: { _id: "$industry", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({
      companiesByCountry: companiesByCountry.map((c) => ({
        name: c._id,
        value: c.count,
      })),
      companiesByIndustry: companiesByIndustry.map((i) => ({
        name: i._id,
        value: i.count,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCompanyStatus = async (req, res) => {
  try {
    const { status, notes, nextFollowUpDate, dealValue, closingDate, remarks, lossReason, holdReason, targetListId } = req.body;
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    if (status === "Won") {
      if (!dealValue || !closingDate) {
        return res.status(400).json({ message: "Deal value and closing date are mandatory for won deals." });
      }
    } else if (status === "Lost") {
      if (!lossReason) {
        return res.status(400).json({ message: "Reason is mandatory for lost deals." });
      }
    } else if (status === "On Hold") {
      if (!holdReason) {
        return res.status(400).json({ message: "Hold reason is mandatory." });
      }
    }

    const oldStatus = company.leadStatus?.status || "New";

    // Update company leadStatus
    company.leadStatus = {
      status,
      updatedBy: req.user._id,
      updatedAt: new Date()
    };
    
    // Update Next Follow Up
    if (nextFollowUpDate) {
      company.nextFollowUp = {
        date: new Date(nextFollowUpDate),
        assignedTo: req.user._id,
      };
    } else {
      company.nextFollowUp = {
        date: null,
        assignedTo: null,
      };
    }

    // Update Latest Activity summary for table
    company.latestActivity = {
      notes: notes || `Status changed to ${status}`,
      date: new Date()
    };
    
    if (!company.leadDetails) company.leadDetails = {};
    
    if (dealValue !== undefined) company.leadDetails.dealValue = dealValue;
    if (closingDate !== undefined) company.leadDetails.closingDate = closingDate;
    if (remarks !== undefined) company.leadDetails.remarks = remarks;
    if (lossReason !== undefined) company.leadDetails.lossReason = lossReason;
    if (holdReason !== undefined) company.leadDetails.holdReason = holdReason;

    await company.save();

    // Create or update Activity record for the timeline
    let activityTitle = oldStatus !== status ? `Status changed to ${status}` : "Note Added";
    let activityNotes = notes || (oldStatus !== status ? `Status changed from ${oldStatus} to ${status}` : "");
    let activityType = oldStatus !== status ? "Status Change" : "Note";

    const isOnlyFollowUpOrDetails = oldStatus === status && !notes;

    if (isOnlyFollowUpOrDetails && nextFollowUpDate) {
      // Find the latest activity and update its metadata with the new follow up date
      const latestActivity = await Activity.findOne({ companyId: company._id }).sort({ date: -1 });
      if (latestActivity) {
        latestActivity.metadata = { ...latestActivity.metadata, nextFollowUpDate };
        await latestActivity.save();
      } else {
        // Fallback: create a note if somehow no activity exists
        await Activity.create({
          companyId: company._id,
          targetListId: targetListId || null,
          type: "Note",
          notes: "Updated follow-up date",
          metadata: { oldStatus, newStatus: status, dealValue, closingDate, remarks, lossReason, holdReason, nextFollowUpDate },
          createdBy: req.user._id,
          date: new Date()
        });
      }
    } else {
      await Activity.create({
        companyId: company._id,
        targetListId: targetListId || null,
        type: activityType,
        notes: activityNotes,
        metadata: { oldStatus, newStatus: status, dealValue, closingDate, remarks, lossReason, holdReason, nextFollowUpDate },
        createdBy: req.user._id,
        date: new Date()
      });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCompany,
  getCompanies,
  getCompany,
  updateCompany,
  deleteCompany,
  bulkTagCompanies,
  getDashboardStats,
  getDashboardCharts,
  updateCompanyStatus,
};
