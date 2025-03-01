import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeDatabase } from './utils/initDatabase'

// Initialize the database before rendering the app
initializeDatabase().catch(error => {
  console.error('Failed to initialize database:', error);
  // Continue rendering the app even if database initialization fails
}).finally(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});