import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { api } from './AuthContext';

const C = {
  bg: '#0f172a', surface: '#1e293b', surfaceAlt: '#162032',
  border: '#334155', text: '#f1f5f9', muted: '#94a3b8',
  accent: '#f59e0b', green: '#22c55e', red: '#ef4444', blue: '#3b82f6', purple: '#a855f7',
};

const PASS_SCORE = 100; // Must get ALL questions correct

// ── Single universal course ────────────────────────────────────────────────────
const COURSE = {
  id: 'vocatrade-certification',
  title: 'VocaTrade Service Provider Certification',
  trade: 'General Trade',
  description: 'Complete all 8 video lessons covering trade safety, tools, diagnostics, documentation, client handling, pricing, quality, and emergency response. Pass the final test to earn your certification and become requestable by clients.',
  duration: '4h 20m',
  lessons: [
    {
      id: 'l1',
      title: 'Video 1 — Workplace Safety & PPE',
      duration: '32 min',
      videoId: 'mc979OhitAg',  // Safety at work / electrical safety overview
      summary: 'Personal protective equipment, hazard identification, OSHA standards, and lockout/tagout procedures.',
    },
    {
      id: 'l2',
      title: 'Video 2 — Tools, Materials & Equipment',
      duration: '28 min',
      videoId: 'lLVpOnYJNhQ',  // Trade tools overview
      summary: 'Correct selection and use of hand tools, power tools, and trade-specific materials.',
    },
    {
      id: 'l3',
      title: 'Video 3 — Field Procedures & Documentation',
      duration: '35 min',
      videoId: 'rMcFpWmFXhI',  // Field work / documentation
      summary: 'Site inspection, work orders, field logs, client communication, and quality checks.',
    },
    {
      id: 'l4',
      title: 'Video 4 — Professional Standards & Ethics',
      duration: '25 min',
      videoId: 'sNnR5uYQDjk',  // Professionalism in trades
      summary: 'Code of conduct, client relations, pricing transparency, and ongoing certification requirements.',
    },
    {
      id: 'l5',
      title: 'Video 5 — Diagnostic Thinking',
      duration: '31 min',
      videoId: 'qOQ3fZJj6oQ',
      summary: 'How to isolate symptoms, identify root causes, choose measurements, and avoid replacing parts before proving the fault.',
    },
    {
      id: 'l6',
      title: 'Video 6 — Code Awareness & Compliance',
      duration: '34 min',
      videoId: 'J3dX3f_BWb0',
      summary: 'How to read applicable safety guidance, follow local requirements, and know when work is outside your certified scope.',
    },
    {
      id: 'l7',
      title: 'Video 7 — Client Estimates & Service Flow',
      duration: '30 min',
      videoId: '8YJr4G6QqBc',
      summary: 'Clear scope, estimates, timelines, change requests, communication, and professional closeout with the client.',
    },
    {
      id: 'l8',
      title: 'Video 8 — Emergency Response & Quality Review',
      duration: '32 min',
      videoId: 'VdU6YkWZ1G8',
      summary: 'Prioritizing hazards, stabilizing the site, documenting the repair, and checking work before client handoff.',
    },
  ],
  quiz: [
    {
      q: 'What does PPE stand for?',
      options: ['Personal Protective Equipment', 'Professional Practice Evaluation', 'Primary Protection Enforcement', 'Practical Performance Exam'],
      answer: 0,
    },
    {
      q: 'Lockout/Tagout (LOTO) procedures are used to:',
      options: ['Lock a job site after hours', 'Prevent accidental startup of equipment during maintenance', 'Tag tools for inventory', 'Lock in a project price'],
      answer: 1,
    },
    {
      q: 'Before using a power tool on a job site you should:',
      options: ['Inspect it for damage and ensure guards are in place', 'Use it immediately to save time', 'Remove the safety guard for better access', 'Only check it after finishing the job'],
      answer: 0,
    },
    {
      q: 'A field log is used to:',
      options: ['Store tools overnight', 'Record hours worked, tasks completed, and any site issues', 'Log complaints about coworkers', 'Track personal expenses'],
      answer: 1,
    },
    {
      q: 'When a client asks you to do work outside your certified scope, you should:',
      options: ['Do it anyway to keep the client happy', 'Decline and refer them to a qualified professional', 'Charge double and proceed', 'Ignore the request'],
      answer: 1,
    },
    {
      q: 'A good diagnostic process should begin by:',
      options: ['Replacing the most expensive component first', 'Confirming the symptom, checking safety, and taking measurements', 'Guessing based on the client description only', 'Skipping documentation until payment is complete'],
      answer: 1,
    },
    {
      q: 'Before sending a final estimate, a provider should:',
      options: ['Hide possible extra charges', 'Explain scope, assumptions, timeline, and exclusions clearly', 'Promise the fastest completion regardless of risk', 'Avoid written communication'],
      answer: 1,
    },
    {
      q: 'Emergency response on a job site should prioritize:',
      options: ['Finishing the repair at any cost', 'Safety, isolation of hazards, and clear communication', 'Collecting payment first', 'Moving equipment without checking risks'],
      answer: 1,
    },
  ],
};

// ── Certificate ────────────────────────────────────────────────────────────────
function Certificate({ userName, score, onClose }) {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
      <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f2340)', border: '2px solid #f59e0b', borderRadius: 20, padding: '3rem 2.5rem', maxWidth: 560, width: '100%', textAlign: 'center', boxShadow: '0 0 80px rgba(245,158,11,0.35)' }}>
        <div style={{ fontSize: 60, marginBottom: 10 }}>🏆</div>
        <div style={{ color: C.accent, fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 }}>Certificate of Completion</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>VocaTrade Platform</h2>
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`, margin: '14px 0' }} />
        <p style={{ color: C.muted, fontSize: 13, marginBottom: 6 }}>This certifies that</p>
        <p style={{ fontSize: 26, fontWeight: 800, color: C.text, marginBottom: 6 }}>{userName}</p>
        <p style={{ color: C.muted, fontSize: 13, marginBottom: 4 }}>has successfully completed</p>
        <p style={{ fontSize: 17, fontWeight: 700, color: C.accent, marginBottom: 20 }}>{COURSE.title}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.green }}>{score}%</div>
            <div style={{ color: C.muted, fontSize: 11 }}>Test Score</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.blue }}>{COURSE.lessons.length}</div>
            <div style={{ color: C.muted, fontSize: 11 }}>Lessons</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.purple }}>{date.split(' ').pop()}</div>
            <div style={{ color: C.muted, fontSize: 11 }}>Year</div>
          </div>
        </div>
        <div style={{ background: '#0d1f0d', border: '1px solid #166534', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#86efac' }}>
          ✅ You are now a <strong>Certified Service Provider</strong> and appear in the client hiring directory.
        </div>
        <p style={{ color: C.muted, fontSize: 11, marginBottom: 18 }}>Issued on {date}</p>
        <button onClick={onClose} style={{ padding: '12px 36px', background: `linear-gradient(135deg, ${C.accent}, #d97706)`, color: '#0f172a', fontWeight: 700, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15 }}>
          🎉 Go to Dashboard
        </button>
      </div>
    </div>
  );
}

// ── Quiz ───────────────────────────────────────────────────────────────────────
function Quiz({ onPass, onFail, onBack }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubmit = () => {
    const correct = COURSE.quiz.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0);
    const pct = Math.round((correct / COURSE.quiz.length) * 100);
    setScore(pct);
    setSubmitted(true);
    if (pct >= PASS_SCORE) onPass(pct);
    else onFail(pct);
  };

  const allAnswered = Object.keys(answers).length === COURSE.quiz.length;

  return (
    <div style={{ maxWidth: 660, margin: '0 auto' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
        ← Back to lessons
      </button>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '1.5rem', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>📝 Final Certification Test</h2>
        <p style={{ color: C.muted, fontSize: 13 }}>
          {COURSE.quiz.length} questions · Need ≥{PASS_SCORE}% to earn your certificate
        </p>
      </div>

      {COURSE.quiz.map((q, qi) => {
        const userAns = answers[qi];
        const isCorrect = submitted && userAns === q.answer;
        const isWrong = submitted && userAns !== undefined && userAns !== q.answer;
        return (
          <div key={qi} style={{
            background: C.surface,
            border: `1px solid ${submitted ? (isCorrect ? C.green : isWrong ? C.red : C.border) : C.border}`,
            borderRadius: 12, padding: '1.25rem', marginBottom: 12,
          }}>
            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>{qi + 1}. {q.q}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {q.options.map((opt, oi) => {
                let bg = '#0f172a', border = '#334155', color = C.text;
                if (submitted) {
                  if (oi === q.answer) { bg = '#0d1f0d'; border = C.green; color = C.green; }
                  else if (oi === userAns) { bg = '#1f0d0d'; border = C.red; color = C.red; }
                } else if (userAns === oi) {
                  bg = '#1a1000'; border = C.accent; color = C.accent;
                }
                return (
                  <button key={oi} disabled={submitted}
                    onClick={() => setAnswers((p) => ({ ...p, [qi]: oi }))}
                    style={{ padding: '9px 14px', background: bg, border: `1px solid ${border}`, borderRadius: 8, color, fontSize: 13, textAlign: 'left', cursor: submitted ? 'default' : 'pointer' }}>
                    {String.fromCharCode(65 + oi)}. {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {!submitted ? (
        <button onClick={handleSubmit} disabled={!allAnswered}
          style={{ width: '100%', padding: 14, background: allAnswered ? `linear-gradient(135deg, ${C.accent}, #d97706)` : C.border, color: allAnswered ? '#0f172a' : C.muted, fontWeight: 700, border: 'none', borderRadius: 10, cursor: allAnswered ? 'pointer' : 'not-allowed', fontSize: 15, marginTop: 4 }}>
          Submit Test →
        </button>
      ) : (
        <div style={{ background: score === 100 ? '#0d1f0d' : '#1f0d0d', border: `1px solid ${score === 100 ? C.green : C.red}`, borderRadius: 12, padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: score === 100 ? C.green : C.red, marginBottom: 8 }}>{score}%</div>
          {score === 100 ? (
            <p style={{ color: C.green, fontWeight: 700, fontSize: 15 }}>🎉 Perfect Score! All questions correct. Your certificate is ready.</p>
          ) : (
            <>
              <p style={{ color: C.red, fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
                ❌ {COURSE.quiz.length - Math.round(score / 100 * COURSE.quiz.length)} question{COURSE.quiz.length - Math.round(score / 100 * COURSE.quiz.length) !== 1 ? 's' : ''} wrong — you must answer ALL questions correctly to earn the certificate.
              </p>
              <p style={{ color: C.muted, fontSize: 13, marginBottom: 16 }}>Review the highlighted answers above, go back to the lessons, and try again.</p>
              <button
                onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                  setScore(0);
                  onFail(score);
                }}
                style={{ padding: '10px 28px', background: `linear-gradient(135deg, ${C.accent}, #d97706)`, color: '#0f172a', fontWeight: 700, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
                🔄 Try Again
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Course Player ──────────────────────────────────────────────────────────────
function CoursePlayer({ completedLessons, onLessonComplete, onStartQuiz }) {
  const [activeLesson, setActiveLesson] = useState(COURSE.lessons[0]);
  const allDone = COURSE.lessons.every((l) => completedLessons.has(l.id));
  const progress = Math.round((completedLessons.size / COURSE.lessons.length) * 100);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, alignItems: 'start' }}>
      {/* Sidebar */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '1.25rem', position: 'sticky', top: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: 1 }}>Course Content</h3>

        {/* Progress */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ height: 5, background: '#334155', borderRadius: 3, marginBottom: 4 }}>
            <div style={{ height: '100%', width: `${progress}%`, background: progress === 100 ? C.green : C.blue, borderRadius: 3, transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontSize: 11, color: C.muted }}>{completedLessons.size} of {COURSE.lessons.length} done · {progress}%</span>
        </div>

        {COURSE.lessons.map((l) => {
          const done = completedLessons.has(l.id);
          const active = activeLesson.id === l.id;
          return (
            <button key={l.id} onClick={() => setActiveLesson(l)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: active ? '#1a2a1a' : 'none', border: active ? `1px solid ${C.green}` : '1px solid transparent', cursor: 'pointer', marginBottom: 4, textAlign: 'left' }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{done ? '✅' : active ? '▶️' : '⬜'}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? C.text : C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{l.duration}</div>
              </div>
            </button>
          );
        })}

        {allDone && (
          <button onClick={onStartQuiz}
            style={{ width: '100%', marginTop: 14, padding: '10px', background: `linear-gradient(135deg, ${C.accent}, #d97706)`, color: '#0f172a', fontWeight: 700, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
            📝 Take Final Test
          </button>
        )}
      </div>

      {/* Video + info */}
      <div>
        <div style={{ background: '#000', borderRadius: 14, overflow: 'hidden', aspectRatio: '16/9', marginBottom: 14 }}>
          <iframe
            key={activeLesson.videoId}
            width="100%" height="100%"
            src={`https://www.youtube.com/embed/${activeLesson.videoId}?rel=0&modestbranding=1`}
            title={activeLesson.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ display: 'block' }}
          />
        </div>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 3 }}>{activeLesson.title}</h2>
              <p style={{ color: C.muted, fontSize: 12 }}>{activeLesson.duration}</p>
            </div>
            {completedLessons.has(activeLesson.id) ? (
              <span style={{ color: C.green, fontSize: 13, fontWeight: 600 }}>✅ Completed</span>
            ) : (
              <button onClick={() => onLessonComplete(activeLesson.id)}
                style={{ padding: '8px 18px', background: `linear-gradient(135deg, ${C.green}, #16a34a)`, color: '#fff', fontWeight: 700, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                ✅ Mark Complete
              </button>
            )}
          </div>
          <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.6 }}>{activeLesson.summary}</p>

          {allDone && (
            <div style={{ marginTop: 14, background: '#1a1000', border: `1px solid ${C.accent}`, borderRadius: 8, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <p style={{ color: C.accent, fontSize: 13, fontWeight: 600 }}>🎓 All lessons done! Take the final test to earn your certificate.</p>
              <button onClick={onStartQuiz}
                style={{ padding: '8px 18px', background: `linear-gradient(135deg, ${C.accent}, #d97706)`, color: '#0f172a', fontWeight: 700, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                Start Test →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function CoursesPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('player');       // 'player' | 'quiz'
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [certified, setCertified] = useState(Boolean(user?.isCertified));
  const [certScore, setCertScore] = useState(null);
  const [showCert, setShowCert] = useState(false);
  const [failScore, setFailScore] = useState(null);

  useEffect(() => {
    setCertified(Boolean(user?.isCertified));
  }, [user?.isCertified]);

  const markLesson = (lessonId) => {
    setCompletedLessons((prev) => new Set([...prev, lessonId]));
  };

  const handlePass = async (score) => {
    setCertified(true);
    setCertScore(score);
    try {
      await api.put('/users/me/certify', {
        trade: user?.tradeCategory || 'General Trade',
        course: COURSE.title,
        score,
      });
      await refreshUser();
    } catch { /* offline fallback */ }
    setShowCert(true);
    toast.success('🏆 Certificate earned!');
  };

  const handleFail = (score) => {
    setFailScore(score);
    toast.error(`${score}% — need ${PASS_SCORE}% to pass. Review the lessons and try again.`);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: '1.5rem' }}>
      <Toaster position="top-right" />

      {showCert && (
        <Certificate
          userName={user?.name || 'Service Provider'}
          score={certScore}
          onClose={() => { setShowCert(false); navigate('/dashboard'); }}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>🎓 {COURSE.title}</h1>
          <p style={{ color: C.muted, fontSize: 13 }}>{COURSE.description}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {certified ? (
            <button onClick={() => setShowCert(true)}
              style={{ padding: '8px 18px', background: '#0d1f0d', border: `1px solid ${C.green}`, color: C.green, borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
              🏆 View Certificate
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: C.muted, alignItems: 'center' }}>
              <span>📹 {COURSE.lessons.length} lessons</span>
              <span>⏱ {COURSE.duration}</span>
              <span>📝 {COURSE.quiz.length}-q test</span>
            </div>
          )}
          <button onClick={() => navigate('/dashboard')}
            style={{ padding: '8px 16px', background: C.surface, border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
            ← Dashboard
          </button>
        </div>
      </div>

      {/* Status bar */}
      {!certified && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 16px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14 }}>📊</span>
          <span style={{ fontSize: 13, color: C.muted }}>Progress:</span>
          <div style={{ flex: 1, height: 6, background: '#334155', borderRadius: 3, minWidth: 120 }}>
            <div style={{ height: '100%', width: `${(completedLessons.size / COURSE.lessons.length) * 100}%`, background: `linear-gradient(90deg, ${C.blue}, ${C.green})`, borderRadius: 3, transition: 'width 0.4s' }} />
          </div>
          <span style={{ fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>{completedLessons.size}/{COURSE.lessons.length} lessons</span>
          {failScore !== null && (
            <span style={{ color: C.red, fontSize: 12, fontWeight: 600 }}>Last test: {failScore}% (need {PASS_SCORE}%)</span>
          )}
        </div>
      )}

      {view === 'player' && (
        <CoursePlayer
          completedLessons={completedLessons}
          onLessonComplete={markLesson}
          onStartQuiz={() => setView('quiz')}
        />
      )}

      {view === 'quiz' && (
        <Quiz
          onPass={handlePass}
          onFail={handleFail}
          onBack={() => setView('player')}
        />
      )}
    </div>
  );
}
