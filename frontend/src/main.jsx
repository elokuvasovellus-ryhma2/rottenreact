import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './shared/components/Navbar.css';
import './shared/components/Footer.css';

import App from './App.jsx';
import UserProvider from './shared/contexts/UserProvider.jsx'; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </StrictMode>
);
