import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { completeSignIn } = useAuth()
  const [message, setMessage] = useState('Completing sign-in…')

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')
    const redirect = searchParams.get('redirect') || '/'

    if (error) {
      setMessage(error)
      const timer = setTimeout(() => navigate('/auth', { replace: true }), 2800)
      return () => clearTimeout(timer)
    }

    if (!token) {
      setMessage('Missing sign-in token')
      const timer = setTimeout(() => navigate('/auth', { replace: true }), 2800)
      return () => clearTimeout(timer)
    }

    completeSignIn(token)
      .then(() => navigate(redirect, { replace: true }))
      .catch(() => {
        setMessage('Could not complete sign-in')
        setTimeout(() => navigate('/auth', { replace: true }), 2800)
      })
  }, [searchParams, completeSignIn, navigate])

  return (
    <div className="arise-bg min-h-screen flex items-center justify-center p-6">
      <div className="glass px-8 py-6 text-center max-w-sm">
        <p className="text-sm text-zinc-300">{message}</p>
      </div>
    </div>
  )
}