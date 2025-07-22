const express = require('express');
const { requireJwtAuth } = require('~/server/middleware');
const chat = require('~/server/controllers/jarvis/chat');

const router = express.Router();

router.use(requireJwtAuth);

// Jednoduchý chat endpoint pro Jarvis
router.post('/chat', chat);

module.exports = router; 