const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
   company_name: {
  type: String,
  trim: true,
  default: null,
},

    industry: {
      type: String,
      trim: true,
      default: null,
    },

    city: {
      type: String,
      trim: true,
      default: null,
    },

    state: {
      type: String,
      trim: true,
      default: null,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },

    cityNormalized: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },

    emailNormalized: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },

    companyNameNormalized: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },

    duplicateKey: {
      type: String,
      default: null,
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    website: {
      type: String,
      trim: true,
      default: null,
    },

    turnover: {
      type: Number,
      default: null,
    },

    country: {
      type: String,
      trim: true,
      default: null,
    },

    socialMedia: {
      facebook: { type: [{ url: { type: String, trim: true }, username: { type: String, trim: true, default: "" } }], default: [] },
      youtube: { type: [{ url: { type: String, trim: true }, username: { type: String, trim: true, default: "" } }], default: [] },
      instagram: { type: [{ url: { type: String, trim: true }, username: { type: String, trim: true, default: "" } }], default: [] },
      x: { type: [{ url: { type: String, trim: true }, username: { type: String, trim: true, default: "" } }], default: [] },
      linkedin: { type: [{ url: { type: String, trim: true }, username: { type: String, trim: true, default: "" } }], default: [] },
    },

    contactPages: {
      type: [
        {
          name: { type: String, trim: true, default: null },
          url: { type: String, trim: true, default: null },
        },
      ],
      default: [],
    },


    companyOwnerName: {
      type: String,
      trim: true,
      default: null,
    },

    contacts: [
      {
        name: {
          type: String,
          trim: true,
          default: null,
        },

        position: {
          type: String,
          trim: true,
          default: null,
        },

        contactNumber: {
          type: String,
          trim: true,
          default: null,
        },

        email: {
          type: String,
          trim: true,
          lowercase: true,
          default: null,
        },
      },
    ],

    source: {
      type: String,
      enum: ["google_sheet", "mca", "manual", "csv", "excel"],
      default: "manual",
    },

    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],

    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UploadedFile",
      index: true,
    },

    description: {
      type: String,
      default: null,
    },

    leadStatus: {
      status: {
        type: String,
        enum: ["in_progress", "converted", "dead", "none", "New", "Assigned", "Contacted", "Meeting Scheduled", "Proposal Sent", "Negotiation", "Won", "Lost", "On Hold"],
        default: "New",
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      updatedAt: {
        type: Date,
        default: null,
      },
    },

    leadDetails: {
      dealValue: { type: Number, default: null },
      closingDate: { type: Date, default: null },
      remarks: { type: String, default: null },
      lossReason: { type: String, default: null },
      holdReason: { type: String, default: null },
      priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
    },

    nextFollowUp: {
      date: { type: Date, default: null },
      notes: { type: String, default: null },
      assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },

    latestActivity: {
      notes: { type: String, default: null },
      date: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

// ======================================
// Indexes
// ======================================

companySchema.index({ fileId: 1, email: 1 });

companySchema.index({ fileId: 1, phone: 1 });

companySchema.index({ fileId: 1, city: 1 });

// Index for high-performance covered duplicate checking
companySchema.index({ duplicateKey: 1, company_name: 1, city: 1, email: 1 });
companySchema.index({ companyNameNormalized: 1, emailNormalized: 1, cityNormalized: 1 });

companySchema.index({ fileId: 1, industry: 1 });

companySchema.index({ company_name: 1 });

companySchema.index({ website: 1 });

module.exports = mongoose.model("Company", companySchema);
