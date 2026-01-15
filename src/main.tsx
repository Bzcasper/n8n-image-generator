import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { NeonAuthUIProvider } from "@neondatabase/neon-js/auth/react/ui";
import { client } from './lib/auth';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import "@neondatabase/neon-js/ui/css";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <NeonAuthUIProvider authClient={client.auth}>
        <App />
      </NeonAuthUIProvider>
    </BrowserRouter>
  </StrictMode>
);
