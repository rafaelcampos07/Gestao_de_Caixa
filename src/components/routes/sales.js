// routes/sales.js

const express = require('express');
const { createSale, cancelSale } = require('../controllers/salesController');

const router = express.Router();

router.post('/sales', createSale);
router.delete('/sales/:id', cancelSale);

module.exports = router;