import { Router } from 'express'
import { authRequired } from '../middlewares/auth.js'
import { getFlagsForUser } from '../config/flags.js'

const router = Router()

router.get('/', authRequired, (req, res) => {
  const flags = getFlagsForUser(req.user)
  res.json(flags)
})

export default router
