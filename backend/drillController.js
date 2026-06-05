const Drill = require('../models/Drill');
const FieldLog = require('../models/FieldLog');
const TrainingModule = require('../models/TrainingModule');

const callClaude = async (prompt) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await response.json();
  return data.content?.[0]?.text || '';
};

// POST /api/drills/generate  — AI generates a drill based on apprentice error notes
const generateDrill = async (req, res, next) => {
  try {
    const { tradeCategory } = req.body;

    const recentLogs = await FieldLog.find({ apprentice: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('issues taskDescription toolsUsed');

    const recentModules = await TrainingModule.find({ apprentice: req.user._id, status: 'failed' })
      .limit(3)
      .select('errorNotes tradeCategory title');

    const errorContext = [
      ...recentLogs.map((l) => l.issues).filter(Boolean),
      ...recentModules.map((m) => m.errorNotes).filter(Boolean),
    ].join('\n');

    const prompt = `You are a trade skills training AI for blue-collar apprentices.

Trade category: ${tradeCategory || req.user.tradeCategory || 'general'}
Apprentice's recent error notes and issues:
${errorContext || 'No specific errors logged yet — generate a general beginner scenario.'}

Generate a realistic troubleshooting drill scenario for this apprentice. Return ONLY a JSON object with:
{
  "title": "short drill title",
  "scenario": "2-3 sentence real-world problem scenario the apprentice must solve",
  "difficulty": "beginner|intermediate|advanced"
}`;

    const aiText = await callClaude(prompt);
    let drillData;
    try {
      drillData = JSON.parse(aiText.replace(/```json|```/g, '').trim());
    } catch {
      drillData = { title: 'Field Troubleshooting Drill', scenario: aiText, difficulty: 'intermediate' };
    }

    const drill = await Drill.create({
      apprentice: req.user._id,
      title: drillData.title,
      scenario: drillData.scenario,
      difficulty: drillData.difficulty,
      tradeCategory: tradeCategory || req.user.tradeCategory,
      aiGenerated: true,
    });

    res.status(201).json(drill);
  } catch (err) {
    next(err);
  }
};

// GET /api/drills  — get all drills for apprentice
const getDrills = async (req, res, next) => {
  try {
    const drills = await Drill.find({ apprentice: req.user._id }).sort({ createdAt: -1 });
    res.json(drills);
  } catch (err) {
    next(err);
  }
};

// POST /api/drills/:id/respond  — apprentice submits answer, AI gives feedback
const respondToDrill = async (req, res, next) => {
  try {
    const drill = await Drill.findOne({ _id: req.params.id, apprentice: req.user._id });
    if (!drill) return res.status(404).json({ message: 'Drill not found' });

    const { response } = req.body;

    const prompt = `You are evaluating an apprentice's response to a trade skills troubleshooting scenario.

Scenario: ${drill.scenario}
Apprentice's response: ${response}
Trade: ${drill.tradeCategory}

Give brief, constructive feedback (2-3 sentences) and a score out of 100. Return ONLY JSON:
{"feedback": "...", "score": 75}`;

    const aiText = await callClaude(prompt);
    let evaluation;
    try {
      evaluation = JSON.parse(aiText.replace(/```json|```/g, '').trim());
    } catch {
      evaluation = { feedback: aiText, score: 70 };
    }

    drill.apprenticeResponse = response;
    drill.aiFeedback = evaluation.feedback;
    drill.score = evaluation.score;
    drill.completed = true;
    await drill.save();

    res.json(drill);
  } catch (err) {
    next(err);
  }
};

// POST /api/drills/inject-anomaly  — inject a field anomaly into a module
const injectAnomaly = async (req, res, next) => {
  try {
    const { moduleId } = req.body;

    const mod = await TrainingModule.findById(moduleId);
    if (!mod) return res.status(404).json({ message: 'Module not found' });

    const prompt = `Generate a realistic unexpected field anomaly for a ${mod.tradeCategory} apprentice working on: "${mod.title}".
The anomaly should be a 1-2 sentence scenario that tests their adaptability.
Examples: equipment failure, missing part, safety hazard, unexpected code violation.
Return ONLY the anomaly description as plain text.`;

    const anomaly = await callClaude(prompt);
    mod.anomalyInjected = true;
    mod.anomalyDescription = anomaly.trim();
    await mod.save();

    res.json({ module: mod, anomaly: mod.anomalyDescription });
  } catch (err) {
    next(err);
  }
};

// POST /api/drills/chat  — mentor chatbot
const mentorChat = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    const messages = [
      ...(history || []).slice(-6),
      { role: 'user', content: message },
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        system: `You are a seasoned trade mentor AI helping blue-collar apprentices troubleshoot machinery, tools, and field problems. You speak plainly and practically. The apprentice may be on a job site using voice input so keep answers short and actionable. Trade context: ${req.user.tradeCategory}.`,
        messages,
      }),
    });

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Sorry, I could not process that.';
    res.json({ reply });
  } catch (err) {
    next(err);
  }
};

module.exports = { generateDrill, getDrills, respondToDrill, injectAnomaly, mentorChat };