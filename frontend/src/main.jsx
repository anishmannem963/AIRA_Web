import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a28',
            color: '#f0edf8',
            border: '1px solid rgba(155,127,232,0.2)',
            borderRadius: '12px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.88rem',
          },
          success: { iconTheme: { primary: '#6ec6a0', secondary: '#1a1a28' } },
          error: { iconTheme: { primary: '#e87f9b', secondary: '#1a1a28' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
