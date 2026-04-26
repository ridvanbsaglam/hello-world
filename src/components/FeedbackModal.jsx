export default function FeedbackModal({ feedback, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-6">
        <h3 className={`text-xl font-bold ${feedback.isCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>{feedback.title}</h3>
        <p className="mt-3 text-slate-300">{feedback.message}</p>
        <button onClick={onClose} className="mt-6 rounded-lg bg-cyan-600 px-5 py-2 font-semibold hover:bg-cyan-500">Continue</button>
      </div>
    </div>
  );
}
