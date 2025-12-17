"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface GraphData {
  time: string;
  count: number;
}

export function ActivityGraph({ data }: { data: GraphData[] }) {
  return (
    <div className="bg-black border border-slate-800 p-4 h-[250px] flex flex-col mb-6 relative group">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs text-slate-500 font-bold tracking-widest uppercase">
          Activity Velocity (Real-time)
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] text-green-500 font-mono">LIVE</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full h-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="#475569"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis
              stroke="#475569"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#000",
                borderColor: "#334155",
                color: "#f8fafc",
                fontSize: "12px",
                borderRadius: "4px",
              }}
              itemStyle={{ color: "#22c55e" }}
              cursor={{ stroke: "#334155", strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#22c55e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCount)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm text-slate-600 font-mono text-xs">
          Gathering metrics...
        </div>
      )}
    </div>
  );
}
