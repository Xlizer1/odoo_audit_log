export function Leaderboard({
  stats,
}: {
  stats: { name: string; count: number }[];
}) {
  return (
    <div className="bg-black border border-slate-800 p-4 h-[calc(100vh-435px)]">
      <h3 className="text-xs text-slate-500 font-bold tracking-widest mb-4 uppercase">
        Top Active Staff
      </h3>
      <ul className="space-y-3">
        {stats.map((user, idx) => (
          <li
            key={user.name}
            className="flex justify-between items-center text-sm"
          >
            <div className="flex items-center gap-3">
              <span
                className={`font-mono font-bold ${
                  idx === 0 ? "text-yellow-500" : "text-slate-600"
                }`}
              >
                {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
              </span>
              <span className="text-slate-300">{user.name}</span>
            </div>
            <span className="bg-slate-900 text-slate-400 px-2 py-0.5 rounded text-xs font-mono">
              {user.count}
            </span>
          </li>
        ))}
        {stats.length === 0 && (
          <li className="text-slate-600 text-xs italic">Waiting for data...</li>
        )}
      </ul>
    </div>
  );
}
