import { Bell, AlertCircle, TrendingUp, Quote } from 'lucide-react';
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
  const [deficiencies, setDeficiencies] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔴 PASTE YOUR CSV LINKS HERE (Same as the ones in other pages)
  const ANNOUNCEMENTS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQODxASqFgFWPJObis_gXQ-mcN31Kfqn1p0rRriC00czwJ_QZadUp1MQscXRGVwB1vZKP0xAvsBJI3J/pub?gid=0&single=true&output=csv';
  const DEFICIENCIES_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQyMaWhymCt9ILdDWzRItpgd44kbvhGQR5SJHJzoVoCeRPX1WLMKTYB04Q6TmyXLR_ZqU2VDdi7EhEj/pub?gid=0&single=true&output=csv';

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchCSV = async (url) => {
          if (!url) return [];
          const res = await fetch(url);
          return parseCSV(await res.text());
        };

        const [annData, defData] = await Promise.all([
          fetchCSV(ANNOUNCEMENTS_CSV_URL),
          fetchCSV(DEFICIENCIES_CSV_URL)
        ]);

        setAnnouncements(annData);
        setDeficiencies(defData);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dash data:", error);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const navigate = useNavigate();

  const stats = [
    { label: 'Active Announcements', value: announcements.length || '0', icon: <Bell size={18} />, trend: 'View Feed', path: '/announcements' },
    { label: 'Total Deficiencies', value: new Set(deficiencies.map(d => d.cadet).filter(Boolean)).size || '0', icon: <AlertCircle size={18} />, trend: 'View Board', path: '/deficiencies' },
    { label: 'Upcoming Classes', value: '4CL-1CL', icon: <TrendingUp size={18} />, trend: 'View Schedule', path: '/schedule' },
  ];

  return (
    <div className="dashboard">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Athletic Council Dashboard</h1>
          <p className="text-muted">Overview • April 2026</p>
        </div>
      </div>

      <div className="grid-cols-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: '2rem', gap: '1.5rem' }}>
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className="glass-card stat-card-interactive" 
            onClick={() => navigate(stat.path)}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, background 0.2s ease'
            }}
          >
            <div className="flex-between" style={{ alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ border: '1px solid var(--surface-border)', padding: '0.4rem', borderRadius: 'var(--radius-sm)', display: 'flex', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
                  {stat.icon}
                </div>
                <span className="text-muted" style={{ fontWeight: 500, fontSize: '0.85rem' }}>{stat.label}</span>
              </div>
              {i === 0 && <span style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }}></div> Active</span>}
            </div>
            
            <h3 style={{ fontSize: '2.5rem', fontWeight: 600, margin: 0, lineHeight: 1 }}>{stat.value}</h3>
            
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{stat.trend}</span>
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>→</span>
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
