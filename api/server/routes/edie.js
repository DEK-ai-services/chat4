const express = require('express');
const { requireJwtAuth } = require('~/server/middleware');
const chat = require('~/server/controllers/edie/chat');

const router = express.Router();

router.use(requireJwtAuth);

router.post('/chat', chat);

module.exports = router; 