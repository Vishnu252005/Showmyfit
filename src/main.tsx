import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Lazy load App for better code splitting
const LazyApp = App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#9333EA'
      }}>
        Loading ShowMyFIT...
      </div>
    }>
      <LazyApp />
    </Suspense>
  </StrictMode>
);
