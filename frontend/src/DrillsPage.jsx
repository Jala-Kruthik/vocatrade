import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { api } from './AuthContext';

const C = { bg: '#0f172a', surface: '#1e293b', surfaceAlt: '#162032', border: '#334155', text: '#f1f5f9', muted: '#94a3b8', accent: '#f59e0b', green: '#22c55e', red: '#ef4444', blue: '#3b82f6' };
const TRADES = ['Plumbing', 'Electrical', 'HVAC', 'Carpentry', 'Welding', 'Masonry', 'Automotive'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
const LOCAL_HISTORY_KEY = 'vocatrade-drill-history';

const QUESTION_BANK = {
  Plumbing: [
    ['What should you do before repairing a leaking pipe?', ['Increase water pressure', 'Shut off the water supply', 'Heat the pipe', 'Open every tap'], 1],
    ['Water hammer is usually caused by:', ['Sudden valve closure', 'Low paint quality', 'Loose tiles', 'Wrong wire size'], 0],
    ['PTFE tape is commonly used to:', ['Seal threaded pipe joints', 'Measure pipe length', 'Cut copper', 'Clean drains'], 0],
    ['A trap under a sink mainly prevents:', ['Sewer gas entering the room', 'Water heating', 'Pipe expansion', 'Paint peeling'], 0],
    ['Which tool is used to cut PVC pipe cleanly?', ['Pipe cutter', 'Voltage tester', 'Trowel', 'Sledgehammer'], 0],
    ['Low water pressure can be caused by:', ['Clogged aerator', 'Bright lighting', 'New paint', 'Loose door hinge'], 0],
    ['Before soldering copper pipe, the pipe should be:', ['Cleaned and fluxed', 'Painted', 'Filled with water', 'Wrapped in cloth'], 0],
    ['A pressure test checks for:', ['Leaks and joint integrity', 'Wall color', 'Floor level', 'Wire insulation'], 0],
    ['Drain slope is important because it helps:', ['Waste flow by gravity', 'Increase voltage', 'Stop corrosion completely', 'Heat water'], 0],
    ['If a job is outside your skill scope, you should:', ['Refer to a qualified professional', 'Guess and continue', 'Hide it from the client', 'Skip safety checks'], 0],
  ],
  Electrical: [
    ['Before working on a circuit, first:', ['Turn off and verify power is off', 'Touch the wire', 'Increase load', 'Remove labels'], 0],
    ['A GFCI protects against:', ['Ground faults', 'Pipe corrosion', 'Low airflow', 'Wood splitting'], 0],
    ['A breaker that keeps tripping may indicate:', ['Overload or fault', 'Correct operation only', 'Low paint', 'Loose plumbing trap'], 0],
    ['Which tool checks voltage?', ['Multimeter', 'Pipe wrench', 'Chisel', 'Level'], 0],
    ['Grounding helps:', ['Provide a safe fault path', 'Increase water pressure', 'Cut wood faster', 'Cool refrigerant'], 0],
    ['Wire size is selected based on:', ['Ampacity and load', 'Wall color', 'Room smell', 'Pipe length only'], 0],
    ['Lockout/tagout is used to:', ['Prevent accidental energizing', 'Decorate panels', 'Store tools', 'Label invoices'], 0],
    ['A loose connection can cause:', ['Heat and arcing', 'Better efficiency', 'Cleaner drains', 'Stronger welds'], 0],
    ['The neutral conductor normally carries:', ['Return current', 'Only water', 'No current ever', 'Refrigerant'], 0],
    ['If unsure about code requirements, you should:', ['Check code or ask a qualified supervisor', 'Guess', 'Ignore code', 'Proceed faster'], 0],
  ],
  HVAC: [
    ['Dirty air filters usually cause:', ['Reduced airflow', 'Higher water pressure', 'Better cooling', 'Pipe leaks'], 0],
    ['Low refrigerant can cause:', ['Poor cooling', 'Stronger airflow', 'Higher wood strength', 'More voltage'], 0],
    ['Before opening HVAC electrical panels:', ['Disconnect and verify power', 'Add refrigerant', 'Remove the filter', 'Paint the unit'], 0],
    ['A thermostat controls:', ['System temperature demand', 'Drain slope', 'Weld bead size', 'Pipe thread depth'], 0],
    ['Frozen evaporator coils may be caused by:', ['Low airflow or low refrigerant', 'Too much sawdust', 'Wrong brick bond', 'New tires'], 0],
    ['Superheat/subcooling helps diagnose:', ['Refrigerant charge and system condition', 'Paint thickness', 'Door swing', 'Tile size'], 0],
    ['Condensate drain blockage can cause:', ['Water leakage', 'Higher amperage only', 'Better cooling', 'Cleaner air'], 0],
    ['A blower motor problem affects:', ['Air movement', 'Water supply', 'Masonry strength', 'Fuel injection'], 0],
    ['Duct leaks can reduce:', ['System efficiency', 'Pipe pressure only', 'Weld penetration', 'Circuit resistance'], 0],
    ['When handling refrigerant, you should:', ['Follow environmental and safety rules', 'Vent freely indoors', 'Guess pressure', 'Skip gauges'], 0],
  ],
  Carpentry: [
    ['Measure twice, cut once helps prevent:', ['Material waste and wrong cuts', 'Electrical faults', 'Pipe bursts', 'Low refrigerant'], 0],
    ['A framing square is used to check:', ['Right angles', 'Voltage', 'Airflow', 'Water pressure'], 0],
    ['PPE for cutting wood includes:', ['Eye and hearing protection', 'Only sandals', 'Wet gloves', 'No mask ever'], 0],
    ['Wood grain direction can affect:', ['Strength and finish', 'Voltage flow', 'Drain slope', 'Refrigerant charge'], 0],
    ['A level checks whether work is:', ['Horizontal or vertical', 'Electrified', 'Leaking', 'Overheated'], 0],
    ['Pilot holes help prevent:', ['Wood splitting', 'Water hammer', 'Breaker trips', 'Low airflow'], 0],
    ['Stud spacing is commonly measured:', ['Center to center', 'Only by color', 'By pipe pressure', 'By voltage'], 0],
    ['A dull blade can cause:', ['Rough cuts and kickback risk', 'Better accuracy', 'Higher airflow', 'Lower current'], 0],
    ['Before demolition, check for:', ['Hidden utilities', 'Paint brand only', 'Weather only', 'Client name only'], 0],
    ['Load-bearing walls should be modified only after:', ['Proper structural assessment', 'Guessing', 'Removing studs quickly', 'Skipping permits'], 0],
  ],
  Welding: [
    ['Welding PPE should include:', ['Helmet, gloves, protective clothing', 'Bare hands', 'Wet shoes', 'No eye protection'], 0],
    ['Arc flash can injure:', ['Eyes and skin', 'Only pipes', 'Only concrete', 'Only tires'], 0],
    ['Clean metal before welding to improve:', ['Weld quality', 'Paint color only', 'Water flow', 'Voltage supply'], 0],
    ['Porosity in a weld means:', ['Gas pockets or holes', 'Perfect weld always', 'Wood splitting', 'Low airflow'], 0],
    ['Ground clamp connection affects:', ['Arc stability', 'Drain slope', 'Thermostat setting', 'Brick alignment'], 0],
    ['Ventilation is important because welding can produce:', ['Fumes', 'Clean oxygen only', 'Fresh water', 'Wood dust only'], 0],
    ['Travel speed too fast can cause:', ['Poor penetration', 'Overcooling HVAC', 'Higher water pressure', 'Better weld always'], 0],
    ['Hot work areas should be checked for:', ['Fire hazards', 'Wallpaper color', 'Pipe labels only', 'Wi-Fi speed'], 0],
    ['A tack weld is used to:', ['Hold parts before final welding', 'Finish painting', 'Test voltage', 'Clean drains'], 0],
    ['If a weld is safety critical, it should be:', ['Inspected to required standard', 'Hidden', 'Painted immediately only', 'Ignored'], 0],
  ],
  Masonry: [
    ['Mortar is used to:', ['Bind masonry units', 'Test voltage', 'Cool refrigerant', 'Cut wire'], 0],
    ['A level and plumb line help ensure:', ['Straight and vertical work', 'Higher water pressure', 'Better spark', 'Lower airflow'], 0],
    ['Brick joints should be:', ['Consistent and filled', 'Empty', 'Random only', 'Painted before laying'], 0],
    ['Curing helps masonry gain:', ['Strength', 'Voltage', 'Refrigerant', 'Fuel pressure'], 0],
    ['Before laying blocks, foundation should be:', ['Level and stable', 'Wet paint only', 'Electrified', 'Unmeasured'], 0],
    ['Efflorescence is usually:', ['White salt deposit', 'Electrical arc', 'Pipe crack only', 'Wood knot'], 0],
    ['Expansion joints help manage:', ['Movement and cracking', 'Breaker trips', 'Fuel flow', 'Air filters'], 0],
    ['A trowel is used to:', ['Spread mortar', 'Measure voltage', 'Cut metal pipe', 'Read pressure'], 0],
    ['Poor mortar mix can lead to:', ['Weak joints', 'Better strength always', 'More cooling', 'Higher amperage'], 0],
    ['Masonry work near utilities requires:', ['Locating and protecting services', 'Ignoring markings', 'Fast digging only', 'No planning'], 0],
  ],
  Automotive: [
    ['Before working under a vehicle, use:', ['Jack stands', 'Only a jack', 'Loose bricks', 'No support'], 0],
    ['Low engine oil can cause:', ['Engine damage', 'Better mileage always', 'More tire pressure', 'Cleaner AC'], 0],
    ['A multimeter can test:', ['Battery voltage', 'Brake pad thickness directly', 'Paint gloss', 'Fuel smell only'], 0],
    ['Brake fluid is usually:', ['Hydraulic fluid', 'Engine coolant', 'Washer soap', 'Transmission belt'], 0],
    ['Uneven tire wear may indicate:', ['Alignment or suspension issue', 'Good condition always', 'Full fuel tank', 'Clean filter'], 0],
    ['Disconnecting a battery should be done carefully to avoid:', ['Short circuits', 'More horsepower', 'Cleaner paint', 'Higher oil level'], 0],
    ['An OBD scanner reads:', ['Diagnostic trouble codes', 'Pipe slope', 'Weld size', 'Brick level'], 0],
    ['Coolant prevents:', ['Overheating and freezing', 'Brake squeal only', 'Tire wear only', 'Paint fading only'], 0],
    ['Before test driving after repair, verify:', ['Safety-critical systems', 'Only radio volume', 'Seat color', 'Fuel brand'], 0],
    ['If a repair affects brakes or steering, it should be:', ['Checked carefully before release', 'Ignored', 'Hidden', 'Left untested'], 0],
  ],
};

function getRandomQuestion(trade, difficulty) {
  const questions = QUESTION_BANK[trade] || QUESTION_BANK.Plumbing;
  const index = Math.floor(Math.random() * questions.length);
  const [question, options, answer] = questions[index];
  return {
    _id: `local-${trade}-${index}-${Date.now()}`,
    tradeCategory: trade,
    difficulty,
    questionNumber: index + 1,
    scenario: question,
    options,
    answer,
    score: null,
  };
}

function ScoreBadge({ score }) {
  const color = score >= 80 ? C.green : score >= 60 ? C.accent : C.red;
  return <span style={{ background: color + '22', color, border: `1px solid ${color}`, borderRadius: 20, padding: '2px 12px', fontWeight: 700, fontSize: 13 }}>{score}/100</span>;
}

function DrillCard({ drill, onSelect }) {
  const color = { Beginner: C.green, Intermediate: C.accent, Advanced: C.red }[drill.difficulty] || C.muted;
  return (
    <div onClick={() => onSelect(drill)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '1.1rem', cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ background: '#1a1000', color: C.accent, borderRadius: 20, padding: '2px 10px', fontSize: 11 }}>{drill.tradeCategory}</span>
        <span style={{ color, fontSize: 11, fontWeight: 600 }}>● {drill.difficulty}</span>
      </div>
      <p style={{ fontSize: 13, color: C.text, lineHeight: 1.5, marginBottom: 10 }}>{drill.scenario}</p>
      {drill.score != null && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <ScoreBadge score={drill.score} />
          <span style={{ color: C.muted, fontSize: 11 }}>{drill.submittedAt ? new Date(drill.submittedAt).toLocaleDateString() : ''}</span>
        </div>
      )}
    </div>
  );
}

export default function DrillsPage() {
  const [activeDrill, setActiveDrill] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerState, setAnswerState] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [tab, setTab] = useState('drill');
  const [selectedTrade, setSelectedTrade] = useState('Plumbing');
  const [selectedDiff, setSelectedDiff] = useState('Intermediate');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY) || '[]');
    api.get('/drills/history')
      .then(({ data }) => {
        const backendQuestions = data.filter((drill) => Array.isArray(drill.options));
        setHistory([...saved, ...backendQuestions]);
      })
      .catch(() => setHistory(saved));
  }, []);

  const saveHistory = (nextHistory) => {
    setHistory(nextHistory);
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(nextHistory.slice(0, 50)));
  };

  const generateDrill = () => {
    setGenerating(true);
    setSelectedOption(null);
    setAnswerState(null);
    setActiveDrill(getRandomQuestion(selectedTrade, selectedDiff));
    setTab('drill');
    setGenerating(false);
  };

  const submitAnswer = () => {
    if (selectedOption === null) {
      toast.error('Choose one answer first');
      return;
    }

    if (selectedOption !== activeDrill.answer) {
      setAnswerState('wrong');
      toast.error('Wrong answer. Try again.');
      return;
    }

    const completed = {
      ...activeDrill,
      score: 100,
      submittedAt: new Date().toISOString(),
    };
    const nextHistory = [completed, ...history];
    setAnswerState('correct');
    saveHistory(nextHistory);
    toast.success('Correct answer!');
  };

  const retry = () => {
    setSelectedOption(null);
    setAnswerState(null);
    generateDrill();
  };

  const S = {
    sidebar: { width: 280, flexShrink: 0, borderRight: `1px solid ${C.border}`, padding: '1.25rem', background: C.surface, minHeight: '100vh' },
    main: { flex: 1, padding: '1.5rem', overflowY: 'auto' },
    wrap: { display: 'flex', minHeight: '100vh', background: C.bg, color: C.text },
    btn: (bg, fg = '#0f172a') => ({ padding: '9px 18px', background: bg, color: fg, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }),
    select: { width: '100%', background: '#0f172a', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', color: C.text, fontSize: 13, outline: 'none', marginBottom: 10 },
    tabBtn: (active) => ({ padding: '8px 18px', background: active ? C.accent : 'none', color: active ? '#0f172a' : C.muted, border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: active ? 700 : 400, fontSize: 14 }),
  };

  const avgScore = history.length ? Math.round(history.reduce((acc, d) => acc + (d.score || 0), 0) / history.length) : null;
  const answeredByTopic = history.reduce((acc, drill) => {
    acc[drill.tradeCategory] = (acc[drill.tradeCategory] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={S.wrap}>
      <Toaster position="top-right" />
      <aside style={S.sidebar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <span style={{ fontSize: 20 }}>⚡</span>
          <span style={{ fontWeight: 700, fontSize: 16 }}>AI Drills</span>
        </div>

        <p style={{ color: C.muted, fontSize: 12, marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>Topic</p>
        <select style={S.select} value={selectedTrade} onChange={(e) => setSelectedTrade(e.target.value)}>
          {TRADES.map((t) => <option key={t}>{t}</option>)}
        </select>

        <p style={{ color: C.muted, fontSize: 12, marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>Difficulty</p>
        <select style={S.select} value={selectedDiff} onChange={(e) => setSelectedDiff(e.target.value)}>
          {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
        </select>

        <button style={{ ...S.btn('linear-gradient(135deg, #f59e0b, #d97706)'), width: '100%', marginTop: 8, marginBottom: 20 }} onClick={generateDrill} disabled={generating}>
          {generating ? 'Generating...' : 'Generate Random Question'}
        </button>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
          <p style={{ color: C.muted, fontSize: 12, marginBottom: 12, fontWeight: 600, textTransform: 'uppercase' }}>Performance</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: C.muted, fontSize: 13 }}>Correct Drills</span>
            <span style={{ fontWeight: 700 }}>{history.length}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: C.muted, fontSize: 13 }}>Avg Score</span>
            <span style={{ fontWeight: 700, color: avgScore >= 80 ? C.green : avgScore >= 60 ? C.accent : C.red }}>{avgScore ?? '-'}</span>
          </div>
          <div style={{ marginTop: 14, display: 'grid', gap: 6 }}>
            {TRADES.map((trade) => (
              <div key={trade} style={{ display: 'flex', justifyContent: 'space-between', color: C.muted, fontSize: 12 }}>
                <span>{trade}</span>
                <span>{answeredByTopic[trade] || 0}/10</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main style={S.main}>
        <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', background: C.surface, borderRadius: 10, padding: 4, width: 'fit-content' }}>
          <button style={S.tabBtn(tab === 'drill')} onClick={() => setTab('drill')}>Active Drill</button>
          <button style={S.tabBtn(tab === 'history')} onClick={() => setTab('history')}>History ({history.length})</button>
        </div>

        {tab === 'drill' ? (
          <div>
            {!activeDrill ? (
              <div style={{ textAlign: 'center', marginTop: 80 }}>
                <p style={{ fontSize: 52, marginBottom: 16 }}>⚙️</p>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Ready to practice?</h2>
                <p style={{ color: C.muted, marginBottom: 24 }}>Pick a topic. The drill will ask 1 random question from 10 questions in that topic.</p>
                <button style={S.btn('linear-gradient(135deg, #f59e0b, #d97706)')} onClick={generateDrill} disabled={generating}>
                  Generate First Question
                </button>
              </div>
            ) : !Array.isArray(activeDrill.options) ? (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '1.5rem' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Old Drill Format</h2>
                <p style={{ color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>This saved drill was created before the random-question format. Generate a new random question to practice the current drill flow.</p>
                <button style={S.btn('linear-gradient(135deg, #f59e0b, #d97706)')} onClick={generateDrill}>Generate Random Question</button>
              </div>
            ) : (
              <div>
                <div style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                    <span style={{ background: '#1a1000', color: C.accent, borderRadius: 20, padding: '3px 12px', fontSize: 12 }}>{activeDrill.tradeCategory}</span>
                    <span style={{ background: '#001a0d', color: C.green, borderRadius: 20, padding: '3px 12px', fontSize: 12 }}>{activeDrill.difficulty}</span>
                    <span style={{ background: '#0f172a', color: C.blue, borderRadius: 20, padding: '3px 12px', fontSize: 12 }}>Question {activeDrill.questionNumber}/10</span>
                  </div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 1 }}>Question</h2>
                  <p style={{ fontSize: 18, lineHeight: 1.6, color: C.text, fontWeight: 700 }}>{activeDrill.scenario}</p>
                </div>

                <div style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
                  {activeDrill.options.map((option, index) => {
                    const selected = selectedOption === index;
                    const correct = answerState === 'correct' && index === activeDrill.answer;
                    const wrong = answerState === 'wrong' && selected;
                    return (
                      <button
                        key={option}
                        onClick={() => {
                          setSelectedOption(index);
                          if (answerState === 'wrong') setAnswerState(null);
                        }}
                        disabled={answerState === 'correct'}
                        style={{
                          textAlign: 'left',
                          padding: '13px 14px',
                          borderRadius: 10,
                          border: `1px solid ${correct ? C.green : wrong ? C.red : selected ? C.accent : C.border}`,
                          background: correct ? '#0d1f0d' : wrong ? '#1f0d0d' : selected ? '#1a1000' : C.surface,
                          color: correct ? C.green : wrong ? C.red : selected ? C.accent : C.text,
                          cursor: answerState === 'correct' ? 'default' : 'pointer',
                          fontSize: 14,
                          fontWeight: selected || correct ? 700 : 500,
                        }}
                      >
                        {String.fromCharCode(65 + index)}. {option}
                      </button>
                    );
                  })}
                </div>

                {answerState === 'wrong' && (
                  <div style={{ background: '#1f0d0d', border: `1px solid ${C.red}`, color: C.red, borderRadius: 10, padding: 12, fontWeight: 700, marginBottom: 12 }}>
                    Wrong answer. Try again.
                  </div>
                )}

                {answerState === 'correct' && (
                  <div style={{ background: '#0d1f0d', border: `1px solid ${C.green}`, color: C.green, borderRadius: 10, padding: 12, fontWeight: 700, marginBottom: 12 }}>
                    Correct. This drill is completed.
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button style={S.btn('linear-gradient(135deg, #22c55e, #16a34a)', '#fff')} onClick={submitAnswer} disabled={answerState === 'correct'}>
                    Submit Answer
                  </button>
                  <button style={S.btn(C.blue + '33', C.blue)} onClick={retry}>
                    New Random Question
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '1rem' }}>Drill History</h2>
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: 60 }}>
                <p style={{ fontSize: 36, marginBottom: 12 }}>📊</p>
                <p style={{ color: C.muted }}>No correct drills completed yet. Generate and answer your first question.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {history.map((d, i) => <DrillCard key={d._id || i} drill={d} onSelect={(dr) => { setActiveDrill(dr); setSelectedOption(null); setAnswerState(Array.isArray(dr.options) ? 'correct' : null); setTab('drill'); }} />)}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
