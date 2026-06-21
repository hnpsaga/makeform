import { useState } from 'react';
import Home from './pages/Home.js';
import RegistrationForm from './pages/RegistrationForm.js';
import ProfileForm from './pages/ProfileForm.js';
import ValidationDemo from './pages/ValidationDemo.js';
import Features from './pages/Features.js';
import Styling from './pages/Styling.js';
import Renderers from './pages/Renderers.js';
import MuiDemo from './pages/MuiDemo.js';

type Page =
  | 'home'
  | 'features'
  | 'registration'
  | 'profile'
  | 'validation'
  | 'styling'
  | 'renderers'
  | 'mui';

const navItems: { page: Page; label: string }[] = [
  { page: 'home', label: 'Home' },
  { page: 'features', label: 'Features' },
  { page: 'registration', label: 'Registration' },
  { page: 'profile', label: 'Profile' },
  { page: 'validation', label: 'Validation' },
  { page: 'styling', label: 'Styling' },
  { page: 'renderers', label: 'Renderers' },
  { page: 'mui', label: 'Material UI' },
];

const pages: Record<Page, () => React.ReactNode> = {
  home: () => <Home />,
  features: () => <Features />,
  registration: () => <RegistrationForm />,
  profile: () => <ProfileForm />,
  validation: () => <ValidationDemo />,
  styling: () => <Styling />,
  renderers: () => <Renderers />,
  mui: () => <MuiDemo />,
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const PageComponent = pages[currentPage];

  return (
    <div>
      <nav
        style={{
          background: '#1f2937',
          padding: '0.75rem 1rem',
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <strong style={{ color: '#fff', marginRight: '0.5rem' }}>MakeForm Demo</strong>
        {navItems.map((item) => (
          <button
            key={item.page}
            onClick={() => setCurrentPage(item.page)}
            style={{
              background: currentPage === item.page ? '#6366f1' : 'transparent',
              color: '#fff',
              border: '1px solid #6366f1',
              padding: '0.25rem 0.75rem',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <main style={{ padding: '1.5rem', maxWidth: '64rem', margin: '0 auto' }}>
        <PageComponent />
      </main>
    </div>
  );
}
