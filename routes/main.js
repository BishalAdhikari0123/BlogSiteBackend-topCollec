import express from 'express';
const router = express.Router();

// ✅ Public: no token needed
router.post('/auth/register', async (req, res) => {
  try {
    // your registration logic (validate, save, send OTP, etc.)
    res.status(200).json({ success: true, message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Registration failed', error: err.message });
  }
});

// You can later protect other routes
// router.get('/profile', getUserFromAuthToken, (req, res) => { ... });

export default router;
