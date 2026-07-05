import { Users, User, Medal, Star } from 'lucide-react';

import rAthleticImg from '../assets/r_athletic.webp';
import aCoImg from '../assets/a_co.webp';
import aSgtImg from '../assets/a_sgt.webp';
import bCoImg from '../assets/b_co.webp';
import bSgtImg from '../assets/b_sgt.webp';
import cCoImg from '../assets/c_co.webp';
import cSgtImg from '../assets/c_sgt.webp';
import dCoImg from '../assets/d_co.webp';
import dSgtImg from '../assets/d_sgt.webp';
import eCoImg from '../assets/e_co.webp';
import eSgtImg from '../assets/e_sgt.webp';
import fCoImg from '../assets/f_co.webp';
import fSgtImg from '../assets/f_sgt.webp';
import gCoImg from '../assets/g_co.webp';
import hCoImg from '../assets/h_co.webp';

const companies = [
  {
    id: 'A', name: 'Alpha Company',
    officer: { name: "AERO CDT 1CL CARLOS JOSE REONAL", imageUrl: aCoImg },
    sgt: { name: "CDT 2CL JOYCE RAMOS", imageUrl: aSgtImg },
    cpl: { name: "[Co. A Cpl Name]", imageUrl: "" }
  },
  {
    id: 'B', name: 'Bravo Company',
    officer: { name: "MIDN 1CL ALADDIN CAYAGO", imageUrl: bCoImg },
    sgt: { name: "CDT 2CL KARL RIGOR UY DIAZ", imageUrl: bSgtImg },
    cpl: { name: "[Co. B Cpl Name]", imageUrl: "" }
  },
  {
    id: 'C', name: 'Charlie Company',
    officer: { name: "MIDN 1CL ALEXANDER NULUD", imageUrl: cCoImg },
    sgt: { name: "CDT 2CL AJIJUL MAADIL", imageUrl: cSgtImg },
    cpl: { name: "[Co. C Cpl Name]", imageUrl: "" }
  },
  {
    id: 'D', name: 'Delta Company',
    officer: { name: "AERO CDT 1CL FREDERIC DACARA", imageUrl: dCoImg },
    sgt: { name: "CDT 2CL IANNA JHONS GRY DABALOS", imageUrl: dSgtImg },
    cpl: { name: "[Co. D Cpl Name]", imageUrl: "" }
  },
  {
    id: 'E', name: 'Echo Company',
    officer: { name: "ARMY CDT 1CL FRANCES VERONICA LATORRE", imageUrl: eCoImg },
    sgt: { name: "CDT 2CL SANDESLUV OTTAO", imageUrl: eSgtImg },
    cpl: { name: "[Co. E Cpl Name]", imageUrl: "" }
  },
  {
    id: 'F', name: 'Foxtrot Company',
    officer: { name: "AERO CDT 1CL EROLL VILLANUEVA", imageUrl: fCoImg },
    sgt: { name: "CDT 2CL XYDENT MERJ REGIS", imageUrl: fSgtImg },
    cpl: { name: "[Co. F Cpl Name]", imageUrl: "" }
  },
  {
    id: 'G', name: 'Golf Company',
    officer: { name: "MIDN 1CL ARIES CHIRISTIAN BAROY", imageUrl: gCoImg },
    sgt: { name: "[Co. G Sgt Name]", imageUrl: "" },
    cpl: { name: "[Co. G Cpl Name]", imageUrl: "" }
  },
  {
    id: 'H', name: 'Hawk Company',
    officer: { name: "AERO CDT 1CL LEAH BEAH CANSINO", imageUrl: hCoImg },
    sgt: { name: "[Co. H Sgt Name]", imageUrl: "" },
    cpl: { name: "[Co. H Cpl Name]", imageUrl: "" }
  },
];

function ProfileCard({ role, name, imageUrl, isTopLevel = false }) {
  return (
    <div className="glass-card" style={{
      padding: isTopLevel ? '2rem' : '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      borderTop: isTopLevel ? '3px solid var(--accent-gold)' : '1px solid var(--surface-highlight)',
      background: isTopLevel ? 'color-mix(in srgb, var(--accent-primary) 5%, transparent)' : 'var(--surface-overlay)'
    }}>
      <div style={{
        width: isTopLevel ? '150px' : '100px',
        height: isTopLevel ? '150px' : '100px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--surface-border), var(--surface-overlay))',
        border: '2px solid var(--surface-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1rem',
        color: 'var(--text-secondary)',
        overflow: 'hidden'
      }}>
        {imageUrl ? (
          <img src={imageUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          isTopLevel ? <Star size={40} /> : <User size={30} />
        )}
      </div>
      <h3 style={{ fontSize: isTopLevel ? '1.25rem' : '1.1rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
        {name}
      </h3>
      <p style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {role}
      </p>
    </div>
  );
}

function SubordinateCard({ role, name, imageUrl }) {
  return (
    <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--surface-overlay)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-highlight)' }}>
      <div style={{ margin: '0 auto 0.5rem auto', width: '80px', height: '80px', borderRadius: '50%', background: 'var(--surface-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {imageUrl ? (
          <img src={imageUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <User size={24} color="var(--text-secondary)" />
        )}
      </div>
      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{name}</div>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{role}</div>
    </div>
  );
}

export default function About() {
  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div className="flex-between" style={{ marginBottom: '3rem' }}>
        <div>
          <h1>About the Athletic Council</h1>
          <p className="text-muted">Organizational and Command Structure</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4rem' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <ProfileCard
            role="Regimental Athletic Officer"
            name="CDT CPT 1CL MARTIN SIMON S PALERO C-27274 'A' Co"
            isTopLevel={true}
            imageUrl={rAthleticImg}
          />
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          <Users className="text-accent-primary" />
          Company Athletic Elements
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem'
        }}>
          {companies.map(company => (
            <div key={company.id} className="glass-card" style={{ padding: '1.5rem', background: 'var(--surface-highlight)' }}>
              <div style={{
                borderBottom: '1px solid var(--surface-border)',
                paddingBottom: '1rem',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Medal size={18} className="text-accent-primary" />
                  {company.name}
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <ProfileCard
                  role="Company Athletic Officer"
                  name={company.officer.name}
                  imageUrl={company.officer.imageUrl}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <SubordinateCard
                    role="ATHLETIC SGT"
                    name={company.sgt.name}
                    imageUrl={company.sgt.imageUrl}
                  />
                  <SubordinateCard
                    role="ATHLETIC CPL"
                    name={company.cpl.name}
                    imageUrl={company.cpl.imageUrl}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
