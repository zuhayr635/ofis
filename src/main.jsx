import React from 'react';
import { createRoot } from 'react-dom/client';
import Site from './Site.jsx';
import Admin from './Admin.jsx';
import '../style.css';
import '../admin.css';

const isAdmin = window.location.pathname.startsWith('/admin');
createRoot(document.getElementById('root')).render(
  <React.StrictMode>{isAdmin ? <Admin /> : <Site />}</React.StrictMode>
);
