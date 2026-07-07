import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import axios from 'axios'
import './index.css'

// Vercel proxy: /api/* → https://affiliate-t553.vercel.app/api/*
// En production, on utilise des URLs relatives (pas besoin de baseURL)
axios.defaults.baseURL = '';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
