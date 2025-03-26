const express = require('express');
const router = express.Router();

const { protect } = require("../../middleware/authMiddleware")
const { updateName, updatePassword, updateBio } = require("../../controllers/userController");

router.put('/update-name', protect, updateName);
router.put('/update-password', protect, updatePassword);
router.put('/update-bio', protect, updateBio);

module.exports = router;