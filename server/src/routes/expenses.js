import { Router } from 'express'
import Expense from '../models/Expense.js'
import { authRequired, requireRole } from '../middlewares/auth.js'

const router = Router()

// List own expenses; managers/admin can see all
router.get('/', authRequired, async (req, res, next) => {
  try {
    const query = ['manager', 'admin'].includes(req.user.role) ? {} : { user: req.user.id }
    const items = await Expense.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
    res.json(items)
  } catch (err) {
    next(err)
  }
})

// Create expense
router.post('/', authRequired, async (req, res, next) => {
  try {
    const { title, amount, category, date, notes } = req.body
    const item = await Expense.create({ user: req.user.id, title, amount, category, date, notes })
    res.status(201).json(item)
  } catch (err) {
    next(err)
  }
})

// Update own expense (or any by admin)
router.put('/:id', authRequired, async (req, res, next) => {
  try {
    const { id } = req.params
    const existing = await Expense.findById(id)
    if (!existing) return res.status(404).json({ message: 'Not found' })
    if (existing.user.toString() !== req.user.id && !['admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' })
    }
    Object.assign(existing, req.body)
    await existing.save()
    res.json(existing)
  } catch (err) {
    next(err)
  }
})

// Approve/Reject by manager or admin
router.post(
  '/:id/status',
  authRequired,
  requireRole('manager', 'admin'),
  async (req, res, next) => {
    try {
      const { id } = req.params
      const { status } = req.body
      if (!['approved', 'rejected', 'pending'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' })
      }
      const item = await Expense.findByIdAndUpdate(id, { status }, { new: true })
      if (!item) return res.status(404).json({ message: 'Not found' })
      res.json(item)
    } catch (err) {
      next(err)
    }
  },
)

// Delete own expense or any by admin
router.delete('/:id', authRequired, async (req, res, next) => {
  try {
    const { id } = req.params
    const existing = await Expense.findById(id)
    if (!existing) return res.status(404).json({ message: 'Not found' })
    if (existing.user.toString() !== req.user.id && !['admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' })
    }
    await existing.deleteOne()
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

export default router
