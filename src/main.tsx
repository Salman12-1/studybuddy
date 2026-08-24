import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import AuthProvider from "./context/AuthContext"
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

/*
This is the entry point of the React application. It starts React and renders the application into the root element in index.html. 
It also wraps the app with BrowserRouter, which enables routing, and AuthProvider, 
which makes the current Supabase authentication session available throughout StudyBuddy.
*/