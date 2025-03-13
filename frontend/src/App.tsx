import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar apiStatus={apiStatus} />
        
        <main className="container mx-auto px-3 flex-grow py-4">
          {apiStatus === 'offline' ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded shadow-sm mb-4 flex items-center">
              <span className="mr-2 text-lg">⚠️</span>
              <span>API is offline. Please start the backend server.</span>
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
