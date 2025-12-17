/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "ALL";

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const skip = (page - 1) * limit;

  const whereObject: any = {
    AND: [
      search
        ? {
            OR: [
              { record: { contains: search } },
              { author: { contains: search } },
              { body: { contains: search } },
              { details: { contains: search } },
            ],
          }
        : {},
      type !== "ALL" ? { type: { equals: type } } : {},

      startDate && endDate
        ? {
            actionTime: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }
        : {},
    ],
  };

  try {
    const [logs, total] = await prisma.$transaction([
      prisma.log.findMany({
        where: whereObject,
        orderBy: { actionTime: "desc" },
        take: limit,
        skip: skip,
      }),
      prisma.log.count({ where: whereObject }),
    ]);

    const formattedLogs = logs.map((log: any) => {
      const dateObj = new Date(log.actionTime);
      const baghdadDate = dateObj.toLocaleDateString("en-CA", {
        timeZone: "Asia/Baghdad",
      });
      const baghdadTime = dateObj.toLocaleTimeString("en-GB", {
        timeZone: "Asia/Baghdad",
        hour12: false,
      });

      return {
        id: log.odooId,
        dbId: log.id,
        resId: log.resId,
        date: baghdadDate,
        time: baghdadTime,
        model: log.model,
        record: log.record,
        author: log.author,
        body: log.body,
        type: log.type,
        details: log.details || "",
      };
    });

    return NextResponse.json({
      data: formattedLogs,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}
