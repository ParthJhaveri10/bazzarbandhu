import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useOrderStore } from './store/orderStore'
import { useSocket } from './hooks/useSocket'
import { LanguageProvider } from './context/LanguageContext'
import Header from './components/Header'
import VendorDashboard from './pages/VendorDashboard'
import SupplierDashboard from './pages/SupplierDashboard'
import OrderPool from './pages/OrderPool'
import Home from './pages/Home'

function App() {
  const { initializeSocket } = useSocket()
  const { fetchOrders } = useOrderStore()

  useEffect(() => {
    initializeSocket()
    fetchOrders()
  }, [])

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/vendor" 
            element={
              <>
                <Header />
                <main className="container mx-auto px-4 py-8">
                  <VendorDashboard />
                </main>
              </>
            } 
          />
          <Route 
            path="/supplier" 
            element={
              <>
                <Header />
                <main className="container mx-auto px-4 py-8">
                  <SupplierDashboard />
                </main>
              </>
            } 
          />
          <Route 
            path="/pools" 
            element={
              <>
                <Header />
                <main className="container mx-auto px-4 py-8">
                  <OrderPool />
                </main>
              </>
            } 
          />
        </Routes>
      </div>
    </LanguageProvider>
  )
}

export default App
