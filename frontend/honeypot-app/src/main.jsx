import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

const GOOGLE_CLIENT_ID = "776083836267-14ddurra7o2q2sjtnkdbich1bi7uvree.apps.googleusercontent.com"; // Nueva credencial recién creada

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider 
        clientId={GOOGLE_CLIENT_ID}
        onScriptLoadError={() => console.error("Error cargando el script de Google")}
        onScriptLoadSuccess={() => console.log("Script de Google cargado")}
    >
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
