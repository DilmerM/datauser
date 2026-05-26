import TelemetryComponent from './TelemetryComponent'
import AdminDashboard from './AdminDashboard'
import './Honeypot.css'

function App() {
  // Enrutamiento súper sencillo: Si la URL es /admin, abrimos tu panel secreto
  if (window.location.pathname === '/admin') {
    return <AdminDashboard />
  }

  // De lo contrario, cargamos la trampa normal
  return (
    <>
      <TelemetryComponent />
    </>
  )
}
export default App
