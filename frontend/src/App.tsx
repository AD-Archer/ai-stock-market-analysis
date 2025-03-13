import  { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

// Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Results from './pages/Results'
import ViewRecommendation from './pages/ViewRecommendation'

// API Service
import { checkApiStatus } from './services/api'

function App() {
  const [apiStatus, setApiStatus] = useState<string>('checking')

  useEffect(() => {
    const checkStatus = async () => {
      try {
        await checkApiStatus()
        setApiStatus('online')
      } catch (error) {
        setApiStatus('offline')
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 30000) // Check every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  return (
    <Router>
      <div className="app-container d-flex flex-column min-vh-100">
        <Navbar apiStatus={apiStatus} />
        
        <main className="container flex-grow-1 mt-4">
          {apiStatus === 'offline' ? (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-triangle me-2"></i>
              API is offline. Please start the backend server.
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/results" element={<Results />} />
              <Route path="/view/:filename" element={<ViewRecommendation />} />
            </Routes>
          )}
        </main>
        
        <Footer />
      </div>
    </Router>
  )
}

export default App
