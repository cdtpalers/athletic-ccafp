import { Bell, AlertCircle, TrendingUp, Quote, Home, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ACADEMIC_QUOTES = [
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
  { text: "Excellence is not a gift, but a skill that takes practice. We are what we repeatedly do.", author: "Aristotle" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "Education is not the filling of a pail, but the lighting of a fire.", author: "W.B. Yeats" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" }
];

// A lightweight CSV parser to handle quotes and commas properly
function parseCSV(csv) {
  const lines = [];
  let currentLine = [];
  let currentVal = '';
  let insideQuotes = false;
  
  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const nextChar = csv[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      currentVal += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      currentLine.push(currentVal);
      currentVal = '';
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') ++i;
      currentLine.push(currentVal);
      lines.push(currentLine);
      currentLine = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (currentVal || currentLine.length > 0) {
    currentLine.push(currentVal);
    lines.push(currentLine);
  }
  
  const headers = lines[0].map(h => h.trim());
  return lines.slice(1).filter(line => line.join('').trim() !== '').map(line => {
    return headers.reduce((obj, header, i) => {
      obj[header] = line[i] ? line[i].trim() : '';
      return obj;
    }, {});
  });
}

export default function Dashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [pftData, setPftData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔴 PASTE YOUR CSV LINKS HERE (Same as the ones in other pages)
  const ANNOUNCEMENTS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQODxASqFgFWPJObis_gXQ-mcN31Kfqn1p0rRriC00czwJ_QZadUp1MQscXRGVwB1vZKP0xAvsBJI3J/pub?gid=0&single=true&output=csv';

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchCSV = async (url) => {
          if (!url) return [];
          const res = await fetch(url);
          return parseCSV(await res.text());
        };

        const [annData, pftRaw] = await Promise.all([
          fetchCSV(ANNOUNCEMENTS_CSV_URL),
          fetchCSV('/pft_results.csv')
        ]);

        setAnnouncements(annData);
        setPftData(pftRaw);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dash data:", error);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const navigate = useNavigate();

  const testedCadets = pftData.filter(d => d.pft_total && d.pft_total !== '');
  const avgPft = testedCadets.length > 0
    ? (testedCadets.reduce((s, d) => s + parseFloat(d.pft_total), 0) / testedCadets.length).toFixed(2)
    : '—';

  const stats = [
    { label: 'Active Announcements', value: announcements.length || '0', icon: <Bell size={16} />, trend: 'View Feed', path: '/announcements' },
    { label: 'Avg PFT Score', value: avgPft, icon: <Activity size={16} />, trend: testedCadets.length + ' cadets tested', path: '/deficiencies' },
    { label: 'Upcoming Classes', value: '12', icon: <TrendingUp size={16} />, trend: 'Steady', path: '/schedule' },
    { label: 'Council Activity', value: '89%', icon: <Bell size={16} />, trend: '+2% This week', path: '/' },
  ];

  return (
    <div className="dashboard" style={{ marginTop: '1rem' }}>
      <div className="flex-between" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--accent-primary)', color: '#1a1a1a', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Home size={24} />
          </div>
          <h1 style={{ margin: 0, fontSize: '2.2rem' }}>Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={{ 
            background: 'var(--surface-glass)', 
            border: '1px solid var(--surface-border)', 
            color: 'var(--text-primary)', 
            padding: '0.6rem 1.25rem', 
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 500,
            cursor: 'pointer'
          }}>★ All Product</button>
          <button className="btn btn-primary">Current Report ▼</button>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2.5rem' 
      }}>
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className="glass-card stat-card-interactive" 
            onClick={() => navigate(stat.path)}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              padding: '1.5rem',
              cursor: 'pointer',
              background: i === 0 ? 'var(--accent-primary)' : 'var(--surface-glass)',
              color: i === 0 ? '#1a1a1a' : 'var(--text-primary)',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '24px'
            }}
          >
            {/* Subtle Gradient Glow for First Card */}
            {i === 0 && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at top left, rgba(255,255,255,0.4) 0%, transparent 60%)', pointerEvents: 'none' }} />
            )}
            
            <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
              <div style={{ 
                background: i === 0 ? 'rgba(0,0,0,0.15)' : 'var(--accent-primary)', 
                color: '#1a1a1a',
                padding: '0.5rem', 
                borderRadius: '50%', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {stat.icon}
              </div>
              <span style={{ 
                fontWeight: 500, 
                fontSize: '0.9rem',
                color: i === 0 ? '#1a1a1a' : 'var(--text-primary)'
              }}>{stat.label}</span>
            </div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ 
                fontSize: '2.2rem', 
                fontWeight: 700, 
                margin: 0, 
                lineHeight: 1,
                color: i === 0 ? '#1a1a1a' : 'var(--text-primary)'
              }}>{stat.value}</h3>
              
              <div style={{ 
                marginTop: '0.75rem', 
                fontSize: '0.75rem', 
                fontWeight: 600,
                color: i === 0 ? 'rgba(0,0,0,0.6)' : 'var(--accent-primary)', 
                display: 'flex', 
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                <TrendingUp size={12} /> {stat.trend}
              </div>
            </div>
            
            {/* Mock Chart Bars */}
            <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', display: 'flex', alignItems: 'flex-end', gap: '4px', height: '40px', opacity: i === 0 ? 0.6 : 0.8 }}>
              {[0.4, 0.7, 0.5, 0.9, 0.6].map((h, j) => (
                <div key={j} style={{ width: '8px', height: (h * 100) + '%', background: i === 0 ? '#1a1a1a' : 'var(--accent-primary)', borderRadius: '4px' }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {(() => {
        const todayIdx = new Date().getDate() % ACADEMIC_QUOTES.length;
        const dailyQuote = ACADEMIC_QUOTES[todayIdx];
        return (
          <div className="glass-panel modal-inner" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-15px', right: '-15px', opacity: 0.05, transform: 'rotate(-20deg)' }}>
              <Quote size={120} weight="fill" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', flexShrink: 0 }}>
              <Quote className="text-accent-primary" size={24} />
            </div>
            <div>
              <p style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 500, fontStyle: 'italic', marginBottom: '0.5rem', lineHeight: 1.6 }}>
                "{dailyQuote.text}"
              </p>
              <p className="text-muted" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                — {dailyQuote.author}
              </p>
            </div>
          </div>
        );
      })()}

      <div className="grid-cols-2">
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Recent Announcements</h3>
          <div className="announcement-list">
            {loading ? (
              <p className="text-muted" style={{ padding: '1rem' }}>Loading from Sheets...</p>
            ) : announcements.length === 0 ? (
              <p className="text-muted" style={{ padding: '1rem' }}>No recent announcements.</p>
            ) : (
              announcements.slice(0, 3).map((ann, i) => (
                <div key={i} style={{ padding: '1rem', borderBottom: i !== Math.min(announcements.length, 3) - 1 ? '1px solid var(--surface-border)' : 'none' }}>
                  <span className={`badge badge-${ann.type?.toLowerCase() || 'info'}`} style={{ marginBottom: '0.5rem' }}>
                    {ann.type?.toUpperCase() || 'INFO'}
                  </span>
                  <h4>{ann.title}</h4>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {ann.content ? ann.content.substring(0, 60) + '...' : ''}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
