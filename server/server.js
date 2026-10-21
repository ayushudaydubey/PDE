const app = require("./src/app");
const connectDB = require("./src/config/db");
const workerPool = require("./src/workers/workerPool");

require('dotenv').config();
app.listen(3000, async () => {
  await connectDB();
  console.log("Server is running on port 3000");
  workerPool.init();
});