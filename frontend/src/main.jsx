import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import axios from 'axios'
import './index.css'

// URL du backend Vercel (production)
const backendUrl = import.meta.env.VITE_API_URL || 'https://affiliate-t553.vercel.app';
axios.defaults.baseURL = backendUrl;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
