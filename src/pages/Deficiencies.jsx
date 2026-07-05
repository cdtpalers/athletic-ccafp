import { Activity, Users, Award, Lock, Eye, EyeOff, Download, Search, ArrowUpDown, ChevronUp, ChevronDown, TrendingUp, AlertTriangle, Trophy, Medal, Crown } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function parseCSV(csv) {
  const lines = [];
  let currentLine = [];
  let currentVal = '';
  let insideQuotes = false;
  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const nextChar = csv[i + 1];
    if (char === '"' && insideQuotes && nextChar === '"') { currentVal += '"'; i++; }
    else if (char === '"') { insideQuotes = !insideQuotes; }
    else if (char === ',' && !insideQuotes) { currentLine.push(currentVal); currentVal = ''; }
    else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') ++i;
      currentLine.push(currentVal); lines.push(currentLine); currentLine = []; currentVal = '';
    } else { currentVal += char; }
  }
  if (currentVal || currentLine.length > 0) { currentLine.push(currentVal); lines.push(currentLine); }
  const headers = lines[0].map(h => h.trim());
  return lines.slice(1).filter(line => line.join('').trim() !== '').map(line => {
    return headers.reduce((obj, header, i) => { obj[header] = line[i] ? line[i].trim() : ''; return obj; }, {});
  });
}

const COMPANY_NAMES = {
  'A': 'Alpha', 'B': 'Bravo', 'C': 'Charlie', 'D': 'Delta',
  'E': 'Echo', 'F': 'Foxtrot', 'G': 'Golf', 'H': 'Hawk',
};

function getScoreColor(score) {
  if (!score || score === '') return 'var(--text-secondary)';
  const n = parseFloat(score);
  if (n >= 9.0) return '#ccff00';
  if (n >= 7.0) return '#FBBF24';
  return '#ff4757';
}

export default function Deficiencies() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState('All');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('pft_total');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showConcern, setShowConcern] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'betterccafp') {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  useEffect(() => {
    if (!authenticated) return;
    setLoading(true);
    fetch('/pft_results.csv')
      .then(res => res.text())
      .then(csv => {
        const parsed = parseCSV(csv);
        setData(parsed);
        setLoading(false);
      })
      .catch(() => {
        setData([]);
        setLoading(false);
      });
  }, [authenticated]);

  const filteredData = useMemo(() => {
    let result = [...data];
    if (classFilter !== 'All') {
      result = result.filter(r => r.class === classFilter);
    }
    if (companyFilter !== 'All') {
      result = result.filter(r => r.company === companyFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(r =>
        (r.cadet && r.cadet.toLowerCase().includes(term)) ||
        (r.cn && r.cn.toLowerCase().includes(term))
      );
    }
    result.sort((a, b) => {
      if (sortField === 'cadet') {
        const cmp = (a.cadet || '').localeCompare(b.cadet || '');
        return sortDirection === 'asc' ? cmp : -cmp;
      }
      const aVal = parseFloat(a[sortField]) || 0;
      const bVal = parseFloat(b[sortField]) || 0;
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return result;
  }, [data, classFilter, companyFilter, searchTerm, sortField, sortDirection]);

  const stats = useMemo(() => {
    const tested = filteredData.filter(r => r.pft_total && r.pft_total !== '');
    const scores = tested.map(r => parseFloat(r.pft_total)).filter(n => !isNaN(n));
    const avg = scores.length ? (scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
    const passCount = scores.filter(s => s >= 7.0).length;
    const passRate = scores.length ? ((passCount / scores.length) * 100) : 0;
    const topScore = scores.length ? Math.max(...scores) : 0;
    const topPerformer = tested.find(r => parseFloat(r.pft_total) === topScore);
    return {
      avg: avg.toFixed(2),
      passRate: passRate.toFixed(1),
      topPerformer: topPerformer ? topPerformer.cadet : 'N/A',
      topScore: topScore.toFixed(2),
      totalTested: tested.length,
    };
  }, [filteredData]);

  const companyChartData = useMemo(() => {
    const companies = {};
    filteredData.forEach(r => {
      if (!r.company || !r.pft_total || r.pft_total === '') return;
      const score = parseFloat(r.pft_total);
      if (isNaN(score)) return;
      if (!companies[r.company]) companies[r.company] = { total: 0, count: 0 };
      companies[r.company].total += score;
      companies[r.company].count += 1;
    });
    return Object.keys(COMPANY_NAMES).filter(k => companies[k]).map(k => ({
      company: COMPANY_NAMES[k],
      avg: parseFloat((companies[k].total / companies[k].count).toFixed(2)),
    }));
  }, [filteredData]);

  const eventChartData = useMemo(() => {
    const events = { pushups_score: { total: 0, count: 0 }, situps_score: { total: 0, count: 0 }, run_score: { total: 0, count: 0 }, pullups_score: { total: 0, count: 0 } };
    filteredData.forEach(r => {
      ['pushups_score', 'situps_score', 'run_score', 'pullups_score'].forEach(key => {
        const v = parseFloat(r[key]);
        if (!isNaN(v) && r[key] !== '') {
          events[key].total += v;
          events[key].count += 1;
        }
      });
    });
    return [
      { event: 'Push-ups', avg: events.pushups_score.count ? parseFloat((events.pushups_score.total / events.pushups_score.count).toFixed(2)) : 0 },
      { event: 'Sit-ups', avg: events.situps_score.count ? parseFloat((events.situps_score.total / events.situps_score.count).toFixed(2)) : 0 },
      { event: 'Run', avg: events.run_score.count ? parseFloat((events.run_score.total / events.run_score.count).toFixed(2)) : 0 },
      { event: 'Pull-ups', avg: events.pullups_score.count ? parseFloat((events.pullups_score.total / events.pullups_score.count).toFixed(2)) : 0 },
    ];
  }, [filteredData]);

  const topCadets = useMemo(() => {
    const tested = filteredData.filter(r => r.pft_total && r.pft_total !== '');
    const sorted = [...tested].sort((a, b) => parseFloat(b.pft_total) - parseFloat(a.pft_total));
    return sorted.slice(0, 3);
  }, [filteredData]);

  const cadetsOfConcern = useMemo(() => {
    return filteredData.filter(r => {
      if (!r.pft_total || r.pft_total === '') return false;
      const total = parseFloat(r.pft_total);
      if (total < 7.0) return true;
      const eventScores = [r.pushups_score, r.situps_score, r.run_score, r.pullups_score];
      return eventScores.some(s => s !== '' && parseFloat(s) === 0);
    });
  }, [filteredData]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={14} style={{ opacity: 0.3 }} />;
    return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const exportCSV = () => {
    const headers = ['Class', 'Cadet', 'CN', 'Company', 'Push-ups Raw', 'Push-ups Score', 'Sit-ups Raw', 'Sit-ups Score', 'Run Time', 'Run Score', 'Pull-ups Raw', 'Pull-ups Score', 'PFT Total'];
    const rows = filteredData.map(r => [r.class, r.cadet, r.cn, r.company, r.pushups_raw, r.pushups_score, r.situps_raw, r.situps_score, r.run_time, r.run_score, r.pullups_raw, r.pullups_score, r.pft_total]);
    let csvStr = headers.join(',') + '\n';
    rows.forEach(row => {
      csvStr += row.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(',') + '\n';
    });
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pft_results_filtered_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── LOCK SCREEN ───
  if (!authenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', padding: '20px' }}>
        <div className="glass-panel" style={{ maxWidth: '420px', width: '100%', padding: '48px 36px', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(204,255,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Lock size={32} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '1.5rem', fontWeight: 700 }}>PFT Results</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.9rem' }}>Enter password to view fitness test data</p>
          <form onSubmit={handleLogin}>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{
                  width: '100%', padding: '14px 48px 14px 16px', background: 'var(--surface-glass)', border: '1px solid var(--surface-border)',
                  borderRadius: '12px', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--surface-border)'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && <p style={{ color: '#ff4757', fontSize: '0.85rem', marginBottom: '12px' }}>{error}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '0.95rem', fontWeight: 600, borderRadius: '12px', cursor: 'pointer' }}>
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── LOADING STATE ───
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)' }}>
        <div style={{ textAlign: 'center' }}>
          <Activity size={48} style={{ color: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>Loading PFT data...</p>
        </div>
      </div>
    );
  }

  const CLASS_TABS = ['All', '1CL', '2CL', '3CL'];
  const COMPANY_OPTIONS = ['All', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const SORT_OPTIONS = [
    { value: 'pft_total', label: 'PFT Total' },
    { value: 'pushups_score', label: 'Push-ups' },
    { value: 'situps_score', label: 'Sit-ups' },
    { value: 'run_score', label: 'Run' },
    { value: 'pullups_score', label: 'Pull-ups' },
    { value: 'cadet', label: 'Name' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', padding: '24px', color: 'var(--text-primary)' }}>
      {/* HEADER */}
      <div className="flex-between" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(204,255,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={24} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Physical Fitness Tracker</h1>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>PFT Results &amp; Analytics</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowConcern(!showConcern)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', background: 'rgba(255, 71, 87, 0.1)', color: '#ff4757', border: '1px solid rgba(255, 71, 87, 0.2)', transition: 'all 0.2s' }}>
            <AlertTriangle size={16} /> {showConcern ? 'Back to PFT Scores' : `Cadets of Concern (${cadetsOfConcern.length})`}
          </button>
          <button className="btn btn-primary" onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {!showConcern && (
        <>
      {/* FILTERS */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          {/* Class Tabs */}
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '4px' }}>
            {CLASS_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setClassFilter(tab)}
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                  background: classFilter === tab ? 'var(--accent-primary)' : 'transparent',
                  color: classFilter === tab ? '#000' : 'var(--text-secondary)',
                  transition: 'all 0.2s',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Company Dropdown */}
          <select
            value={companyFilter}
            onChange={e => setCompanyFilter(e.target.value)}
            style={{
              padding: '10px 14px', background: 'var(--surface-glass)', border: '1px solid var(--surface-border)',
              borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', cursor: 'pointer', minWidth: '140px',
            }}
          >
            <option value="All">All Companies</option>
            {COMPANY_OPTIONS.slice(1).map(c => (
              <option key={c} value={c}>{COMPANY_NAMES[c]} Co.</option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortField}
            onChange={e => setSortField(e.target.value)}
            style={{
              padding: '10px 14px', background: 'var(--surface-glass)', border: '1px solid var(--surface-border)',
              borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', cursor: 'pointer', minWidth: '130px',
            }}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>Sort: {opt.label}</option>
            ))}
          </select>

          <button
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
            style={{
              padding: '10px', background: 'var(--surface-glass)', border: '1px solid var(--surface-border)',
              borderRadius: '10px', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center',
            }}
            title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search cadet or CN..."
              style={{
                width: '100%', padding: '10px 14px 10px 36px', background: 'var(--surface-glass)', border: '1px solid var(--surface-border)',
                borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Average PFT */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg PFT Score</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(204,255,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} style={{ color: 'var(--accent-primary)' }} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: getScoreColor(stats.avg) }}>{stats.avg}</div>
          <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.78rem' }}>out of 10.0</p>
        </div>

        {/* Pass Rate */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pass Rate</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(204,255,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={18} style={{ color: 'var(--accent-primary)' }} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: parseFloat(stats.passRate) >= 80 ? '#ccff00' : parseFloat(stats.passRate) >= 60 ? '#FBBF24' : '#ff4757' }}>{stats.passRate}%</div>
          <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.78rem' }}>≥ 7.0 PFT total</p>
        </div>

        {/* Top Performer */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Performer</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(204,255,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={18} style={{ color: 'var(--accent-primary)' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stats.topPerformer}</div>
          <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.78rem' }}>Score: {stats.topScore}</p>
        </div>

        {/* Total Tested */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Tested</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(204,255,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} style={{ color: 'var(--accent-primary)' }} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.totalTested}</div>
          <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.78rem' }}>cadets with scores</p>
        </div>
      </div>

      {/* TOP CADETS STAGE RAMP */}
      {topCadets.length >= 3 && (
        <div className="glass-panel" style={{ padding: '32px 24px', marginBottom: '24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <Trophy size={24} style={{ color: '#FBBF24' }} />
            {classFilter !== 'All' ? `${classFilter} Top Performers` : 'Overall Top Performers'}
          </h3>
          <p className="text-muted" style={{ marginBottom: '32px', fontSize: '0.9rem' }}>Outstanding Athletic Excellence</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '16px', minHeight: '220px', flexWrap: 'wrap' }}>
            {/* 2nd Place */}
            <div style={{ flex: '1 1 120px', maxWidth: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{topCadets[1].cadet}</div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{topCadets[1].company} Co. • {topCadets[1].class}</div>
              </div>
              <div style={{ width: '100%', height: '120px', background: 'linear-gradient(to top, rgba(255,255,255,0.05), rgba(255,255,255,0.15))', borderRadius: '12px 12px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '16px', borderTop: '4px solid #C0C0C0', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                <Medal size={28} style={{ color: '#C0C0C0', marginBottom: '8px' }} />
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#C0C0C0' }}>{parseFloat(topCadets[1].pft_total).toFixed(2)}</div>
              </div>
            </div>

            {/* 1st Place */}
            <div style={{ flex: '1 1 140px', maxWidth: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
              <div style={{ marginBottom: '16px' }}>
                <Crown size={24} style={{ color: '#FBBF24', margin: '0 auto 8px' }} />
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ccff00', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{topCadets[0].cadet}</div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>{topCadets[0].company} Co. • {topCadets[0].class}</div>
              </div>
              <div style={{ width: '100%', height: '160px', background: 'linear-gradient(to top, rgba(204,255,0,0.05), rgba(204,255,0,0.15))', borderRadius: '12px 12px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '16px', borderTop: '4px solid #ccff00', borderLeft: '1px solid rgba(204,255,0,0.1)', borderRight: '1px solid rgba(204,255,0,0.1)', boxShadow: '0 -10px 20px rgba(204,255,0,0.1)' }}>
                <Medal size={36} style={{ color: '#FBBF24', marginBottom: '8px' }} />
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ccff00' }}>{parseFloat(topCadets[0].pft_total).toFixed(2)}</div>
              </div>
            </div>

            {/* 3rd Place */}
            <div style={{ flex: '1 1 120px', maxWidth: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{topCadets[2].cadet}</div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{topCadets[2].company} Co. • {topCadets[2].class}</div>
              </div>
              <div style={{ width: '100%', height: '100px', background: 'linear-gradient(to top, rgba(255,255,255,0.02), rgba(255,255,255,0.08))', borderRadius: '12px 12px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '16px', borderTop: '4px solid #CD7F32', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                <Medal size={24} style={{ color: '#CD7F32', marginBottom: '8px' }} />
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#CD7F32' }}>{parseFloat(topCadets[2].pft_total).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHARTS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Company Performance Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} style={{ color: 'var(--accent-primary)' }} /> Company Performance
          </h3>
          {companyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={companyChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="company" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis domain={[0, 10]} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Tooltip contentStyle={{ background: '#1c1d21', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="avg" name="Avg PFT Score" fill="#ccff00" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex-center" style={{ height: '280px', color: 'var(--text-secondary)' }}>No data available</div>
          )}
        </div>

        {/* Event Breakdown Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} style={{ color: '#9d7cff' }} /> Event Breakdown
          </h3>
          {eventChartData.some(e => e.avg > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={eventChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="event" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis domain={[0, 10]} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Tooltip contentStyle={{ background: '#1c1d21', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="avg" name="Avg Score" fill="#9d7cff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex-center" style={{ height: '280px', color: 'var(--text-secondary)' }}>No data available</div>
          )}
        </div>
      </div>

        </>
      )}

      {/* CADETS OF CONCERN */}
      {showConcern && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', borderLeft: '3px solid #ff4757' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4757' }}>
            <AlertTriangle size={18} /> Cadets of Concern ({cadetsOfConcern.length})
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  {['#', 'Cadet', 'Class', 'Company', 'Push-ups', 'Sit-ups', 'Run', 'Pull-ups', 'PFT Total'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cadetsOfConcern.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: 600 }}>{i + 1}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{r.cadet}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{r.class}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{COMPANY_NAMES[r.company] || r.company}</td>
                    <td style={{ padding: '10px 12px', color: getScoreColor(r.pushups_score) }}>{r.pushups_score || '—'}</td>
                    <td style={{ padding: '10px 12px', color: getScoreColor(r.situps_score) }}>{r.situps_score || '—'}</td>
                    <td style={{ padding: '10px 12px', color: getScoreColor(r.run_score) }}>{r.run_score || '—'}</td>
                    <td style={{ padding: '10px 12px', color: getScoreColor(r.pullups_score) }}>{r.pullups_score || '—'}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: getScoreColor(r.pft_total) }}>{r.pft_total || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!showConcern && (
        <>
      {/* MAIN DATA TABLE */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} style={{ color: 'var(--accent-primary)' }} /> All Cadets ({filteredData.length})
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                {[
                  { label: '#', field: null },
                  { label: 'Cadet', field: 'cadet' },
                  { label: 'CN', field: null },
                  { label: 'Class', field: null },
                  { label: 'Company', field: null },
                  { label: 'Push-ups', field: 'pushups_score', sub: 'Raw / Score' },
                  { label: 'Sit-ups', field: 'situps_score', sub: 'Raw / Score' },
                  { label: 'Run', field: 'run_score', sub: 'Time / Score' },
                  { label: 'Pull-ups', field: 'pullups_score', sub: 'Raw / Score' },
                  { label: 'PFT Total', field: 'pft_total' },
                ].map(col => (
                  <th
                    key={col.label}
                    onClick={col.field ? () => handleSort(col.field) : undefined}
                    style={{
                      padding: '10px 12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600,
                      fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px',
                      cursor: col.field ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'nowrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {col.label}
                      {col.field && <SortIcon field={col.field} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No cadets found matching your filters.</td>
                </tr>
              ) : (
                filteredData.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(204,255,0,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}
                  >
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: 600 }}>{i + 1}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.cadet}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.cn || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                        background: r.class === '1CL' ? 'rgba(204,255,0,0.1)' : r.class === '2CL' ? 'rgba(157,124,255,0.1)' : 'rgba(59,130,246,0.1)',
                        color: r.class === '1CL' ? '#ccff00' : r.class === '2CL' ? '#9d7cff' : '#3b82f6',
                      }}>{r.class}</span>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{COMPANY_NAMES[r.company] || r.company}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{r.pushups_raw || '—'}</span>
                      <span style={{ margin: '0 4px', color: 'rgba(255,255,255,0.15)' }}>/</span>
                      <span style={{ color: getScoreColor(r.pushups_score), fontWeight: 600 }}>{r.pushups_score || '—'}</span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{r.situps_raw || '—'}</span>
                      <span style={{ margin: '0 4px', color: 'rgba(255,255,255,0.15)' }}>/</span>
                      <span style={{ color: getScoreColor(r.situps_score), fontWeight: 600 }}>{r.situps_score || '—'}</span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{r.run_time || '—'}</span>
                      <span style={{ margin: '0 4px', color: 'rgba(255,255,255,0.15)' }}>/</span>
                      <span style={{ color: getScoreColor(r.run_score), fontWeight: 600 }}>{r.run_score || '—'}</span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{r.pullups_raw || '—'}</span>
                      <span style={{ margin: '0 4px', color: 'rgba(255,255,255,0.15)' }}>/</span>
                      <span style={{ color: getScoreColor(r.pullups_score), fontWeight: 600 }}>{r.pullups_score || '—'}</span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        fontWeight: 700, fontSize: '0.95rem', color: getScoreColor(r.pft_total),
                        padding: '2px 8px', borderRadius: '6px',
                        background: r.pft_total && parseFloat(r.pft_total) >= 9.0 ? 'rgba(204,255,0,0.1)' : r.pft_total && parseFloat(r.pft_total) >= 7.0 ? 'rgba(251,191,36,0.1)' : r.pft_total && r.pft_total !== '' ? 'rgba(255,71,87,0.1)' : 'transparent',
                      }}>
                        {r.pft_total || '—'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
