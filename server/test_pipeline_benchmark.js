const fs = require("fs");
const path = require("path");
const fileService = require("./src/services/fileService");

async function runBenchmark() {
  console.log("==========================================");
  console.log(" PRODUCTION PIPELINE STREAMING BENCHMARK ");
  console.log("==========================================");

  const mockCsvPath = path.resolve(__dirname, "./benchmark_100k.csv");
  console.log(`[Benchmark] Generating 100,000 row mock CSV file at: ${mockCsvPath}`);

  const writeStream = fs.createWriteStream(mockCsvPath);
  writeStream.write("Company Name,City,Email,Industry\n");
  for (let i = 1; i <= 100000; i++) {
    // Introduce 10% intentional intra-file duplicate keys
    const dupIdx = i % 10 === 0 ? i - 1 : i;
    writeStream.write(`Prospect Company ${dupIdx},Mumbai,prospect${dupIdx}@engine.com,SaaS\n`);
  }
  writeStream.end();

  await new Promise((res) => writeStream.on("finish", res));
  console.log("[Benchmark] Mock CSV generation complete.");

  const startMem = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`[Benchmark] Initial Heap Memory: ${startMem.toFixed(2)} MB`);

  console.time("Streaming100kRows");
  let rowCount = 0;
  let maxMem = startMem;

  for await (const row of fileService.streamFileRows(mockCsvPath, "text/csv")) {
    rowCount++;
    if (rowCount % 10000 === 0) {
      const curMem = process.memoryUsage().heapUsed / 1024 / 1024;
      if (curMem > maxMem) maxMem = curMem;
      console.log(`[Benchmark] Processed ${rowCount} rows | Heap Memory: ${curMem.toFixed(2)} MB`);
    }
  }
  console.timeEnd("Streaming100kRows");

  const endMem = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log("------------------------------------------");
  console.log(`[Benchmark] Total Rows Streamed: ${rowCount}`);
  console.log(`[Benchmark] Maximum Heap Used: ${maxMem.toFixed(2)} MB`);
  console.log(`[Benchmark] Final Heap Used: ${endMem.toFixed(2)} MB`);
  console.log("==========================================");

  // Clean up mock file
  if (fs.existsSync(mockCsvPath)) {
    fs.unlinkSync(mockCsvPath);
    console.log("[Benchmark] Cleaned up temporary benchmark file.");
  }

  if (maxMem < 150) {
    console.log("[SUCCESS] Constant memory footprint verified (< 150MB heap peak for 100k rows)!");
  } else {
    console.warn("[WARNING] Memory usage exceeded expected bounded threshold.");
  }
}

runBenchmark();
