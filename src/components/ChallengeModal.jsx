export default function ChallengeModal({ challenge, onClose, onAnswer }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-cyan-900/60 bg-slate-900 p-6">
        <h3 className="text-2xl font-bold text-cyan-200">{challenge.title}</h3>
        <p className="mt-3 text-slate-300">{challenge.prompt}</p>
        <div className="mt-6 space-y-3">
          {challenge.options.map((option, index) => (
            <button
              key={option}
              onClick={() => onAnswer(index)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-left text-sm hover:border-cyan-500 hover:bg-slate-700"
            >
              {String.fromCharCode(65 + index)}. {option}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="mt-6 rounded-lg border border-slate-600 px-5 py-2 text-sm hover:bg-slate-800">Close</button>
      </div>
    </div>
  );
}
