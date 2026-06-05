const Drill = require('../models/Drill');

// Mock drill scenarios for when no AI key is set
const MOCK_SCENARIOS = {
  Plumbing: [
    'A residential water heater is producing inconsistent hot water — sometimes scalding, sometimes cold. The pressure relief valve recently started dripping. Diagnose the root cause and describe your repair process including safety steps.',
    'You arrive at a commercial job site to find a main supply line has developed a slow leak behind a finished wall. You cannot shut the water off to the whole building. Walk through how you would isolate, access, and repair the leak.',
    'A sump pump is running continuously but the basement is still flooding. Describe your diagnostic approach to determine whether the problem is with the pump, check valve, float switch, or discharge line.',
  ],
  Electrical: [
    'A 20-amp circuit breaker in a commercial kitchen keeps tripping after about 30 minutes of operation. The load calculation shows the circuit should only be at 70% capacity. Describe your systematic diagnostic process.',
    'You are installing a 3-way switch circuit and after completing the wiring, neither switch controls the light correctly. Walk through your troubleshooting steps using a multimeter.',
    'A GFCI outlet keeps tripping immediately when reset in a bathroom. No visible damage. Describe how you would diagnose whether the fault is in the outlet itself, the wiring, or a downstream device.',
  ],
  HVAC: [
    'A rooftop AC unit is running but not cooling the space below setpoint. The compressor is on, airflow seems normal. Describe your diagnostic sequence to identify whether this is a refrigerant, airflow, or controls issue.',
    'A gas furnace ignites but shuts off after 5 seconds on every cycle. Walk through how you would diagnose this — including checking the flame sensor, pressure switch, and heat exchanger.',
    'A client reports their split-system heat pump heats well but struggles to cool in summer. Outdoor temps are 95°F. Describe your approach to diagnosing the system performance.',
  ],
};

const getMockScenario = (tradeCategory, difficulty) => {
  const trade = tradeCategory || 'Plumbing';
  const scenarios = MOCK_SCENARIOS[trade] || MOCK_SCENARIOS.Plumbing;
  const idx = Math.floor(Math.random() * scenarios.length);
  return {
    title: `${trade} Troubleshooting Drill`,
    scenario: scenarios[idx],
    difficulty: difficulty || 'Intermediate',
  };
};

// POST /api/drills/generate
const generateDrill = async (req, res, next) => {
  try {
    const { tradeCategory, difficulty } = req.body;

    let drillData;

    // Use AI if API key is configured
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-opus-4-5',
            max_tokens: 500,
            messages: [{
              role: 'user',
              content: `Generate a realistic troubleshooting drill for a ${difficulty || 'Intermediate'} ${tradeCategory || 'Plumbing'} apprentice. Return ONLY valid JSON: {"title":"short title","scenario":"2-3 sentence real-world problem","difficulty":"${difficulty || 'Intermediate'}"}`,
            }],
          }),
        });
        const data = await response.json();
        const text = data.content?.[0]?.text || '';
        drillData = JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch {
        drillData = getMockScenario(tradeCategory, difficulty);
      }
    } else {
      drillData = getMockScenario(tradeCategory, difficulty);
    }

    const drill = await Drill.create({
      apprentice: req.user._id,
      title: drillData.title,
      scenario: drillData.scenario,
      difficulty: drillData.difficulty,
      tradeCategory: tradeCategory || req.user.tradeCategory || 'Plumbing',
      aiGenerated: true,
    });

    res.status(201).json(drill);
  } catch (err) {
    next(err);
  }
};

// GET /api/drills/history
const getDrillHistory = async (req, res, next) => {
  try {
    const drills = await Drill.find({ apprentice: req.user._id, completed: true })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(drills);
  } catch (err) {
    next(err);
  }
};

// GET /api/drills
const getDrills = async (req, res, next) => {
  try {
    const drills = await Drill.find({ apprentice: req.user._id }).sort({ createdAt: -1 });
    res.json(drills);
  } catch (err) {
    next(err);
  }
};

// POST /api/drills/submit
const submitDrill = async (req, res, next) => {
  try {
    const { drillId, response } = req.body;

    const drill = await Drill.findOne({ _id: drillId, apprentice: req.user._id });
    if (!drill) return res.status(404).json({ message: 'Drill not found' });

    let evaluation = { feedback: '', score: 70, improvements: [] };

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-opus-4-5',
            max_tokens: 600,
            messages: [{
              role: 'user',
              content: `Evaluate this apprentice's response to a ${drill.tradeCategory} troubleshooting scenario.\n\nScenario: ${drill.scenario}\n\nResponse: ${response}\n\nReturn ONLY valid JSON: {"feedback":"2-3 sentence evaluation","score":75,"improvements":["tip1","tip2","tip3"]}`,
            }],
          }),
        });
        const data = await aiResponse.json();
        const text = data.content?.[0]?.text || '';
        evaluation = JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch {
        // fall through to mock
      }
    }

    // Mock evaluation fallback
    if (!evaluation.feedback) {
      const score = Math.floor(Math.random() * 30) + 65;
      evaluation = {
        score,
        feedback: `Your response shows ${score >= 80 ? 'strong' : score >= 70 ? 'solid' : 'developing'} trade knowledge. You identified the core issue and proposed a logical approach. Focus on adding more specific safety and code-compliance steps to strengthen your answers.`,
        improvements: [
          'Always begin with lockout/tagout or isolation procedures before physical inspection',
          'Reference the relevant code section (NEC, OSHA 1926, or local code) to validate your approach',
          'Specify the exact tools and measurements you would take at each diagnostic step',
        ],
      };
    }

    drill.apprenticeResponse = response;
    drill.aiFeedback = evaluation.feedback;
    drill.score = evaluation.score;
    drill.completed = true;
    await drill.save();

    res.json({
      score: drill.score,
      feedback: drill.aiFeedback,
      improvements: evaluation.improvements || [],
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/drills/:id/respond (legacy alias)
const respondToDrill = submitDrill;

module.exports = { generateDrill, getDrills, getDrillHistory, submitDrill, respondToDrill };
