require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");
const workerPool = require("./src/workers/workerPool");

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on port ${PORT}`);
  workerPool.init();
});