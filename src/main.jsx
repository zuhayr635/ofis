import React from 'react';
import { createRoot } from 'react-dom/client';
import Site from './Site.jsx';
import Admin from './Admin.jsx';
import '../style.css';
import '../admin.css';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, details) {
    console.error('Başkent Class uygulama hatası:', error, details);
  }

  render() {
    if (this.state.error) {
      return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem', background: '#0b0b0a', color: '#eee9df', fontFamily: 'Manrope, sans-serif', textAlign: 'center' }}>
        <div><p style={{ color: '#d2a84f', letterSpacing: '.18em', fontSize: '.65rem' }}>BAŞKENT CLASS</p><h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 500 }}>Sayfa yüklenirken bir sorun oluştu.</h1><p style={{ color: '#8b887f' }}>Lütfen sayfayı yenileyin. Sorun devam ederse yöneticiyle iletişime geçin.</p><button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '.9rem 1.3rem', border: 0, background: '#d2a84f', color: '#171109', cursor: 'pointer' }}>Sayfayı yenile</button></div>
      </main>;
    }
    return this.props.children;
  }
}

const isAdmin = window.location.pathname.startsWith('/admin');
createRoot(document.getElementById('root')).render(
  <React.StrictMode><AppErrorBoundary>{isAdmin ? <Admin /> : <Site />}</AppErrorBoundary></React.StrictMode>
);
