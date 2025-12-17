import { NextResponse } from "next/server";
import { getAuthUid, fetchLatestLogs } from "@/lib/odoo-client";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  console.log("🔄 SYNC STARTED...");

  try {
    const body = await req.json();

    let lastCheck = body.lastCheck;
    if (!lastCheck || lastCheck === "") {
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);
      lastCheck = yesterday.toISOString().replace("T", " ").split(".")[0];
    }

    console.log(`📅 Fetching Odoo logs since: ${lastCheck}`);

    const uid = await getAuthUid();
    if (!uid) {
      console.error(
        "❌ ODOO AUTH FAILED. Check credentials in lib/constants.ts"
      );
      return NextResponse.json({ error: "Auth Failed" }, { status: 401 });
    }
    console.log(`✅ Authenticated as User ID: ${uid}`);

    const logs = await fetchLatestLogs(uid, lastCheck);
    console.log(`📦 Odoo returned ${logs.length} activities.`);

    let newCount = 0;

    for (const log of logs) {
      const isoString = `${log.date}T${log.time}Z`;
      const actionDate = new Date(isoString);

      if (isNaN(actionDate.getTime())) {
        console.warn(`⚠️ Skipping invalid date: ${isoString}`);
        continue;
      }

      try {
        await prisma.log.upsert({
          where: {
            odooId_model: {
              odooId: log.id,
              model: log.model,
            },
          },
          update: {
            details: log.details,
            body: log.body,
          },
          create: {
            odooId: log.id,
            resId: log.resId,
            model: log.model,
            record: log.record,
            type: log.type,
            author: log.author,
            body: log.body,
            details: log.details,
            actionTime: actionDate,
          },
        });
        newCount++;
      } catch (e) {
        console.warn(`⚠️ Failed to upsert log ID ${log.id} - ${e}`);
      }
    }

    console.log(`💾 Saved ${newCount} new records to SQLite.`);

    return NextResponse.json({
      success: true,
      count: newCount,
      serverTime: new Date().toISOString().replace("T", " ").split(".")[0],
    });
  } catch (error) {
    console.error("🔥 SYNC CRASHED:", error);
    return NextResponse.json({ error: "Sync Error" }, { status: 500 });
  }
}
