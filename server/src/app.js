const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth/authRoutes");
const companyRoutes = require("./routes/company/companyRoutes");
const importRoutes = require("./routes/import/importRoutes");
const exportRoutes = require("./routes/export/exportRoutes");
const tagRoutes = require("./routes/tag/tagRoutes");
const filesRoutes = require("./routes/files/filesRoutes");
const filtersRoutes = require("./routes/filters/filtersRoutes");
const userRoutes = require("./routes/user/userRoutes");
const targetListRoutes = require("./routes/targetList/targetListRoutes");
const activityRoutes = require("./routes/activity/activityRoutes");
const followUpRoutes = require("./routes/followUp/followUpRoutes");
const notificationRoutes = require("./routes/notification/notificationRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();


// ======================
// BASIC MIDDLEWARE
// ======================
app.use(cookieParser());
app.use(express.json());
app.use(helmet());
app.use(compression());


// ======================
// CORS CONFIG (FIXED)
// ======================
const whitelist = [
  "http://localhost:5173",

  "https://pde.gnosysdigital.com",
  "http://63.143.38.172",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (whitelist.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  optionsSuccessStatus: 204,
};


// ======================
// APPLY CORS (ONLY ONCE)
// ======================
app.use(cors(corsOptions));


// ======================
// PRE-FLIGHT FIX (IMPORTANT)
// ======================
app.options(/.*/, cors(corsOptions));


// ======================
// TEST ROUTE
// ======================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PDE Backend Running",
  });
});


// ======================
// ROUTES
// ======================
app.use("/api/auth", authRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/import", importRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/tag", tagRoutes);
app.use("/api/files", filesRoutes);
app.use("/api/filters", filtersRoutes);
app.use("/api/users", userRoutes);
app.use("/api/target-lists", targetListRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/follow-ups", followUpRoutes);
app.use("/api/notifications", notificationRoutes);


// ======================
// ERROR HANDLER
// ======================
app.use(errorMiddleware);


// ======================
// EXPORT
// ======================
module.exports = app;