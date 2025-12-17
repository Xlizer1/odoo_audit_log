import { NextResponse } from "next/server";
import { getAuthUid, fetchLatestLogs } from "@/lib/odoo-client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const lastCheck =
      body.lastCheck ||
      new Date().toISOString().replace("T", " ").split(".")[0];

    const uid = await getAuthUid();
    if (!uid)
      return NextResponse.json({ error: "Auth Failed" }, { status: 401 });

    const start = Date.now();
    const logs = await fetchLatestLogs(uid, lastCheck);
    const end = Date.now();

    return NextResponse.json({
      success: true,
      ping: end - start,
      logs: logs,
      serverTime: new Date().toISOString().replace("T", " ").split(".")[0],
    });
  } catch {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
