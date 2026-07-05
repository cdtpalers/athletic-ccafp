import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Home, Bell, BookOpen, Activity, Calendar, Menu, X, Info, Search, Zap, FileText } from 'lucide-react';
import { SpeedInsights } from "@vercel/speed-insights/react";

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Announcements = lazy(() => import('./pages/Announcements'));
const Deficiencies = lazy(() => import('./pages/Deficiencies'));
const About = lazy(() => import('./pages/About'));
const ClassSchedule = lazy(() => import('./pages/ClassSchedule'));
const GradeReports = lazy(() => import('./pages/GradeReports'));

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const navItems = [
    { path: '/', label: 'Overview', icon: <Home size={22} /> },
    { path: '/announcements', label: 'Announcements', icon: <Bell size={22} /> },
    { path: '/deficiencies', label: 'PFT Tracker', icon: <Activity size={22} /> },
    { path: '/schedule', label: 'HAG CLASS SCHED', icon: <Calendar size={22} /> },
    { path: '/grades', label: 'Grade Reports', icon: <FileText size={22} /> },
    { path: '/about', label: 'About', icon: <Info size={22} /> }
  ];

  return (
    <div className="layout-wrapper">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="brand flex-center">
          <Zap size={28} color="var(--accent-primary)" fill="var(--accent-primary)" />
        </div>
        <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)' }}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Slim Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header hide-mobile" style={{ padding: '2rem 0', border: 'none' }}>
          <div className="brand flex-center">
            <Zap size={32} color="var(--accent-primary)" fill="var(--accent-primary)" />
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              title={item.label}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Header Bar */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '1.5rem 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'var(--bg-color)'
        }}>
          {/* Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--surface-glass)',
            borderRadius: '9999px',
            padding: '0.6rem 1.2rem',
            width: '300px',
            border: '1px solid var(--surface-border)'
          }}>
            <Search size={18} color="var(--text-secondary)" style={{ marginRight: '0.75rem' }} />
            <input 
              type="text" 
              placeholder="Start Search Here..." 
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                outline: 'none',
                width: '100%',
                fontSize: '0.9rem'
              }}
            />
          </div>

        </header>

        <div className="page-container" style={{ paddingTop: '0' }}>
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
