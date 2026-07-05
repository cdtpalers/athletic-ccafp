import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Home, Bell, BookOpen, ShieldAlert, Calendar, Menu, X, Info, Moon, Sun, ChevronLeft, ChevronRight, Loader, FileText } from 'lucide-react';
import { SpeedInsights } from "@vercel/speed-insights/react";
import athleticLogo from './assets/athletic_logo.webp';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Announcements = lazy(() => import('./pages/Announcements'));
const Deficiencies = lazy(() => import('./pages/Deficiencies'));
const About = lazy(() => import('./pages/About'));
const ClassSchedule = lazy(() => import('./pages/ClassSchedule'));
const GradeReports = lazy(() => import('./pages/GradeReports'));

function DateTimeWidget({ isCollapsed }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (isCollapsed) return null;

  const pad = (n) => n.toString().padStart(2, '0');

  const timeBlocks = [
    { value: pad(time.getHours()), label: 'HOURS' },
    { value: pad(time.getMinutes()), label: 'MINS' },
    { value: pad(time.getSeconds()), label: 'SECS' }
  ];

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="datetime-monitor" style={{
      margin: '0.5rem 1rem 1.5rem 1rem',
      background: 'var(--surface-glass)',
      backdropFilter: 'blur(var(--blur-md))',
      WebkitBackdropFilter: 'blur(var(--blur-md))',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--surface-border)',
      color: 'var(--text-primary)',
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.25rem' }}>
        {timeBlocks.map((b, i) => (
          <div key={i} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{
              background: 'var(--surface-overlay)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.5rem 0.2rem',
              width: '100%',
              fontSize: '1.4rem',
              fontWeight: 600,
              fontFamily: 'monospace',
              letterSpacing: '0.5px',
              marginBottom: '0.4rem',
              border: '1px solid var(--surface-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {b.value}
            </div>
            <div style={{ fontSize: '0.55rem', letterSpacing: '1px', color: 'var(--text-secondary)' }}>{b.label}</div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'color-mix(in srgb, var(--accent-primary) 12%, transparent)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem',
        border: '1px solid var(--surface-border)'
      }}>
        <div style={{ fontSize: '0.6rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem', fontWeight: 600 }}>CURRENT DATE</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
          <span style={{ fontSize: '1.2rem' }}>📅</span>
          {dayName[time.getDay()]}, {monthNames[time.getMonth()]} {time.getDate()}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>A.Y. 2026-2027 • 1st TERM</div>
      </div>
    </div>
  );
}

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const navItems = [
    { path: '/', label: 'Overview', icon: <Home size={20} /> },
    { path: '/announcements', label: 'Announcements', icon: <Bell size={20} /> },
    { path: '/deficiencies', label: 'Deficiencies', icon: <ShieldAlert size={20} /> },
    { path: '/schedule', label: 'HAG CLASS SCHED', icon: <Calendar size={20} /> },
    { path: '/grades', label: 'Grade Reports', icon: <FileText size={20} /> },
    { path: '/about', label: 'About', icon: <Info size={20} /> }
  ];

  return (
    <div className="layout-wrapper">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="brand flex-center">
          <img src={athleticLogo} alt="Athletic Council Logo" className="brand-icon-img" />
          <span className="brand-text">Athletic Council</span>
        </div>
        <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header hide-mobile">
          <div className="flex-between brand-header" style={{ width: '100%', alignItems: 'center' }}>
            <div className="brand flex-center">
              <img src={athleticLogo} alt="Athletic Council Logo" className="brand-icon-img" />
              <div className="brand-text-container" style={{ marginLeft: '0.75rem' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Athletic Council</h2>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="text-muted" style={{ fontSize: '0.90rem', fontWeight: 500 }}>CCAFP</span>
                  <p style={{ 
                    fontSize: '0.65rem', 
                    color: 'var(--accent-primary)', 
                    fontStyle: 'italic', 
                    marginTop: '0.15rem', 
                    letterSpacing: '0.3px',
                    opacity: 0.9
                  }}>
                    "Faster, better, stronger CCAFP"
                  </p>
                </div>
              </div>
            </div>
            <button className="desktop-toggle" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)' }} onClick={() => setIsCollapsed(!isCollapsed)}>
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <DateTimeWidget isCollapsed={isCollapsed} />

        <div className="sidebar-footer">
          <button
            className="nav-link"
            style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>

      </aside>

      {/* Main Content */}
      <main className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <SpeedInsights />
      <Layout>
        <Suspense fallback={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'var(--text-secondary)' }}>
            <Loader size={36} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ margin: 0, fontWeight: 500 }}>Loading Module...</h3>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/deficiencies" element={<Deficiencies />} />
            <Route path="/schedule" element={<ClassSchedule />} />
            <Route path="/grades" element={<GradeReports />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
