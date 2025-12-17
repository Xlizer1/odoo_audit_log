import { OdooLog } from "@/types";
import { MONITORED_MODELS } from "@/lib/constants";
import { Zap, User, ArrowRight, ExternalLink } from "lucide-react";

export function LogItem({ log }: { log: OdooLog }) {
  const config = MONITORED_MODELS[log.model] || {
    color: "text-slate-500",
    label: "MISC",
  };

  // Highlight Keywords Logic
  const isPositive = /Done|Posted|Paid/.test(log.body);
  const isNegative = /Cancelled|Refused|Error/.test(log.body);

  return (
    <div className="group relative border-l-2 border-slate-800 bg-[#080808] hover:bg-[#0F0F0F] transition-colors mb-1 rounded-r-sm">
      <div className="flex items-start p-3 gap-4">
        <div className="flex flex-col items-end min-w-[70px] border-r border-slate-800 pr-3 py-0.5">
          <span className="text-[10px] text-slate-500 font-mono leading-none mb-1">
            {log.date}
          </span>
          <span className="text-xs text-slate-300 font-mono font-bold leading-none">
            {log.time}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/5 ${config.color}`}
            >
              {config.label}
            </span>

            {log.resId ? (
              <a
                href={`https://advicts-ajialbaghdad.odoo.com/web#id=${log.resId}&model=${log.model}&view_type=form`}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link flex items-center gap-1 text-sm font-bold text-slate-200 font-mono hover:text-green-400 transition-colors"
              >
                {log.record}
                <ExternalLink
                  size={10}
                  className="opacity-0 group-hover/link:opacity-100 transition-opacity"
                />
              </a>
            ) : (
              <span className="text-sm font-bold text-slate-200 font-mono truncate">
                {log.record}
              </span>
            )}
          </div>

          {log.details && (
            <div className="flex items-start gap-2 mb-2 bg-yellow-900/10 border-l-2 border-yellow-600/50 pl-2 py-1 rounded-r">
              <Zap size={12} className="text-yellow-500 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-yellow-500/90 font-mono leading-tight">
                {log.details}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 text-cyan-500 font-bold shrink-0 bg-cyan-950/30 px-1.5 rounded">
              <User size={10} />
              {log.author}
            </div>

            <ArrowRight size={10} className="text-slate-600 shrink-0" />

            <div
              dir="auto"
              className={`truncate font-medium ${
                isPositive
                  ? "text-green-400"
                  : isNegative
                  ? "text-red-400"
                  : "text-slate-400"
              }`}
            >
              {log.body}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
