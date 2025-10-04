import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { authRequired } from '../middlewares/auth.js'

const router = Router()

function sign(user) {
  const payload = { id: user._id.toString(), email: user.email, name: user.name, role: user.role }
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' })
  return { token, user: payload }
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' })
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ message: 'Email already registered' })
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, passwordHash, role: role || 'user' })
    const result = sign(user)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })
    const ok = await user.comparePassword(password)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })
    const result = sign(user)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

router.get('/me', authRequired, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash')
    res.json(user)
  } catch (err) {
    next(err)
  }
})

export default router
