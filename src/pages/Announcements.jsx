import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';

// A lightweight CSV parser to handle quotes and commas properly
function parseCSV(csv) {
  if (!csv || typeof csv !== 'string') return [];
  
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

  // Filter out completely empty lines
  const cleanLines = lines.filter(line => line.some(val => val.trim() !== ''));

  if (cleanLines.length === 0 || !cleanLines[0]) return [];

  const headers = cleanLines[0].map(h => h.trim());
  return cleanLines.slice(1).map(line => {
    return headers.reduce((obj, header, i) => {
      obj[header] = line[i] ? line[i].trim() : '';
      return obj;
    }, {});
  });
}

// Helper to convert Google Drive share links to direct image URLs
function resolveImageUrl(url) {
  if (!url) return null;
  // This captures the file ID from standard /file/d/... and ?id=... patterns
  const driveMatch = url.match(/(?:\/file\/d\/|id=)([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1] && url.includes('drive.google.com')) {
    // Using lh3.googleusercontent.com is much more reliable for embedding than drive.google.com/uc
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }
  return url.trim();
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnn, setSelectedAnn] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');

  // 🔴 PASTE YOUR ANNOUNCEMENTS CSV LINK HERE:
  const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQODxASqFgFWPJObis_gXQ-mcN31Kfqn1p0rRriC00czwJ_QZadUp1MQscXRGVwB1vZKP0xAvsBJI3J/pub?gid=0&single=true&output=csv';

  useEffect(() => {
    async function fetchData() {
      const hardcodedAnns = [
        {
          title: "IFMH Formations",
          type: "Info",
          date: "Permanent",
          image: "/ifmh_formation.png",
          content: "Please refer to the detailed diagram for the MWF and TTh Formation layouts at Melchor Hall."
        },
        {
          title: "Class Supervisors",
          type: "Info",
          date: "Permanent",
          isHtml: true,
          content: `
            <div style="overflow-x: auto; margin-top: 1rem;">
              <table class="data-table" style="width: 100%; border-collapse: collapse; text-align: center;">
                <thead>
                  <tr style="background: var(--surface-overlay);">
                    <th style="padding: 1rem; border: 1px solid var(--surface-border);"></th>
                    <th style="padding: 1rem; border: 1px solid var(--surface-border);">Monday</th>
                    <th style="padding: 1rem; border: 1px solid var(--surface-border);">Tuesday</th>
                    <th style="padding: 1rem; border: 1px solid var(--surface-border);">Wednesday</th>
                    <th style="padding: 1rem; border: 1px solid var(--surface-border);">Thursday</th>
                    <th style="padding: 1rem; border: 1px solid var(--surface-border);">Friday</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td data-label="Period" style="padding: 1rem; border: 1px solid var(--surface-border); font-weight: bold;">1st Period</td><td data-label="Monday" style="padding: 1rem; border: 1px solid var(--surface-border);">Sec F</td><td data-label="Tuesday" style="padding: 1rem; border: 1px solid var(--surface-border);">Sec B</td><td data-label="Wednesday" style="padding: 1rem; border: 1px solid var(--surface-border);">Sec F</td><td data-label="Thursday" style="padding: 1rem; border: 1px solid var(--surface-border);">Sec A</td><td data-label="Friday" style="padding: 1rem; border: 1px solid var(--surface-border);">Sec D</td></tr>
                  <tr><td data-label="Period" style="padding: 1rem; border: 1px solid var(--surface-border); font-weight: bold;">2nd Period</td><td data-label="Monday" style="padding: 1rem; border: 1px solid var(--surface-border);">Sec A</td><td data-label="Tuesday" style="padding: 1rem; border: 1px solid var(--surface-border);">Sec H</td><td data-label="Wednesday" style="padding: 1rem; border: 1px solid var(--surface-border);">Sec C</td><td data-label="Thursday" style="padding: 1rem; border: 1px solid var(--surface-border);">Sec H</td><td data-label="Friday" style="padding: 1rem; border: 1px solid var(--surface-border);">Sec C</td></tr>
                  <tr><td data-label="Period" style="padding: 1rem; border: 1px solid var(--surface-border); font-weight: bold;">3rd Period</td><td data-label="Monday" style="padding: 1rem; border: 1px solid var(--surface-border);">Sec K</td><td data-label="Tuesday" style="padding: 1rem; border: 1px solid var(--surface-border);">Sec D</td><td data-label="Wednesday" style="padding: 1rem; border: 1px solid var(--surface-border);">Sec K</td><td data-label="Thursday" style="padding: 1rem; border: 1px solid var(--surface-border);">Sec E</td><td data-label="Friday" style="padding: 1rem; border: 1px solid var(--surface-border);">Sec E</td></tr>
                  <tr><td data-label="Period" style="padding: 1rem; border: 1px solid var(--surface-border); font-weight: bold;">4th Period</td><td data-label="Monday" style="padding: 1rem; border: 1px solid var(--surface-border);">Sec I</td><td data-label="Tuesday" style="padding: 1rem; border: 1px solid var(--surface-border);">Sec J</td><td data-label="Wednesday" style="padding: 1rem; border: 1px solid var(--surface-border);">Sec I</td><td data-label="Thursday" style="padding: 1rem; border: 1px solid var(--surface-border);">Sec J</td><td data-label="Friday" style="padding: 1rem; border: 1px solid var(--surface-border);">Sec B</td></tr>
                  <tr><td data-label="Period" style="padding: 1rem; border: 1px solid var(--surface-border); font-weight: bold;">5th Period</td><td data-label="Monday" style="padding: 1rem; border: 1px solid var(--surface-border);">Sec G</td><td data-label="Tuesday" style="padding: 1rem; border: 1px solid var(--surface-border);">Sec L</td><td data-label="Wednesday" style="padding: 1rem; border: 1px solid var(--surface-border);">Sec G</td><td data-label="Thursday" style="padding: 1rem; border: 1px solid var(--surface-border);">Sec L</td><td data-label="Friday" style="padding: 1rem; border: 1px solid var(--surface-border);">Athletic Council</td></tr>
                </tbody>
              </table>
            </div>
            <h3 style="text-align: center; margin-top: 1.5rem;">All sections will be supervisors TWICE a week</h3>
          `
        }
      ];

      let data = [];
      try {
        if (SHEET_CSV_URL) {
          const response = await fetch(SHEET_CSV_URL);
          if (!response.ok) {
            throw new Error(`HTTP status error: ${response.status}`);
          }
          const csvText = await response.text();
          data = parseCSV(csvText);
        }
      } catch (error) {
        console.error("Error fetching sheet data:", error);
      } finally {
        setAnnouncements([...hardcodedAnns, ...data]);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Announcements</h1>
          <p className="text-muted">Corps-wide broadcasts and urgent athletic updates</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div className="flex-between" style={{ gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search announcements..."
              className="input-field"
              style={{ paddingLeft: '2.75rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <select className="input-field" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="All Types">All Types</option>
              <option value="Important">Important</option>
              <option value="Info">Info</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading data from Google Sheets...</div>
      ) : (() => {
        const filtered = announcements.filter(ann => {
          const matchesType = typeFilter === 'All Types' || ann.type?.toLowerCase() === typeFilter.toLowerCase();
          const matchesSearch = !searchTerm || 
            ann.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            ann.content?.toLowerCase().includes(searchTerm.toLowerCase());
          
          return matchesType && matchesSearch;
        });

        if (filtered.length === 0) {
          return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No announcements match your filters.</div>;
        }

        const columns = ['Important', 'Info', 'Other'];
        
        // Categorize announcements
        const categorizedAnns = columns.reduce((acc, col) => {
          acc[col] = filtered.filter(ann => {
             const type = (ann.type || 'info').toLowerCase();
              if (col.toLowerCase() === 'other') {
                return !['important', 'info'].includes(type);
              }
              return type === col.toLowerCase();
          });
          return acc;
        }, {});

        // Render Kanban Board
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start', paddingBottom: '1rem' }}>
            {columns.map(col => {
               const colAnns = categorizedAnns[col];
               if (colAnns.length === 0 && (searchTerm || typeFilter !== 'All Types') && col === 'Other') return null;

               return (
                 <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   <div className="flex-between" style={{ padding: '0 0.5rem', marginBottom: '0.5rem' }}>
                     <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
                       <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: `var(--badge-${col.toLowerCase()}-color, var(--text-secondary))` }}></div>
                       {col}
                     </h3>
                     <span className="badge" style={{ background: 'var(--surface-overlay)', color: 'var(--text-secondary)' }}>{colAnns.length}</span>
                   </div>
                   
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                     {colAnns.length === 0 ? (
                       <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', opacity: 0.5, borderStyle: 'dashed' }}>
                         <p style={{ fontSize: '0.85rem' }}>No announcements</p>
                       </div>
                     ) : (
                       colAnns.map((ann, i) => (
                         <div key={i} className="glass-card" style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', position: 'relative' }} onClick={() => setSelectedAnn(ann)}>
                            <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                              <span className={`badge badge-${ann.type?.toLowerCase() || 'info'}`} style={{ fontSize: '0.65rem' }}>{ann.type?.toUpperCase() || 'INFO'}</span>
                              <span className="text-muted" style={{ fontSize: '0.7rem' }}>{ann.date}</span>
                            </div>
                            <h4 style={{ marginBottom: '0.5rem', fontSize: '1.05rem', lineHeight: '1.4' }}>{ann.title}</h4>
                            {ann.class && <span className="badge badge-secondary" style={{ background: 'var(--surface-overlay)', border: '1px solid var(--surface-border)', alignSelf: 'flex-start', marginBottom: '0.75rem', fontSize: '0.65rem' }}>{ann.class}</span>}
                            {ann.image && (
                              <div style={{ marginBottom: '0.75rem', width: '100%', height: '120px', overflow: 'hidden', borderRadius: 'var(--radius-sm)' }}>
                                <img src={resolveImageUrl(ann.image)} alt={ann.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            )}
                            <div style={{ color: 'var(--text-secondary)', lineHeight: '1.5', fontSize: '0.8rem', flex: 1 }}>
                              {ann.isHtml ? (
                                "Click to view full table details..."
                              ) : (
                                ann.content && ann.content.length > 80 ? ann.content.substring(0, 80) + '...' : ann.content
                              )}
                            </div>
                         </div>
                       ))
                     )}
                   </div>
                 </div>
               );
            })}
          </div>
        );
      })()}

      {selectedAnn && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', WebkitBackdropFilter: 'blur(4px)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setSelectedAnn(null)}>
          <div className="glass-panel modal-inner" style={{ background: 'var(--bg-color)', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedAnn(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--surface-overlay)', border: '1px solid var(--surface-border)', color: 'var(--text-primary)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}>
              <X size={18} />
            </button>
            <div className="flex-between" style={{ marginBottom: '1.5rem', marginTop: '0.5rem' }}>
              <span className={`badge badge-${selectedAnn.type?.toLowerCase() || 'info'}`}>{selectedAnn.type?.toUpperCase() || 'INFO'}</span>
              <span className="text-muted" style={{ fontSize: '0.875rem' }}>{selectedAnn.date}</span>
            </div>
            <h1 style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>{selectedAnn.title}</h1>
            {selectedAnn.image && (
                <div style={{ marginBottom: '2rem', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <img src={resolveImageUrl(selectedAnn.image)} alt={selectedAnn.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
            )}
            {selectedAnn.isHtml ? (
              <div style={{ color: 'var(--text-primary)', lineHeight: '1.8', fontSize: '1.05rem' }} dangerouslySetInnerHTML={{ __html: selectedAnn.content }} />
            ) : (
              <div style={{ color: 'var(--text-primary)', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontSize: '1.05rem' }}>
                {selectedAnn.content}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
