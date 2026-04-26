export default function ChecklistPanel({ checklist, template }) {
  return (
    <aside className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
      <h3 className="text-lg font-semibold">Safety Control Checklist</h3>
      <ul className="mt-4 space-y-2 text-sm">
        {template.map((item) => {
          const done = checklist[item.key];
          return (
            <li key={item.key} className="flex items-center justify-between rounded-md border border-slate-700 px-3 py-2">
              <span>{item.label}</span>
              <span className={done ? 'text-emerald-300' : 'text-amber-300'}>{done ? '✓' : '…'}</span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
