import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export function authRequired(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  const token = header.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret')
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

export function requireRole(...roles) {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id)
      if (!user) return res.status(401).json({ message: 'Unauthorized' })
      if (!roles.includes(user.role)) return res.status(403).json({ message: 'Forbidden' })
      req.user.role = user.role
      next()
    } catch (err) {
      next(err)
    }
  }
}
