import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import { HelmetProvider } from 'react-helmet-async'

// Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Results from './pages/Results'
import ViewRecommendation from './pages/ViewRecommendation'

// Context Providers
import { AppProvider } from './context/AppContext'
import { RecommendationProvider } from './context/RecommendationContext'

// API Service
import { checkApiStatus } from './services/api'

function App() {
  const [apiStatus, setApiStatus] = useState<string>('checking')

  useEffect(() => {
    let isMounted = true;
    
    const checkStatus = async () => {
      try {
        await checkApiStatus()
        if (isMounted) {
          setApiStatus('online')
        }
      } catch {
        if (isMounted) {
          setApiStatus('offline')
        }
      }
    }

    checkStatus()
    const interval = setInterval(() => {
      if (isMounted) {
        checkStatus()
      }
    }, 30000) // Check every 30 seconds
    
    return () => {
      isMounted = false;
      clearInterval(interval)
    }
  }, [])

  return (
    <Router>
      <AppProvider>
        <RecommendationProvider>
          <HelmetProvider>
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
              <Navbar apiStatus={apiStatus} />
              
              <main className="container mx-auto px-3 lg:px-6 flex-grow py-4 max-w-full">
              {apiStatus === 'offline' ? (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded shadow-sm mb-4 flex items-center">
                  <span className="mr-2 text-lg flex-shrink-0">⚠️</span>
                  <span className="break-words">API is offline. Please start the backend server.</span>
                </div>
              ) : (
                <div className="w-full max-w-full">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/results" element={<Results />} />
                    <Route path="/report/:filename" element={<ViewRecommendation />} />
                    <Route path="/view/:filename" element={<ViewRecommendation />} />
                  </Routes>
                </div>
              )}
              </main>
              
              <Footer />
            </div>
          </HelmetProvider>
        </RecommendationProvider>
      </AppProvider>
    </Router>
  )
}

export default App
