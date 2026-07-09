import { Home, Activity, TrendingUp, Bell, ArrowUpFromLine, RotateCcw, Zap, ArrowUp, Crown, Trophy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

// --- Animated Stickman Components ---
const PushupStickman = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 100 100" style={{ color }}>
    <line x1="10" y1="80" x2="90" y2="80" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <g style={{ animation: 'stick-pushup 1.5s infinite ease-in-out', transformOrigin: '20px 80px' }}>
      <circle cx="75" cy="40" r="8" fill="currentColor" />
      <line x1="70" y1="45" x2="20" y2="80" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <line x1="60" y1="55" x2="60" y2="80" stroke="currentColor" strokeWidth="4" strokeLinecap="round" style={{ animation: 'stick-pushup-arms 1.5s infinite ease-in-out', transformOrigin: '60px 80px' }} />
    </g>
  </svg>
);

const SitupStickman = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 100 100" style={{ color }}>
    <line x1="10" y1="80" x2="90" y2="80" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <path d="M 50 80 L 70 50 L 85 80" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <g style={{ animation: 'stick-situp 1.5s infinite ease-in-out', transformOrigin: '50px 80px' }}>
      <circle cx="25" cy="40" r="8" fill="currentColor" />
      <line x1="30" y1="45" x2="50" y2="80" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    </g>
  </svg>
);

const RunStickman = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 100 100" style={{ color }}>
    <circle cx="50" cy="20" r="8" fill="currentColor" />
    <line x1="50" y1="28" x2="50" y2="60" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <line x1="50" y1="60" x2="35" y2="90" stroke="currentColor" strokeWidth="6" strokeLinecap="round" style={{ animation: 'stick-run-leg1 0.6s infinite linear', transformOrigin: '50px 60px' }} />
    <line x1="50" y1="60" x2="65" y2="90" stroke="currentColor" strokeWidth="6" strokeLinecap="round" style={{ animation: 'stick-run-leg2 0.6s infinite linear', transformOrigin: '50px 60px' }} />
    <line x1="50" y1="35" x2="30" y2="50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" style={{ animation: 'stick-run-leg2 0.6s infinite linear', transformOrigin: '50px 35px' }} />
    <line x1="50" y1="35" x2="70" y2="50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" style={{ animation: 'stick-run-leg1 0.6s infinite linear', transformOrigin: '50px 35px' }} />
  </svg>
);

const PullupStickman = ({ color }) => (
  <svg width="48" height="48" viewBox="0 0 100 100" style={{ color }}>
    <line x1="20" y1="20" x2="80" y2="20" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <g style={{ animation: 'stick-pullup 1.5s infinite ease-in-out' }}>
      <circle cx="50" cy="35" r="8" fill="currentColor" />
      <line x1="50" y1="43" x2="50" y2="80" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <line x1="50" y1="80" x2="40" y2="100" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <line x1="50" y1="80" x2="60" y2="100" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M 30 20 L 40 45 L 50 45" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 70 20 L 60 45 L 50 45" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

function timeToSec(timeStr) {
  if (!timeStr || timeStr === '0:00' || timeStr === '00:00') return Infinity;
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }
  return Infinity;
}

const customAnimations = `
  @keyframes pushupPop {
    0% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-8px) scale(1.1); }
    100% { transform: translateY(0) scale(1); }
  }
  @keyframes situpRock {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(-20deg); }
    75% { transform: rotate(20deg); }
    100% { transform: rotate(0deg); }
  }
  @keyframes zapPulse {
    0% { transform: scale(1) rotate(0deg); filter: drop-shadow(0 0 5px #FBBF24); }
    50% { transform: scale(1.2) rotate(15deg); filter: drop-shadow(0 0 20px #FBBF24); }
    100% { transform: scale(1) rotate(0deg); filter: drop-shadow(0 0 5px #FBBF24); }
  }
  @keyframes pullupRise {
    0% { transform: translateY(5px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(5px); }
  }
  .anim-pushups {
    animation: pushupPop 1.5s ease-in-out infinite;
  }
  .anim-situps {
    animation: situpRock 2s ease-in-out infinite;
  }
  .anim-run {
    animation: zapPulse 1.5s infinite;
  }
  .anim-pullups {
    animation: pullupRise 2s ease-in-out infinite;
  }
`;

export default function Dashboard() {
  const [pftData, setPftData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classTab, setClassTab] = useState('Overall');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/pft_results.csv');
        if (res.ok) {
          const text = await res.text();
          setPftData(parseCSV(text));
        } else {
          console.error("Failed to fetch /pft_results.csv");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dash data:", error);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const testedCadets = pftData.filter(d => d.pft_total && d.pft_total.trim() !== '');
  const avgPft = testedCadets.length > 0
    ? (testedCadets.reduce((s, d) => s + parseFloat(d.pft_total), 0) / testedCadets.length).toFixed(2)
    : '—';

  const stats = [
    { label: 'Avg PFT Score', value: avgPft, icon: <Activity size={16} />, trend: testedCadets.length + ' cadets tested', path: '/deficiencies' },
    { label: 'Upcoming Classes', value: '12', icon: <TrendingUp size={16} />, trend: 'Steady', path: '/schedule' },
    { label: 'Council Activity', value: '89%', icon: <Bell size={16} />, trend: '+2% This week', path: '/' },
  ];

  // Calculate Winners
  const filteredData = classTab === 'Overall' ? pftData : pftData.filter(d => d.class === classTab);

  let topCadet = null;
  let topPushups = null;
  let topSitups = null;
  let topRun = null;
  let topPullups = null;

  filteredData.forEach(d => {
    // Top Cadet
    if (d.pft_total && d.pft_total.trim() !== '') {
      const total = parseFloat(d.pft_total) || 0;
      if (!topCadet || total > (parseFloat(topCadet.pft_total) || 0)) {
        topCadet = d;
      }
    }

    // Top Pushups
    if (d.pushups_raw && d.pushups_raw.trim() !== '') {
      const pu = parseInt(d.pushups_raw, 10) || 0;
      if (!topPushups || pu > (parseInt(topPushups.pushups_raw, 10) || 0)) {
        topPushups = d;
      }
    }

    // Top Situps
    if (d.situps_raw && d.situps_raw.trim() !== '') {
      const su = parseInt(d.situps_raw, 10) || 0;
      if (!topSitups || su > (parseInt(topSitups.situps_raw, 10) || 0)) {
        topSitups = d;
      }
    }

    // Top Run
    const rSec = timeToSec(d.run_time);
    if (rSec !== Infinity) {
      const currBestSec = topRun ? timeToSec(topRun.run_time) : Infinity;
      if (rSec < currBestSec) {
        topRun = d;
      }
    }

    // Top Pullups
    if (d.pullups_raw && d.pullups_raw.trim() !== '') {
      const pl = parseInt(d.pullups_raw, 10) || 0;
      if (!topPullups || pl > (parseInt(topPullups.pullups_raw, 10) || 0)) {
        topPullups = d;
      }
    }
  });

  const hallOfFame = [
    {
      title: "Top Cadet",
      cadet: topCadet,
      score: topCadet ? parseFloat(topCadet.pft_total).toFixed(3) : '—',
      icon: <Crown size={64} style={{ color: '#FBBF24' }} />,
      color: '#FBBF24',
      bg: 'rgba(251, 191, 36, 0.15)'
    },
    {
      title: "Best Push-ups",
      cadet: topPushups,
      score: topPushups ? topPushups.pushups_raw : '—',
      icon: <PushupStickman color="var(--accent-primary)" />,
      color: 'var(--accent-primary)',
      bg: 'rgba(56, 189, 248, 0.15)' 
    },
    {
      title: "Best Sit-ups",
      cadet: topSitups,
      score: topSitups ? topSitups.situps_raw : '—',
      icon: <SitupStickman color="#9d7cff" />,
      color: '#9d7cff',
      bg: 'rgba(157, 124, 255, 0.15)'
    },
    {
      title: "Best Run",
      cadet: topRun,
      score: topRun ? topRun.run_time : '—',
      icon: <RunStickman color="#FBBF24" />,
      color: '#FBBF24',
      bg: 'rgba(251, 191, 36, 0.15)'
    },
    {
      title: "Best Pull-ups",
      cadet: topPullups,
      score: topPullups ? topPullups.pullups_raw : '—',
      icon: <PullupStickman color="#ff4757" />,
      color: '#ff4757',
      bg: 'rgba(255, 71, 87, 0.15)'
    }
  ];

  return (
    <div className="dashboard" style={{ marginTop: '1rem' }}>
      <style>{customAnimations}</style>
      
      {/* Header */}
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

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '3rem' 
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

      {/* PFT Leaderboard Header */}
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ 
          fontSize: '2rem', 
          margin: 0, 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          color: 'var(--text-primary)',
          fontWeight: 800
        }}>
          <Trophy size={32} color="var(--accent-primary)" />
          PFT Hall of Fame
        </h2>
        
        {/* Class Tabs */}
        <div style={{ 
          display: 'flex', 
          background: 'rgba(0,0,0,0.2)', 
          padding: '0.35rem', 
          borderRadius: '16px', 
          gap: '0.35rem', 
          border: '1px solid var(--surface-border)',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
        }}>
          {['Overall', '1CL', '2CL', '3CL'].map(tab => (
            <button
              key={tab}
              onClick={() => setClassTab(tab)}
              style={{
                background: classTab === tab ? 'var(--accent-primary)' : 'transparent',
                color: classTab === tab ? '#1a1a1a' : 'var(--text-primary)',
                border: 'none',
                padding: '0.5rem 1.25rem',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 700,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontSize: '0.9rem',
                boxShadow: classTab === tab ? '0 4px 15px rgba(56, 189, 248, 0.3)' : 'none'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Hall of Fame Display */}
      {loading ? (
        <div className="glass-panel flex-center" style={{ padding: '4rem', color: 'var(--accent-primary)' }}>
          <Activity size={48} className="anim-run" />
          <h3 style={{ marginLeft: '1rem' }}>Loading Leaderboard...</h3>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '1rem' 
        }}>
          {hallOfFame.map((fame, i) => (
            <div 
              key={i} 
              className="glass-card" 
              style={{ 
                padding: '1.5rem 1rem', 
                position: 'relative', 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                textAlign: 'center',
                gridColumn: i === 0 ? '1 / -1' : 'auto', // Top Cadet spans full width
                background: i === 0 ? 'linear-gradient(145deg, rgba(251, 191, 36, 0.1) 0%, var(--surface-glass) 100%)' : 'var(--surface-glass)',
                border: i === 0 ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid var(--surface-border)',
                minHeight: i === 0 ? '240px' : '220px',
                boxShadow: i === 0 ? '0 10px 40px rgba(251, 191, 36, 0.1)' : 'var(--shadow-md)',
                borderRadius: '24px',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {/* Background watermark icon */}
              <div style={{ 
                position: 'absolute', 
                top: '-30px', 
                right: '-30px', 
                opacity: 0.03, 
                transform: 'rotate(15deg) scale(2.5)',
                pointerEvents: 'none'
              }}>
                {fame.icon}
              </div>

              {/* Icon Container */}
              <div style={{ 
                marginBottom: '1rem', 
                background: fame.bg, 
                padding: '1rem', 
                borderRadius: '50%', 
                display: 'inline-flex',
                boxShadow: `0 0 20px ${fame.bg}`
              }}>
                {fame.icon}
              </div>

              <h4 style={{ 
                color: fame.color, 
                fontSize: i === 0 ? '1.25rem' : '1rem', 
                textTransform: 'uppercase', 
                letterSpacing: '1.5px', 
                marginBottom: '1rem',
                fontWeight: 800
              }}>
                {fame.title}
              </h4>

              {fame.cadet ? (
                <>
                  <div style={{ 
                    fontSize: i === 0 ? '2.8rem' : '1.8rem', 
                    fontWeight: 800, 
                    color: 'var(--text-primary)', 
                    marginBottom: '0.75rem',
                    lineHeight: 1.1,
                    textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                  }}>
                    {fame.cadet.cadet}
                  </div>
                  
                  <div className="flex-center text-muted" style={{ gap: '0.75rem', fontSize: '0.9rem', marginBottom: '2rem', fontWeight: 600 }}>
                    <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.35rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {fame.cadet.class}
                    </span>
                    <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.35rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      Co. {fame.cadet.company}
                    </span>
                  </div>

                  <div style={{ 
                    fontSize: i === 0 ? '4rem' : '3rem', 
                    fontWeight: 900, 
                    color: fame.color,
                    marginTop: 'auto',
                    lineHeight: 1,
                    textShadow: `0 0 30px ${fame.color}50`
                  }}>
                    {fame.score}
                  </div>
                </>
              ) : (
                <div style={{ marginTop: 'auto', color: 'var(--text-muted)', fontSize: '1.2rem', fontStyle: 'italic' }}>
                  No data available
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
