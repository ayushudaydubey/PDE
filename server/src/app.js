const express = require("express");
const path = require("path");
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

app.use(cookieParser());
app.use(express.json());
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(compression());

const whitelist = [
  "http://localhost:5173",
  
  "https://pde-a7wj.onrender.com",
  "http://pde-a7wj.onrender.com",
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

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Serve static frontend assets from public directory
app.use(express.static(path.join(__dirname, "../public")));

// Backend Healthcheck endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PDE Backend Running",
  });
});

// API Routes
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


app.get("*name", (req, res) =>
  req.path.startsWith("/api")
    ? res.status(404).json({ message: "API not found" })
    : res.sendFile(path.join(__dirname, "../public/index.html"))
);

// Global Error Handler
app.use(errorMiddleware);

module.exports = app;