import React from 'react';
import ReactDOM from 'react-dom/client';
// import './index.css'; // Assuming you will create this CSS file later
import App from './App';

// Get the root element from the HTML
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the main App component into the root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
