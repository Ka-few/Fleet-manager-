import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import { initDB } from './db/database';
import './index.css';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'white', background: '#0A0F1E', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h1 style={{ color: '#EF4444', marginBottom: '10px' }}>Something went wrong</h1>
          <p style={{ textAlign: 'center', color: '#9CA3AF' }}>{this.state.error?.message}</p>
          <pre style={{ marginTop: '20px', fontSize: '10px', color: '#6B7280', maxWidth: '90%', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const initializeApp = async () => {
  try {
    await initDB();

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <ErrorBoundary>
          <Provider store={store}>
            <App />
          </Provider>
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (error) {
    console.error('App initialization failed:', error);
    document.getElementById('root')!.innerHTML = `
      <div style="padding: 20px; color: white; background: #0A0F1E; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <h1 style="color: #EF4444; margin-bottom: 10px;">Failed to Start App</h1>
        <p style="text-align: center; color: #9CA3AF;">Could not initialize local database.</p>
        <p style="margin-top: 20px; font-size: 12px; color: #9CA3AF;">${error instanceof Error ? error.message : String(error)}</p>
      </div>
    `;
  }
};

initializeApp();
