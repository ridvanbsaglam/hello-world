import { useMemo, useState } from 'react';
import ChecklistPanel from './components/ChecklistPanel';
import FeedbackModal from './components/FeedbackModal';
import RiskMeter from './components/RiskMeter';
import SceneHotspots from './components/SceneHotspots';
import ChallengeModal from './components/ChallengeModal';

const checklistTemplate = [
  { key: 'permitVerified', label: 'Permit verified', required: true },
  { key: 'riskAssessmentReviewed', label: 'Risk assessment reviewed', required: true },
  { key: 'atmosphereTested', label: 'Atmosphere tested', required: true },
  { key: 'ventilationConfirmed', label: 'Ventilation confirmed', required: true },
  { key: 'ppeSelected', label: 'PPE selected', required: false },
  { key: 'standbyAssigned', label: 'Standby person assigned', required: true },
  { key: 'communicationTested', label: 'Communication tested', required: false },
  { key: 'rescueReady', label: 'Rescue plan ready', required: true }
];

const screenOrder = {
  title: 1,
  briefing: 2,
  hub: 3,
  permit: 4,
  atmosphere: 5,
  ventilation: 6,
  standby: 7,
  rescue: 8,
  finalAuthorization: 9,
  debrief: 10
};

const challengeContent = {
  permit: {
    title: 'Permit Check',
    prompt: 'Can entry begin with this permit?',
    options: [
      'Yes, because the team is ready.',
      'No, the permit must be valid, authorized, and matched to the task.',
      'Yes, if the job will only take a few minutes.'
    ],
    correctIndex: 1,
    success: {
      title: 'Correct — Permit Verified',
      message:
        'A valid permit and risk assessment are required before enclosed space entry.',
      checklist: ['permitVerified', 'riskAssessmentReviewed'],
      score: 100,
      riskDelta: -18
    },
    failure: {
      title: 'Not Safe — Permit Control Missing',
      message: 'A ready team does not replace a valid, authorized permit.',
      score: -10,
      riskDelta: 8
    }
  },
  atmosphere: {
    title: 'Atmosphere Testing',
    prompt: 'The atmosphere is not confirmed safe. What should happen next?',
    options: [
      'Enter quickly and finish before conditions change.',
      'Ventilate the space and retest before entry.',
      'Send one person in to check whether it smells safe.',
      'Continue if the crew member feels confident.'
    ],
    correctIndex: 1,
    success: {
      title: 'Correct — Ventilation and Retest Required',
      message:
        'Good decision. Atmosphere remains pending until ventilation is completed and retested.',
      checklist: [],
      score: 100,
      riskDelta: -6,
      setAtmospherePending: true
    },
    failure: {
      title: 'Unsafe Choice — Atmosphere Not Confirmed',
      message: 'You cannot rely on smell or confidence. Test, ventilate, and retest first.',
      score: -15,
      riskDelta: 10
    }
  },
  ventilation: {
    title: 'Ventilation and Retest',
    prompt: 'Choose the safest ventilation setup.',
    options: [
      'Fan near hatch but no ducting into the enclosed space.',
      'Duct positioned to ventilate the space effectively before entry.',
      'Fan nearby in case it is needed later.'
    ],
    correctIndex: 1,
    success: {
      title: 'Correct — Ventilation Confirmed',
      message: 'Retest complete: O₂ 20.9%, flammable gas 0% LEL, toxic gas no alarm.',
      checklist: ['ventilationConfirmed', 'atmosphereTested'],
      score: 120,
      riskDelta: -22
    },
    failure: {
      title: 'Not Enough — Ventilation Must Be Effective',
      message: 'Having a fan nearby is not the same as effective ventilation.',
      score: -10,
      riskDelta: 8
    }
  },
  standby: {
    title: 'Standby Person Assignment',
    prompt: 'No standby person is assigned. What should you do?',
    options: [
      'Allow entry because the task is short.',
      'Assign a standby person before entry begins.',
      'Ask the team to call if they need help.',
      'Let the supervisor check later.'
    ],
    correctIndex: 1,
    success: {
      title: 'Correct — Standby Person Assigned',
      message: 'A standby person must monitor from outside and raise the alarm if needed.',
      checklist: ['standbyAssigned', 'communicationTested'],
      score: 110,
      riskDelta: -16
    },
    failure: {
      title: 'Unsafe — No Entry Without Standby',
      message: 'Short tasks can still become fatal. Entry must not begin without standby.',
      score: -15,
      riskDelta: 12
    }
  },
  rescue: {
    title: 'Rescue Readiness',
    prompt: 'Which rescue preparation is acceptable before entry?',
    options: [
      'Rescue can be planned if something goes wrong.',
      'The team outside can enter quickly if needed.',
      'A rescue plan, trained response, and suitable equipment must be ready before entry.',
      'Rescue preparation is not required for routine inspection.'
    ],
    correctIndex: 2,
    success: {
      title: 'Correct — Rescue Plan Ready',
      message: 'Rescue readiness must exist before entry to prevent additional casualties.',
      checklist: ['rescueReady', 'ppeSelected'],
      score: 120,
      riskDelta: -14
    },
    failure: {
      title: 'Critical Risk — Do Not Improvise Rescue',
      message: 'Improvised rescue attempts can create second casualties.',
      score: -20,
      riskDelta: 12
    }
  }
};

const initialChecklist = checklistTemplate.reduce((acc, item) => {
  acc[item.key] = false;
  return acc;
}, {});

export default function App() {
  const [screen, setScreen] = useState('title');
  const [checklist, setChecklist] = useState(initialChecklist);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [risk, setRisk] = useState(88);
  const [openChallenge, setOpenChallenge] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const missingRequired = useMemo(
    () => checklistTemplate.filter((item) => item.required && !checklist[item.key]),
    [checklist]
  );

  const allRequiredComplete = missingRequired.length === 0;

  const handleAnswer = (challengeKey, index) => {
    const challenge = challengeContent[challengeKey];
    const isCorrect = index === challenge.correctIndex;
    const payload = isCorrect ? challenge.success : challenge.failure;

    setScore((prev) => Math.max(0, prev + payload.score));
    setRisk((prev) => Math.max(0, Math.min(100, prev + payload.riskDelta)));

    if (isCorrect) {
      if (payload.checklist?.length) {
        setChecklist((prev) => {
          const next = { ...prev };
          payload.checklist.forEach((key) => {
            next[key] = true;
          });
          return next;
        });
      }
      if (payload.setAtmospherePending) {
        setChecklist((prev) => ({ ...prev, atmosphereTested: false }));
      }
      setOpenChallenge(null);
    } else {
      setMistakes((m) => m + 1);
    }

    setFeedback({ ...payload, isCorrect });
  };

  const handleAuthorizeAttempt = () => {
    if (allRequiredComplete) {
      setScreen('finalAuthorization');
      return;
    }

    setRisk((r) => Math.min(100, r + 8));
    setFeedback({
      isCorrect: false,
      title: 'Entry Denied — Controls Missing',
      message: `Complete the following before authorizing entry: ${missingRequired
        .map((item) => item.label)
        .join(', ')}.`
    });
  };

  const rating = mistakes === 0 ? 'Gold' : mistakes <= 2 ? 'Silver' : 'Bronze';

  return (
    <main className="min-h-screen bg-gradient-to-b from-maritime-900 via-slate-900 to-slate-950 text-slate-100">
      {screen === 'title' && (
        <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
          <p className="mb-4 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1 text-xs uppercase tracking-[0.25em] text-cyan-200">Screen {screenOrder.title}</p>
          <h1 className="text-4xl font-bold md:text-6xl">Enclosed Space Entry Escape Room</h1>
          <p className="mt-6 max-w-2xl text-slate-300">Inspect a shipboard enclosed-space setup, complete critical controls, and authorize entry only when conditions are safe.</p>
          <button onClick={() => setScreen('briefing')} className="mt-10 rounded-lg bg-cyan-600 px-7 py-3 font-semibold text-white hover:bg-cyan-500">Begin Safety Mission</button>
        </section>
      )}

      {screen === 'briefing' && (
        <section className="mx-auto max-w-6xl px-6 py-12">
          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-cyan-200">Screen {screenOrder.briefing}</p>
          <h2 className="text-3xl font-bold">Mission Briefing: Maintenance Inside a Ballast Tank</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
              <p className="text-slate-300">A maintenance team is preparing to enter a ballast tank for inspection and cleaning. The schedule is tight, but no entry can begin until critical safety controls are confirmed.</p>
              <p className="mt-4 text-slate-200"><strong>Your role:</strong> Responsible officer for entry authorization.</p>
              <p className="mt-2 text-cyan-100">Objective: Verify permit, atmosphere, ventilation, standby cover, and rescue readiness.</p>
            </article>
            <article className="rounded-xl border border-cyan-700/40 bg-maritime-800/40 p-6">
              <p className="text-sm uppercase tracking-widest text-cyan-200">Supervisor</p>
              <p className="mt-2 text-lg">“The team is ready, but readiness is not permission.”</p>
              <div className="mt-6 h-28 rounded-lg border border-slate-700 bg-slate-950/70" />
            </article>
          </div>
          <button onClick={() => setScreen('hub')} className="mt-8 rounded-lg bg-cyan-600 px-6 py-3 font-semibold hover:bg-cyan-500">Continue to Entry Area</button>
        </section>
      )}

      {screen === 'hub' && (
        <section className="mx-auto grid min-h-screen max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[300px_1fr_240px]">
          <ChecklistPanel checklist={checklist} template={checklistTemplate} />
          <SceneHotspots onOpenChallenge={setOpenChallenge} onAuthorize={handleAuthorizeAttempt} allRequiredComplete={allRequiredComplete} />
          <div className="space-y-4">
            <RiskMeter risk={risk} />
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Score</p>
              <p className="mt-2 text-3xl font-bold text-cyan-300">{score}</p>
              <p className="mt-2 text-sm text-slate-400">Errors corrected: {mistakes}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-sm text-slate-300">
              Click scene hotspots to complete controls. Unsafe decisions increase risk and lower performance.
            </div>
          </div>
        </section>
      )}

      {screen === 'finalAuthorization' && (
        <section className="mx-auto max-w-4xl px-6 py-16 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Screen {screenOrder.finalAuthorization}</p>
          <h2 className="mt-2 text-4xl font-bold">Final Authorization</h2>
          <p className="mt-5 text-slate-300">Only authorize enclosed space entry if all critical controls are complete.</p>
          <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-slate-700 bg-slate-900/70 p-6 text-left">
            {checklistTemplate.map((item) => (
              <div key={item.key} className="mb-2 flex items-center justify-between">
                <span>{item.label}</span>
                <span className={checklist[item.key] ? 'text-emerald-300' : 'text-rose-300'}>{checklist[item.key] ? 'Complete' : 'Missing'}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => {
                if (allRequiredComplete) setScreen('debrief');
                else handleAuthorizeAttempt();
              }}
              className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold hover:bg-emerald-500"
            >
              Authorize Entry
            </button>
            <button onClick={() => setScreen('hub')} className="rounded-lg border border-slate-600 px-6 py-3 font-semibold hover:bg-slate-800">
              Return to Inspection
            </button>
          </div>
        </section>
      )}

      {screen === 'debrief' && (
        <section className="mx-auto max-w-4xl px-6 py-16">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Screen {screenOrder.debrief}</p>
          <h2 className="mt-2 text-4xl font-bold">Debrief: What Made the Entry Safe?</h2>
          <div className="mt-6 rounded-xl border border-slate-700 bg-slate-900/70 p-6">
            <p className="text-lg">Mission rating: <span className="font-semibold text-cyan-300">{rating}</span></p>
            <p className="mt-2 text-slate-300">Final score: {score}</p>
            <p className="mt-2 text-slate-300">Takeaway: No task is routine enough to skip enclosed space controls.</p>
          </div>
          <div className="mt-6 flex gap-4">
            <button onClick={() => window.location.reload()} className="rounded-lg bg-cyan-600 px-6 py-3 font-semibold hover:bg-cyan-500">Replay Mission</button>
          </div>
        </section>
      )}

      {openChallenge && (
        <ChallengeModal
          challenge={challengeContent[openChallenge]}
          onClose={() => setOpenChallenge(null)}
          onAnswer={(index) => handleAnswer(openChallenge, index)}
        />
      )}

      {feedback && <FeedbackModal feedback={feedback} onClose={() => setFeedback(null)} />}
    </main>
  );
}
