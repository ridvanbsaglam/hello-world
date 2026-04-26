export default function RiskMeter({ risk }) {
  const tone = risk > 70 ? 'bg-rose-500' : risk > 40 ? 'bg-amber-400' : 'bg-emerald-500';

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Entry Risk</p>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-700">
        <div className={`h-full ${tone} transition-all`} style={{ width: `${risk}%` }} />
      </div>
      <p className="mt-2 text-sm text-slate-300">{risk}%</p>
    </section>
  );
}
