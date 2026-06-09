import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'arise-dev-secret-change-in-production'
const JWT_EXPIRES = '30d'

export function signToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  const payload = verifyToken(header.slice(7))
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
  req.user = { id: payload.sub, username: payload.username }
  next()
}