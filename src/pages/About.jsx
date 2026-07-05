import React from 'react';
import { Info } from 'lucide-react';

export default function About() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', padding: '24px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
        <Info size={48} style={{ color: 'var(--accent-primary)', margin: '0 auto 16px' }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>About</h1>
        <p className="text-muted">Content temporarily unavailable. Check back soon.</p>
      </div>
    </div>
  );
}
