import React from 'react';
import ReactDOM from 'react-dom/client';
import './style/index.css';
import App from './App';

import { ConfigProvider } from './providers/ConfigProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider } from './providers/AuthProvider';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ConfigProvider>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </ConfigProvider>
  </React.StrictMode>
);