const spots = [
  { key: 'permit', label: 'Permit Board', x: '18%', y: '24%' },
  { key: 'atmosphere', label: 'Gas Detector', x: '52%', y: '26%' },
  { key: 'ventilation', label: 'Ventilation Blower', x: '70%', y: '52%' },
  { key: 'standby', label: 'Standby Position', x: '36%', y: '68%' },
  { key: 'rescue', label: 'Rescue Cabinet', x: '82%', y: '24%' }
];

export default function SceneHotspots({ onOpenChallenge, onAuthorize, allRequiredComplete }) {
  return (
    <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Entry Area Inspection</h2>
        <button
          onClick={onAuthorize}
          className={`rounded-lg px-4 py-2 font-semibold ${allRequiredComplete ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-600 hover:bg-amber-500'}`}
        >
          Final Authorize Entry
        </button>
      </div>
      <p className="text-sm text-slate-300">Click hotspot cards in the shipboard scene to inspect controls.</p>
      <div className="relative mt-4 h-[520px] overflow-hidden rounded-xl border border-slate-700 bg-gradient-to-br from-maritime-800/80 to-slate-800">
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-slate-900/40" />
        <div className="absolute left-8 top-8 rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-xs">Hatch Area</div>
        {spots.map((spot) => (
          <button
            key={spot.key}
            onClick={() => onOpenChallenge(spot.key)}
            style={{ left: spot.x, top: spot.y }}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border border-cyan-400/40 bg-cyan-500/20 px-3 py-2 text-xs font-semibold hover:bg-cyan-500/35"
          >
            {spot.label}
          </button>
        ))}
      </div>
    </section>
  );
}
