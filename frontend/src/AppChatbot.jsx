import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bot, BookOpen, ClipboardList, GraduationCap, MessageCircle, PlayCircle, Send, Users, X } from 'lucide-react';
import { useAuth } from './AuthContext';

const C = {
  bg: '#0f172a',
  surface: '#1e293b',
  panel: '#162032',
  border: '#334155',
  text: '#f1f5f9',
  muted: '#94a3b8',
  accent: '#f59e0b',
  green: '#22c55e',
  blue: '#38bdf8',
  red: '#ef4444',
};

const STARTER = {
  id: 'welcome',
  from: 'bot',
  text: 'Hi, I can help you use this application. Ask about courses, certification, client requests, drills, modules, logs, or where to go next.',
};

function getReply(message, user) {
  const q = message.toLowerCase();
  const certified = Boolean(user?.isCertified);

  if (q.includes('course') || q.includes('certification') || q.includes('certified') || q.includes('test') || q.includes('video')) {
    return certified
      ? 'You are certified. You can open Courses to view your certificate. Clients can now find and request you from the client portal.'
      : 'To become requestable by clients, open Courses, complete all 8 videos, then pass the final test. After passing, your provider profile becomes certified.';
  }

  if (q.includes('client') || q.includes('request') || q.includes('approve') || q.includes('accept') || q.includes('decline')) {
    return certified
      ? 'Client requests appear on your service provider dashboard. Each request shows the client message and contact details. Use Accept or Decline to approve or reject it.'
      : 'Client requests are locked until you complete the 8-video course and pass the test. After certification, requests will appear on your dashboard.';
  }

  if (q.includes('drill') || q.includes('question') || q.includes('practice') || q.includes('wrong')) {
    return 'Open Drills, choose a topic and difficulty, then generate a random question. Each topic has 10 questions. If you answer wrong, the app tells you to try again and keeps the same drill active.';
  }

  if (q.includes('module') || q.includes('lesson') || q.includes('training')) {
    return 'Modules help you organize training tasks. You can create modules, set trade category, difficulty, duration, deadline, and mark status as Not Started, In Progress, or Completed.';
  }

  if (q.includes('log') || q.includes('field') || q.includes('work')) {
    return 'Logs are for field practice notes. Use them to record what you worked on, tools used, site issues, and what you learned.';
  }

  if (q.includes('login') || q.includes('register') || q.includes('account')) {
    return 'Use Register to create either a Service Provider or Client account. Providers complete certification; clients browse certified providers and send requests.';
  }

  if (q.includes('dashboard') || q.includes('home') || q.includes('next')) {
    return 'The dashboard is the main service provider workspace. It shows your name, course status, client request count, AI planner, simulations, roadmap, and recent activity.';
  }

  return 'I can help with: completing the course, unlocking client requests, approving requests, using drills, creating modules, and adding field logs. Try asking “how do I get certified?” or “how do I accept client requests?”';
}

function QuickButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '7px 9px',
        borderRadius: 8,
        border: `1px solid ${C.border}`,
        background: C.panel,
        color: C.text,
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

export default function AppChatbot() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([STARTER]);

  const hidden = !isAuthenticated || ['/login', '/register'].includes(location.pathname);

  const suggestions = useMemo(() => [
    { label: 'Certification', icon: GraduationCap, text: 'How do I get certified?', path: '/courses' },
    { label: 'Client requests', icon: Users, text: 'How do I approve client requests?', path: '/dashboard' },
    { label: 'Drills', icon: PlayCircle, text: 'How do active drills work?', path: '/drills' },
    { label: 'Modules', icon: BookOpen, text: 'How do I use modules?', path: '/modules' },
    { label: 'Logs', icon: ClipboardList, text: 'What are field logs?', path: '/logs' },
  ], []);

  if (hidden) return null;

  const sendMessage = (text = input, path = null) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-user`, from: 'user', text: trimmed },
      { id: `${Date.now()}-bot`, from: 'bot', text: getReply(trimmed, user) },
    ]);
    setInput('');
    if (path) navigate(path);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open help chatbot"
          title="Open help chatbot"
          style={{
            position: 'fixed',
            right: 22,
            bottom: 22,
            width: 56,
            height: 56,
            borderRadius: 8,
            border: `1px solid ${C.accent}`,
            background: C.accent,
            color: '#111827',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            zIndex: 500,
            boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
          }}
        >
          <MessageCircle size={26} />
        </button>
      )}

      {open && (
        <section
          style={{
            position: 'fixed',
            right: 22,
            bottom: 22,
            width: 'min(380px, calc(100vw - 28px))',
            height: 'min(560px, calc(100vh - 28px))',
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            zIndex: 500,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 24px 70px rgba(0,0,0,0.45)',
          }}
        >
          <header style={{ padding: 14, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: C.accent, color: '#111827', display: 'grid', placeItems: 'center' }}>
                <Bot size={20} />
              </div>
              <div>
                <div style={{ color: C.text, fontWeight: 800, fontSize: 14 }}>App Help Chatbot</div>
                <div style={{ color: C.muted, fontSize: 11 }}>Guides courses, drills, and requests</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chatbot" title="Close chatbot" style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${C.border}`, background: C.panel, color: C.muted, cursor: 'pointer' }}>
              <X size={17} />
            </button>
          </header>

          <div style={{ padding: 12, display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: `1px solid ${C.border}` }}>
            {suggestions.map((item) => (
              <QuickButton key={item.label} icon={item.icon} label={item.label} onClick={() => sendMessage(item.text, item.path)} />
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((message) => {
              const fromUser = message.from === 'user';
              return (
                <div key={message.id} style={{ display: 'flex', justifyContent: fromUser ? 'flex-end' : 'flex-start' }}>
                  <div
                    style={{
                      maxWidth: '82%',
                      background: fromUser ? C.accent : C.panel,
                      color: fromUser ? '#111827' : C.text,
                      border: `1px solid ${fromUser ? C.accent : C.border}`,
                      borderRadius: 8,
                      padding: '9px 11px',
                      fontSize: 13,
                      lineHeight: 1.5,
                    }}
                  >
                    {message.text}
                  </div>
                </div>
              );
            })}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
            style={{ padding: 12, borderTop: `1px solid ${C.border}`, display: 'flex', gap: 8 }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask for help..."
              style={{ flex: 1, background: '#0f172a', border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 11px', color: C.text, outline: 'none', fontSize: 13 }}
            />
            <button type="submit" aria-label="Send message" title="Send message" style={{ width: 42, borderRadius: 8, border: 'none', background: C.green, color: '#052e16', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              <Send size={18} />
            </button>
          </form>
        </section>
      )}
    </>
  );
}
