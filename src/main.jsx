import React from 'react'
import ReactDOM from 'react-dom/client'
// Bundled locally (not Google Fonts) so the Android app and bad-Wi-Fi offices
// render correctly offline. Inter covers Albanian ë and ç.
import '@fontsource-variable/inter'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
