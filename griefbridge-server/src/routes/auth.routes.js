import express from 'express';
import { register, login, logout, getProfile, updateProfile } from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', authMiddleware, (req, res, next) => {
  if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
  getProfile(req, res, next);
});
router.patch('/profile', authMiddleware, (req, res, next) => {
  if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
  updateProfile(req, res, next);
});

export default router;
