/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

const API_URL = "http://localhost:3000/api/sync";
const INTERVAL = 10000; // 10 Seconds

console.log("🚀 STARTING SERVER-SIDE SYNC ENGINE...");
console.log(`Target: ${API_URL}`);

let lastCheck = new Date();
lastCheck.setHours(lastCheck.getHours() - 1); // Start from 1 hour ago
let lastCheckStr = lastCheck.toISOString().replace("T", " ").split(".")[0];

async function sync() {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastCheck: lastCheckStr }),
    });

    const data = await res.json();

    if (data.success) {
      if (data.count > 0) {
        console.log(
          `[${new Date().toLocaleTimeString()}] ✅ Synced ${
            data.count
          } new logs.`
        );
        lastCheckStr = data.serverTime;
      }
    } else {
      console.error(
        `[${new Date().toLocaleTimeString()}] ❌ Sync Failed:`,
        data.error
      );
    }
  } catch (error) {
    console.error(
      `[${new Date().toLocaleTimeString()}] 🔥 Connection Error (Is the Next.js app running?)`
    );
  }
}

sync();
setInterval(sync, INTERVAL);
