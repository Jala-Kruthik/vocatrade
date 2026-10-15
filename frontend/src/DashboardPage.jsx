import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Flame,
  GraduationCap,
  Hammer,
  LogOut,
  PlayCircle,
  ShieldCheck,
  Target,
  TrendingUp,
  Wrench,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth, api } from './AuthContext';

const C = {
  bg: '#0b1220',
  surface: '#121c2e',
  panel: '#172236',
  panelSoft: '#1e2d45',
  border: '#31415e',
  text: '#f8fafc',
  muted: '#9aa8bd',
  amber: '#f59e0b',
  green: '#22c55e',
  blue: '#38bdf8',
  red: '#ef4444',
  violet: '#a78bfa',
  cyan: '#06b6d4',
};

const MOCK = {
  stats: { trainingHours: 142, activeProjects: 9, completedModules: 18, certifications: 2 },
  mastery: [
    { name: 'Safety', value: 88 },
    { name: 'Diagnostics', value: 74 },
    { name: 'Tools', value: 82 },
    { name: 'Codes', value: 59 },
    { name: 'Job Planning', value: 69 },
  ],
  weeklyHours: [
    { day: 'Mon', hours: 4.5 },
    { day: 'Tue', hours: 6 },
    { day: 'Wed', hours: 5 },
    { day: 'Thu', hours: 7 },
    { day: 'Fri', hours: 4 },
    { day: 'Sat', hours: 3.5 },
    { day: 'Sun', hours: 1 },
  ],
  planBlocks: [
    { time: '08:00', title: 'Safety warm-up', type: 'Checklist', status: 'Done' },
    { time: '10:30', title: 'Pipe pressure diagnostic simulation', type: 'AI Drill', status: 'Ready' },
    { time: '14:00', title: 'Blueprint reading module', type: 'Study', status: 'In Progress' },
    { time: '17:30', title: 'Field log reflection', type: 'Review', status: 'Queued' },
  ],
  roadmap: [
    { title: 'Foundation', detail: 'PPE, hand tools, site communication', progress: 100 },
    { title: 'Assisted Practice', detail: 'Guided diagnostics and repair sequencing', progress: 72 },
    { title: 'Scenario Mastery', detail: 'Timed simulations with AI scoring', progress: 48 },
    { title: 'Certification Ready', detail: 'Portfolio review and client readiness', progress: 24 },
  ],
  simulations: [
    { title: 'Intermittent breaker trip', trade: 'Electrical', difficulty: 'Intermediate', risk: 'High' },
    { title: 'Low suction pressure diagnosis', trade: 'HVAC', difficulty: 'Advanced', risk: 'Medium' },
    { title: 'Leaking compression fitting', trade: 'Plumbing', difficulty: 'Beginner', risk: 'Low' },
  ],
  recommendations: [
    'Run one code-reference drill before attempting the next certification quiz.',
    'Add tool names and measurement values to every field log this week.',
    'Spend 30 minutes on blueprint symbols; it is your largest mastery gap.',
  ],
  activity: [
    { title: 'Completed drill', detail: 'Pressure test scenario scored 84/100', icon: CheckCircle2 },
    { title: 'Module advanced', detail: 'Blueprint reading moved to 62%', icon: BookOpen },
    { title: 'Field log added', detail: 'Documented HVAC inspection workflow', icon: ClipboardList },
  ],
};

function IconButton({ children, onClick, active = false, title }) {
  return (
    <button
      aria-label={title}
      title={title}
      onClick={onClick}
      style={{
        height: 38,
        width: 38,
        display: 'grid',
        placeItems: 'center',
        borderRadius: 8,
        border: `1px solid ${active ? C.amber : C.border}`,
        background: active ? C.amber : C.panel,
        color: active ? '#111827' : C.text,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function Stat({ icon: Icon, label, value, tone }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ color: C.muted, fontSize: 13 }}>{label}</span>
        <Icon size={20} color={tone} />
      </div>
      <div style={{ color: C.text, fontSize: 28, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function Progress({ value, color = C.amber }) {
  return (
    <div style={{ height: 8, background: '#0b1220', borderRadius: 999, overflow: 'hidden', border: `1px solid ${C.border}` }}>
      <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, value))}%`, background: color, borderRadius: 999 }} />
    </div>
  );
}

function Section({ title, icon: Icon, action, children }) {
  return (
    <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon size={19} color={C.amber} />
          <h2 style={{ fontSize: 16, margin: 0 }}>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Pill({ children, color = C.blue }) {
  return (
    <span style={{ color, background: `${color}20`, border: `1px solid ${color}55`, borderRadius: 999, padding: '3px 9px', fontSize: 12, fontWeight: 700 }}>
      {children}
    </span>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(MOCK);
  const [requests, setRequests] = useState([]);
  const focusTrade = user?.tradeCategory || 'Plumbing';

  useEffect(() => {
    api.get('/dashboard').then((res) => setData({ ...MOCK, ...res.data })).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.isCertified) return;
    api.get('/requests/mine').then(({ data: reqs }) => setRequests(reqs)).catch(() => {});
  }, [user?.isCertified]);

  const handleRequestAction = async (id, status) => {
    try {
      await api.put(`/requests/${id}`, { status });
      setRequests((prev) => prev.map((request) => (
        request._id === id ? { ...request, status } : request
      )));
    } catch {
      setRequests((prev) => prev.map((request) => (
        request._id === id ? { ...request, status } : request
      )));
    }
  };

  const masteryAverage = useMemo(() => {
    const total = data.mastery.reduce((sum, item) => sum + item.value, 0);
    return Math.round(total / data.mastery.length);
  }, [data.mastery]);

  const nextSimulation = data.simulations[0];
  const pendingRequests = requests.filter((request) => request.status === 'pending');
  const pieData = [
    { name: 'Completed', value: data.stats.completedModules, color: C.green },
    { name: 'In Progress', value: 7, color: C.amber },
    { name: 'Planned', value: 5, color: C.blue },
  ];

  const nav = [
    ['Dashboard', '/dashboard', BarChart3],
    ['Courses', '/courses', GraduationCap],
    ['Modules', '/modules', BookOpen],
    ['Logs', '/logs', ClipboardList],
    ['Drills', '/drills', PlayCircle],
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
      <header style={{ height: 64, background: C.surface, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: C.amber, display: 'grid', placeItems: 'center', color: '#111827' }}>
            <Hammer size={22} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Emergent Mastery Planner</div>
            <div style={{ color: C.muted, fontSize: 12 }}>AI trade-skill simulation workspace</div>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {nav.map(([label, path, Icon]) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 10px',
                color: path === '/dashboard' ? '#111827' : C.muted,
                background: path === '/dashboard' ? C.amber : 'transparent',
                border: `1px solid ${path === '/dashboard' ? C.amber : 'transparent'}`,
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
          <IconButton title="Log out" onClick={logout}><LogOut size={18} /></IconButton>
        </nav>
      </header>

      <main style={{ maxWidth: 1360, margin: '0 auto', padding: 22 }}>
        <section style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: 20, marginBottom: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <Pill color={C.green}>{user?.isCertified ? 'Certified provider' : 'Certification path active'}</Pill>
                <Pill color={C.blue}>{focusTrade} focus</Pill>
                <Pill color={C.violet}>{masteryAverage}% mastery average</Pill>
              </div>
              <h1 style={{ fontSize: 34, lineHeight: 1.1, margin: '0 0 10px', letterSpacing: 0 }}>
                Plan, simulate, and prove real trade mastery.
              </h1>
              <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.6, maxWidth: 760, margin: 0 }}>
                Welcome back, {user?.name || 'service provider'}. Your planner turns modules, drills, field logs, and certification goals into a practical weekly training path.
              </p>
            </div>

            <div style={{ background: '#0b1220', border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ color: C.muted, fontSize: 12, textTransform: 'uppercase', fontWeight: 800 }}>Next simulation</div>
                  <div style={{ fontWeight: 800, marginTop: 5 }}>{nextSimulation.title}</div>
                </div>
                <ShieldCheck color={C.green} size={26} />
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                <Pill color={C.cyan}>{nextSimulation.trade}</Pill>
                <Pill color={C.amber}>{nextSimulation.difficulty}</Pill>
                <Pill color={nextSimulation.risk === 'High' ? C.red : C.green}>{nextSimulation.risk} risk</Pill>
              </div>
              <button onClick={() => navigate('/drills')} style={{ width: '100%', height: 42, borderRadius: 8, border: 'none', background: C.amber, color: '#111827', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <PlayCircle size={18} />
                Start AI Simulation
              </button>
            </div>
          </div>
        </section>

        <section style={{ background: C.surface, border: `1px solid ${user?.isCertified ? C.green : C.amber}`, borderRadius: 8, padding: 18, marginBottom: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 8, background: C.panelSoft, display: 'grid', placeItems: 'center', fontSize: 20, fontWeight: 800, color: C.amber }}>
                {(user?.name || 'S')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ color: C.muted, fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>Service Provider Name</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{user?.name || 'Service Provider'}</div>
              </div>
            </div>

            <div>
              <div style={{ color: C.muted, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', marginBottom: 5 }}>Course To Complete</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <BookOpen size={17} color={C.blue} />
                <span style={{ fontWeight: 800 }}>VocaTrade Service Provider Certification</span>
                <Pill color={C.blue}>8 videos + test</Pill>
              </div>
            </div>

            <div>
              <div style={{ color: C.muted, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', marginBottom: 5 }}>Client Requests</div>
              {user?.isCertified ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.green, fontWeight: 800 }}>
                  <ShieldCheck size={18} />
                  {requests.length} total, {pendingRequests.length} waiting
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.amber, fontWeight: 800 }}>
                  <AlertTriangle size={18} />
                  Locked until you pass the course test
                </div>
              )}
            </div>

            <button onClick={() => navigate('/courses')} style={{ height: 42, borderRadius: 8, border: 'none', background: user?.isCertified ? C.green : C.amber, color: '#111827', fontWeight: 800, cursor: 'pointer' }}>
              {user?.isCertified ? 'View Certificate' : 'Complete Course'}
            </button>
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 18 }}>
          <Stat icon={Clock} label="Training Hours" value={data.stats.trainingHours} tone={C.blue} />
          <Stat icon={BookOpen} label="Modules Done" value={data.stats.completedModules} tone={C.green} />
          <Stat icon={Brain} label="AI Drills" value={data.stats.activeProjects} tone={C.amber} />
          <Stat icon={Award} label="Credentials" value={data.stats.certifications} tone={C.violet} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18, marginBottom: 18 }}>
          <Section title="Weekly Simulation Plan" icon={CalendarDays} action={<Pill color={C.blue}>This week</Pill>}>
            <div style={{ height: 210 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.weeklyHours}>
                  <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: C.panel, border: `1px solid ${C.border}`, color: C.text }} />
                  <Area type="monotone" dataKey="hours" stroke={C.amber} fill={C.amber} fillOpacity={0.22} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Competency Mix" icon={Target} action={<Pill color={C.green}>Balanced path</Pill>}>
            <div style={{ height: 210 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={52} outerRadius={82} paddingAngle={3}>
                    {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: C.panel, border: `1px solid ${C.border}`, color: C.text }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              {pieData.map((item) => <Pill key={item.name} color={item.color}>{item.name}: {item.value}</Pill>)}
            </div>
          </Section>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
          <Section title="Today" icon={Activity} action={<button onClick={() => navigate('/logs')} style={{ color: C.amber, background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 800 }}>Open logs</button>}>
            <div style={{ display: 'grid', gap: 10 }}>
              {data.planBlocks.map((item) => (
                <div key={`${item.time}-${item.title}`} style={{ display: 'grid', gridTemplateColumns: '54px 1fr auto', alignItems: 'center', gap: 10, padding: 10, border: `1px solid ${C.border}`, borderRadius: 8, background: C.panel }}>
                  <span style={{ color: C.muted, fontSize: 12, fontWeight: 800 }}>{item.time}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{item.title}</div>
                    <div style={{ color: C.muted, fontSize: 12 }}>{item.type}</div>
                  </div>
                  <Pill color={item.status === 'Done' ? C.green : item.status === 'Ready' ? C.amber : C.blue}>{item.status}</Pill>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Mastery Roadmap" icon={TrendingUp} action={<button onClick={() => navigate('/modules')} style={{ color: C.amber, background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 800 }}>Manage modules</button>}>
            <div style={{ display: 'grid', gap: 13 }}>
              {data.roadmap.map((step, index) => (
                <div key={step.title}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 7 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>{index + 1}. {step.title}</div>
                      <div style={{ color: C.muted, fontSize: 12 }}>{step.detail}</div>
                    </div>
                    <span style={{ fontWeight: 800, color: step.progress === 100 ? C.green : C.text }}>{step.progress}%</span>
                  </div>
                  <Progress value={step.progress} color={step.progress === 100 ? C.green : C.amber} />
                </div>
              ))}
            </div>
          </Section>

          <Section title="AI Recommendations" icon={Brain} action={<Pill color={C.violet}>Adaptive</Pill>}>
            <div style={{ display: 'grid', gap: 10 }}>
              {data.recommendations.map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: C.muted, lineHeight: 1.45, fontSize: 13 }}>
                  <AlertTriangle size={17} color={C.amber} style={{ marginTop: 2, flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
            <div style={{ height: 150, marginTop: 18 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.mastery}>
                  <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: C.panel, border: `1px solid ${C.border}`, color: C.text }} />
                  <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                    {data.mastery.map((item) => <Cell key={item.name} fill={item.value < 65 ? C.red : item.value < 78 ? C.amber : C.green} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18, marginTop: 18 }}>
          <Section title="Simulation Queue" icon={Wrench} action={<button onClick={() => navigate('/drills')} style={{ color: C.amber, background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 800 }}>Practice</button>}>
            <div style={{ display: 'grid', gap: 10 }}>
              {data.simulations.map((sim) => (
                <button key={sim.title} onClick={() => navigate('/drills')} style={{ textAlign: 'left', background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, color: C.text, cursor: 'pointer', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 10 }}>
                  <span>
                    <span style={{ display: 'block', fontWeight: 800, marginBottom: 5 }}>{sim.title}</span>
                    <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Pill color={C.cyan}>{sim.trade}</Pill>
                      <Pill color={C.amber}>{sim.difficulty}</Pill>
                    </span>
                  </span>
                  <ChevronRight size={20} color={C.muted} />
                </button>
              ))}
            </div>
          </Section>

          <Section title="Client Requests" icon={ClipboardList} action={<Pill color={pendingRequests.length ? C.amber : C.green}>{pendingRequests.length} pending</Pill>}>
            {!user?.isCertified ? (
              <div style={{ background: C.panel, border: `1px solid ${C.amber}`, borderRadius: 8, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: C.amber, fontWeight: 800, marginBottom: 6 }}>
                  <AlertTriangle size={18} />
                  Requests are locked
                </div>
                <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.5, margin: '0 0 12px' }}>
                  Complete the 8 video course and pass the test before clients can request your service.
                </p>
                <button onClick={() => navigate('/courses')} style={{ height: 38, padding: '0 14px', borderRadius: 8, border: 'none', background: C.amber, color: '#111827', fontWeight: 800, cursor: 'pointer' }}>
                  Complete Course
                </button>
              </div>
            ) : requests.length === 0 ? (
              <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, textAlign: 'center' }}>
                <div style={{ fontWeight: 800, marginBottom: 5 }}>No client requests yet</div>
                <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.5, margin: 0 }}>
                  Once clients request your certified service, their details and approval buttons will appear here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {requests.map((request) => {
                  const client = request.client || {};
                  const isPending = request.status === 'pending';
                  const statusColor = request.status === 'accepted' ? C.green : request.status === 'declined' ? C.red : C.amber;
                  return (
                    <div key={request._id} style={{ background: C.panel, border: `1px solid ${isPending ? C.amber : C.border}`, borderRadius: 8, padding: 13 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 14 }}>{client.name || 'Client'}</div>
                          <div style={{ color: C.muted, fontSize: 12, display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                            {client.tradeCategory && <span>{client.tradeCategory}</span>}
                            {client.location && <span>{client.location}</span>}
                            {request.createdAt && <span>{new Date(request.createdAt).toLocaleDateString()}</span>}
                          </div>
                        </div>
                        <Pill color={statusColor}>{request.status || 'pending'}</Pill>
                      </div>

                      {(client.email || client.phone) && (
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                          {client.email && <a href={`mailto:${client.email}`} style={{ color: C.blue, fontSize: 12, textDecoration: 'none' }}>{client.email}</a>}
                          {client.phone && <a href={`tel:${client.phone}`} style={{ color: C.green, fontSize: 12, textDecoration: 'none' }}>{client.phone}</a>}
                        </div>
                      )}

                      <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.5, margin: isPending ? '0 0 10px' : 0 }}>
                        {request.message || 'Client requested your service.'}
                      </p>

                      {isPending && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button onClick={() => handleRequestAction(request._id, 'accepted')} style={{ height: 34, padding: '0 13px', borderRadius: 8, border: 'none', background: C.green, color: '#052e16', fontWeight: 800, cursor: 'pointer' }}>
                            Accept
                          </button>
                          <button onClick={() => handleRequestAction(request._id, 'declined')} style={{ height: 34, padding: '0 13px', borderRadius: 8, border: `1px solid ${C.red}`, background: `${C.red}20`, color: C.red, fontWeight: 800, cursor: 'pointer' }}>
                            Decline
                          </button>
                        </div>
                      )}
                      {request.status === 'accepted' && (
                        <button onClick={() => handleRequestAction(request._id, 'completed')} style={{ height: 34, padding: '0 13px', borderRadius: 8, border: 'none', background: C.blue, color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: 12 }}>
                          🔧 Mark as Completed
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          <Section title="Recent Activity" icon={Flame} action={<Pill color={requests.length ? C.green : C.muted}>{requests.length} client requests</Pill>}>
            <div style={{ display: 'grid', gap: 12 }}>
              {data.activity.map(({ title, detail, icon: Icon }) => (
                <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'center', paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: C.panelSoft, display: 'grid', placeItems: 'center' }}>
                    <Icon size={18} color={C.amber} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{title}</div>
                    <div style={{ color: C.muted, fontSize: 12 }}>{detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </main>
    </div>
  );
}
