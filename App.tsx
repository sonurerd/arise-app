import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { Auth } from './pages/Auth'
import { AuthCallback } from './pages/AuthCallback'
import { Home } from './pages/Home'
import { Dashboard } from './pages/Dashboard'
import { Protocols } from './pages/Protocols'
import { Analytics } from './pages/Analytics'
import { Oracle } from './pages/Oracle'
import { Profile } from './pages/Profile'
import { About } from './pages/About'

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="protocols" element={<Protocols />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="oracle" element={<Oracle />} />
              <Route path="about" element={<About />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  )
}