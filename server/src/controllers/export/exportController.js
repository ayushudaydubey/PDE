const Company = require("../../models/company.model");
const exportService = require("../../services/exportService");
const companyService = require("../../services/companyService");

const exportCompanies = async (req, res) => {
  try {
    const filters = {};

    if (req.query.city) {
      filters.city = { $regex: req.query.city, $options: "i" };
    }

    if (req.query.state) {
      filters.state = { $regex: req.query.state, $options: "i" };
    }

    if (req.query.industry) {
      filters.industry = { $regex: req.query.industry, $options: "i" };
    }

    if (req.query.country) {
      filters.country = { $regex: req.query.country, $options: "i" };
    }

    if (req.query.tag) {
      const Tag = require("../../models/tag.model");
      const tagDoc = await Tag.findOne({ name: req.query.tag });
      if (tagDoc) {
        filters.tags = tagDoc._id;
      } else {
        filters.tags = null;
      }
    }

    if (req.query.search) {
      filters.company_name = { $regex: req.query.search, $options: "i" };
    }
    companyService.addStatusFilter(filters, req.query.leadStatus || req.query.status);

    // Fetch all companies matching filters (excluding tags for simplicity or map them)
    const companies = await Company.find(filters).populate("tags").lean();

    let selectedColumns = null;
    if (req.query.columns) {
      selectedColumns = req.query.columns.split(",").map(c => c.trim());
    }

    // Map companies to a flat structure for Excel/CSV
    const rows = companies.map(c => {
      const row = {};
      const addField = (colName, value) => {
        if (!selectedColumns || selectedColumns.includes(colName)) {
          row[colName] = value;
        }
      };

      addField("Company Name", c.company_name || "");
      addField("Website", c.website || "");
      addField("Email", c.email || "");
      addField("Phone", c.phone || "");
      addField("City", c.city || "");
      addField("Country", c.country || "");
      addField("Industry", c.industry || "");
      addField("Tags", c.tags ? c.tags.map(t => t.name).join(", ") : "");
      addField("Description", c.description || "");
      // Employee Contacts: format as "Name <email> (phone) | Name2 <email> (phone)"
      const contactsFormatted = Array.isArray(c.contacts) && c.contacts.length > 0
        ? c.contacts.map(ct => `${ct.name || ''}${ct.email ? ` <${ct.email}>` : ''}${ct.contactNumber ? ` (${ct.contactNumber})` : ''}`.trim()).filter(Boolean).join(' | ')
        : "";
      addField("Employee Contacts", contactsFormatted);

      // Social Media Links: format per platform
      const social = c.socialMedia || {};
      const socialParts = [];
      Object.keys(social).forEach(platform => {
        const arr = social[platform] || [];
        if (Array.isArray(arr) && arr.length > 0) {
          const items = arr.map(it => {
            const u = it && (it.url || it.link) ? it.url || it.link : (typeof it === 'string' ? it : '');
            const name = it && it.username ? it.username : '';
            return name ? `${name} (${u})` : `${u}`;
          }).filter(Boolean).join('; ');
          if (items) socialParts.push(`${platform}: ${items}`);
        }
      });
      addField("Social Media Links", socialParts.join(' | '));
      addField("Source", c.source || "");

      return row;
    });


    const format = req.query.format || "xlsx";
    const fileName = `companies_export_${Date.now()}.${format}`;
    let outPath;
    
    // Determine headers array: if selectedColumns is null, use the keys of the first row
    const headers = selectedColumns || (rows.length > 0 ? Object.keys(rows[0]) : null);

    if (format === "csv") {
      outPath = exportService.exportToCSV(rows, fileName, headers);
    } else {
      outPath = exportService.exportToExcel(rows, fileName, headers);
    }
    
    // Create export history
    const ExportHistory = require("../../models/exportHistory.model");
    await ExportHistory.create({
      fileName,
      filters: req.query || {},
      totalRecords: companies.length,
      exportedBy: req.user ? req.user._id : null,
    });

    res.download(outPath);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getExportHistory = async (req, res) => {
  try {
    const ExportHistory = require("../../models/exportHistory.model");
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    const { userId } = req.query;

    if (userId) {
      query.exportedBy = userId;
    } else if (req.user && req.user.role !== "admin" && req.user.role !== "superadmin") {
      const User = require("../../models/user.model");
      const roleUsers = await User.find({ role: { $in: [req.user.role, "admin", "superadmin"] } }).select("_id");
      query.exportedBy = { $in: roleUsers.map((u) => u._id) };
    }

    const total = await ExportHistory.countDocuments(query);
    const history = await ExportHistory.find(query)
      .populate("exportedBy", "name email role")
      .sort({ exportedAt: -1 })
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
    res.status(500).json({
      message: error.message,
    });
  }
};

// ─── Regenerate Export ───────────────────────────────────────────────────────

const regenerateExport = async (req, res) => {
  try {
    const { exportId } = req.params;
    const { ignoredColumns = [] } = req.body;

    const ExportHistory = require("../../models/exportHistory.model");
    const RegenerateHistory = require("../../models/regenerateHistory.model");
    
    const original = await ExportHistory.findById(exportId);
    if (!original) {
      return res.status(404).json({ success: false, message: 'Export record not found.' });
    }

    const ignored = Array.isArray(ignoredColumns)
      ? ignoredColumns
      : ignoredColumns ? ignoredColumns.split(',') : [];

    const savedFilters = original.filters || {};
    const query = {};

    if (savedFilters.city) {
      query.city = { $regex: savedFilters.city, $options: "i" };
    }
    if (savedFilters.state) {
      query.state = { $regex: savedFilters.state, $options: "i" };
    }
    if (savedFilters.industry) {
      query.industry = { $regex: savedFilters.industry, $options: "i" };
    }
    if (savedFilters.country) {
      query.country = { $regex: savedFilters.country, $options: "i" };
    }
    if (savedFilters.tag) {
      const Tag = require("../../models/tag.model");
      const tagDoc = await Tag.findOne({ name: savedFilters.tag });
      if (tagDoc) {
        query.tags = tagDoc._id;
      } else {
        query.tags = null;
      }
    }

    if (savedFilters.search) {
      query.company_name = { $regex: savedFilters.search, $options: "i" };
    }
    companyService.addStatusFilter(query, savedFilters.leadStatus || savedFilters.status);

    const companies = await Company.find(query).populate("tags").lean();

    if (!companies.length) {
      return res.status(404).json({ success: false, message: 'No records found for the original filters.' });
    }

    let selectedColumns = null;
    if (savedFilters.columns) {
      selectedColumns = savedFilters.columns.split(",").map(c => c.trim());
    }

    // Map companies to a flat structure for Excel/CSV
    const rows = companies.map(c => {
      const row = {};
      const addField = (colName, value) => {
        if ((!selectedColumns || selectedColumns.includes(colName)) && !ignored.includes(colName)) {
          row[colName] = value;
        }
      };

      addField("Company Name", c.company_name || "");
      addField("Website", c.website || "");
      addField("Email", c.email || "");
      addField("Phone", c.phone || "");
      addField("City", c.city || "");
      addField("Country", c.country || "");
      addField("Industry", c.industry || "");
      addField("Tags", c.tags ? c.tags.map(t => t.name).join(", ") : "");
      addField("Description", c.description || "");
      // Employee Contacts for regeneration
      const contactsFormatted2 = Array.isArray(c.contacts) && c.contacts.length > 0
        ? c.contacts.map(ct => `${ct.name || ''}${ct.email ? ` <${ct.email}>` : ''}${ct.contactNumber ? ` (${ct.contactNumber})` : ''}`.trim()).filter(Boolean).join(' | ')
        : "";
      addField("Employee Contacts", contactsFormatted2);

      // Social Media Links for regeneration
      const social2 = c.socialMedia || {};
      const socialParts2 = [];
      Object.keys(social2).forEach(platform => {
        const arr = social2[platform] || [];
        if (Array.isArray(arr) && arr.length > 0) {
          const items = arr.map(it => {
            const u = it && (it.url || it.link) ? it.url || it.link : (typeof it === 'string' ? it : '');
            const name = it && it.username ? it.username : '';
            return name ? `${name} (${u})` : `${u}`;
          }).filter(Boolean).join('; ');
          if (items) socialParts2.push(`${platform}: ${items}`);
        }
      });
      addField("Social Media Links", socialParts2.join(' | '));
      addField("Source", c.source || "");

      return row;
    });

    const format = original.fileName?.endsWith('.csv') ? 'csv' : 'xlsx';
    const timestamp = Date.now();
    const fileName = `regen_${exportId}_${timestamp}.${format}`;
    
    // Determine headers array: if selectedColumns is null, use the keys of the first row
    const headers = selectedColumns || (rows.length > 0 ? Object.keys(rows[0]) : null);

    let filePath;
    if (format === "csv") {
      filePath = exportService.exportToCSV(rows, fileName, headers);
    } else {
      filePath = exportService.exportToExcel(rows, fileName, headers);
    }

    // Save regeneration history
    await RegenerateHistory.create({
      originalExport: exportId,
      filters:        original.filters,
      ignoredColumns: ignored,
      regeneratedBy:  req.user ? req.user._id : null,
      totalRecords:   companies.length,
      fileName,
      filePath,
    });

    // Increment counter on original
    await ExportHistory.findByIdAndUpdate(exportId, { $inc: { regenerateCount: 1 } });

    res.download(filePath, fileName);
  } catch (err) {
    console.error('regenerateExport error:', err);
    res.status(500).json({ success: false, message: 'Regeneration failed', error: err.message });
  }
};

// ─── Get Regeneration History ────────────────────────────────────────────────

const getRegenerateHistory = async (req, res) => {
  try {
    const { exportId } = req.params;

    const ExportHistory = require("../../models/exportHistory.model");
    const RegenerateHistory = require("../../models/regenerateHistory.model");

    const original = await ExportHistory.findById(exportId)
      .populate('exportedBy', 'name email role')
      .lean();

    if (!original) {
      return res.status(404).json({ success: false, message: 'Export record not found.' });
    }

    const regenerations = await RegenerateHistory.find({ originalExport: exportId })
      .populate('regeneratedBy', 'name email role')
      .sort({ regeneratedAt: -1 })
      .lean();

    res.json({
      success: true,
      originalExport:      original,
      totalRegenerations:  regenerations.length,
      regenerations,
    });
  } catch (err) {
    console.error('getRegenerateHistory error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch regeneration history', error: err.message });
  }
};

const deleteExportHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const ExportHistory = require("../../models/exportHistory.model");
    const RegenerateHistory = require("../../models/regenerateHistory.model");
    const fs = require("fs");
    const path = require("path");

    const record = await ExportHistory.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: "Export history record not found" });
    }

    // Delete primary file from exports directory if exists
    if (record.fileName) {
      const primaryPath = path.join(process.cwd(), "exports", record.fileName);
      if (fs.existsSync(primaryPath)) {
        try {
          fs.unlinkSync(primaryPath);
        } catch (fileErr) {
          console.error("Error deleting primary export file:", fileErr);
        }
      }
    }

    // Find and delete all regeneration histories and their files
    const regenerations = await RegenerateHistory.find({ originalExport: id });
    for (const regen of regenerations) {
      if (regen.filePath && fs.existsSync(regen.filePath)) {
        try {
          fs.unlinkSync(regen.filePath);
        } catch (fileErr) {
          console.error("Error deleting regeneration file:", fileErr);
        }
      }
    }
    await RegenerateHistory.deleteMany({ originalExport: id });

    // Delete main record
    await ExportHistory.findByIdAndDelete(id);

    res.json({ success: true, message: "Export history and files deleted successfully" });
  } catch (error) {
    console.error("deleteExportHistory error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  exportCompanies,
  getExportHistory,
  regenerateExport,
  getRegenerateHistory,
  deleteExportHistory,
};