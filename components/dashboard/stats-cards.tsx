import { Wifi, Activity } from "lucide-react";

export function StatsCards({ ping, count }: { ping: number; count: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-black border border-slate-800 p-4">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-2 uppercase">
          <Wifi size={14} /> Network Latency
        </div>
        <div className="text-2xl font-mono text-green-500 font-bold">
          {ping} <span className="text-sm text-slate-600">ms</span>
        </div>
        <div className="w-full bg-slate-900 h-1 mt-2 overflow-hidden rounded-full">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${Math.min(100, (ping / 200) * 100)}%` }}
          />
        </div>
      </div>

      <div className="bg-black border border-slate-800 p-4">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-2 uppercase">
          <Activity size={14} /> Velocity
        </div>
        <div className="text-2xl font-mono text-cyan-500 font-bold">
          {count} <span className="text-sm text-slate-600">/min</span>
        </div>
        <div className="text-xs text-slate-600 mt-2">
          Actions tracked in real-time
        </div>
      </div>
    </div>
  );
}
