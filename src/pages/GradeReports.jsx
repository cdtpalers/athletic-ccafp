import { FileText, Info, Calendar, BookOpen, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const WEEKS = [7, 6, 5, 4, 3, 2, 1];

const WEEK_REPORTS = {
  1: [
    "COM431.pdf", "ENGG431.pdf", "GIS231.pdf", "HRP431.pdf", "IT331.pdf", 
    "LAW231.pdf", "LDM331.pdf", "OM231.pdf", "PHI231.pdf", "PHY331.pdf", 
    "RES331.pdf", "RES431.pdf", "RM431.pdf", "SGD231.pdf", "TI331.pdf"
  ],
  2: [
    "COM431.pdf", "ENGG431.pdf", "GIS231.pdf", "HRP431.pdf", "IT331.pdf",
    "LAW231.pdf", "LDM331.pdf", "MAT231.pdf", "OM231.pdf", "PHI231.pdf",
    "PHY331.pdf", "RES331.pdf", "RES431.pdf", "RM431.pdf", "SGD231.pdf",
    "TI331.pdf", "WIT431.pdf"
  ],
  3: [
    "COM431.pdf", "ENGG431.pdf", "GIS231.pdf", "HRP431.pdf", "IT331.pdf",
    "LAW231.pdf", "LDM331.pdf", "MAT231.pdf", "OM231.pdf", "PHI231.pdf",
    "PHY331(.pdf", "RES331.pdf", "RES431.pdf", "RM431.pdf", "SGD231.pdf",
    "TI331.pdf", "WIT431.pdf"
  ],
  4: [
    "1CL/COM431.pdf", "1CL/ENGG431.pdf", "1CL/HRP431.pdf", "1CL/RES431.pdf", "1CL/RM431.pdf", "1CL/WIT431.pdf",
    "2CL/IT331.pdf", "2CL/LDM331.pdf", "2CL/PHY331.pdf", "2CL/RES331.pdf", "2CL/TI331.pdf",
    "3CL/GIS231.pdf", "3CL/LAW231.pdf", "3CL/MAT231.pdf", "3CL/OM231.pdf", "3CL/PHI231.pdf", "3CL/SGD231.pdf"
  ],
  5: [
    "1CL/COM431.pdf", "1CL/ENGG431.pdf", "1CL/HRP431.pdf", "1CL/RES431.pdf", "1CL/RM431.pdf", "1CL/WIT431.pdf",
    "2CL/IT331.pdf", "2CL/LDM331.pdf", "2CL/PHY331.pdf", "2CL/RES331.pdf", "2CL/TI331.pdf",
    "3CL/GIS231.pdf", "3CL/LAW231.pdf", "3CL/MAT231.pdf", "3CL/OM231.pdf", "3CL/PHI231.pdf", "3CL/SGD231.pdf"
  ]
};

export default function GradeReports() {
  const [activeWeek, setActiveWeek] = useState(5);
  const [selectedReport, setSelectedReport] = useState(WEEK_REPORTS[5]?.[0] || null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleWeekChange = (week) => {
    setActiveWeek(week);
    if (WEEK_REPORTS[week] && WEEK_REPORTS[week].length > 0) {
      setSelectedReport(WEEK_REPORTS[week][0]);
    } else {
      setSelectedReport(null);
    }
    setLoading(true);
  };

  const handleReportChange = (e) => {
    setSelectedReport(e.target.value);
    setLoading(true);
  };

  const getPdfUrl = () => {
    if (!selectedReport) return '';
    return `/week${activeWeek}(def)/${selectedReport}#toolbar=0&navpanes=0&scrollbar=0`;
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="glass-card modal-inner" style={{ padding: '3rem', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'color-mix(in srgb, var(--accent-primary) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <Lock size={28} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>Restricted Access</h2>
          <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>This section contains sensitive grade reports. Please enter the access code to continue.</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (password === 'melchorhall') {
              setIsAuthenticated(true);
              setAuthError('');
            } else {
              setAuthError('Incorrect password. Access denied.');
            }
          }}>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setAuthError(''); }}
                placeholder="Enter access code..."
                className="input-field"
                style={{ width: '100%', paddingRight: '3rem' }}
                autoFocus
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {authError && (
              <p style={{ color: 'var(--accent-crimson)', fontSize: '0.85rem', marginBottom: '1rem' }}>{authError}</p>
            )}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Unlock</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="grade-reports-page">
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1>Deficiency Reports</h1>
          <p className="text-muted">Weekly Deficiency Reports (1CL - 3CL)</p>
        </div>
      </div>

      <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: '0.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
        {WEEKS.map(week => (
          <button
            key={week}
            onClick={() => handleWeekChange(week)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: activeWeek === week ? 'var(--accent-primary)' : 'transparent',
              color: activeWeek === week ? '#fff' : 'var(--text-primary)',
              fontWeight: activeWeek === week ? '600' : '400',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <Calendar size={18} />
            Week {week}
          </button>
        ))}
      </div>

      {!WEEK_REPORTS[activeWeek] ? (
        <div className="glass-panel" style={{ marginBottom: '2.5rem', padding: '2rem', textAlign: 'center' }}>
          <Info size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem', display: 'inline-block' }} />
          <h3>No Reports Available</h3>
          <p className="text-muted">Deficiency reports for Week {activeWeek} have not been uploaded yet.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', height: '75vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileText size={20} style={{ color: 'var(--accent-primary)' }} />
              <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>Document Viewer</h2>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <BookOpen size={18} style={{ color: 'var(--text-muted)' }} />
              <select 
                value={selectedReport || ''} 
                onChange={handleReportChange}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  background: 'var(--surface-background)',
                  border: '1px solid var(--surface-border)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {(() => {
                  const reports = WEEK_REPORTS[activeWeek];
                  const groups = { '1CL': [], '2CL': [], '3CL': [], 'Other': [] };
                  reports.forEach(report => {
                    const basename = report.split('/').pop();
                    const match = basename.match(/\d/);
                    if (match) {
                      if (match[0] === '4') groups['1CL'].push(report);
                      else if (match[0] === '3') groups['2CL'].push(report);
                      else if (match[0] === '2') groups['3CL'].push(report);
                      else groups['Other'].push(report);
                    } else {
                      groups['Other'].push(report);
                    }
                  });

                  return Object.keys(groups).map(groupLabel => {
                    if (groups[groupLabel].length === 0) return null;
                    return (
                      <optgroup key={groupLabel} label={`${groupLabel} Courses`}>
                        {groups[groupLabel].map(report => (
                          <option key={report} value={report}>
                            {report.split('/').pop().replace('.pdf', '')}
                          </option>
                        ))}
                      </optgroup>
                    );
                  });
                })()}
              </select>
            </div>
          </div>
          
          <div style={{ flex: 1, position: 'relative', background: 'var(--surface-background)' }}>
            {loading && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 0 }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  border: '3px solid var(--surface-border)', 
                  borderTopColor: 'var(--accent-primary)', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite',
                  marginBottom: '1rem'
                }}></div>
                <p style={{ color: 'var(--text-secondary)' }}>Loading Document...</p>
                <style>{`
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            )}
            
            {selectedReport && (
              <iframe 
                key={selectedReport}
                src={getPdfUrl()}
                title="Deficiency Report PDF Viewer"
                width="100%"
                height="100%"
                style={{ border: 'none', position: 'relative', zIndex: 1, background: 'transparent' }}
                onLoad={() => setLoading(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
