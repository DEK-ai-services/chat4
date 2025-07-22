const { sendEvent } = require('@librechat/api');
const { logger } = require('@librechat/data-schemas');
const { Constants } = require('librechat-data-provider');
const { v4: uuidv4 } = require('uuid');
const { saveMessage } = require('~/models');

/**
 * @route POST /api/jarvis/chat
 * @desc Chat with Jarvis (simple response)
 * @access Public
 */
const chat = async (req, res) => {
  const {
    text,
    conversationId: convoId,
    parentMessageId = Constants.NO_PARENT,
  } = req.body;

  const userId = req.user.id;
  const conversationId = convoId ?? uuidv4();
  const userMessageId = uuidv4();
  const responseMessageId = uuidv4();

  try {
    // Create user message
    const userMessage = {
      user: userId,
      text,
      messageId: userMessageId,
      parentMessageId,
      conversationId,
      isCreatedByUser: true,
      endpoint: 'jarvis',
      model: 'jarvis',
    };

    // Save user message
    await saveMessage(req, userMessage);

    // Send created event
    sendEvent(res, {
      created: true,
      message: {
        messageId: userMessageId,
        parentMessageId,
        conversationId,
      },
    });

    // Simple Jarvis response
    const responseText = "OK, jasné";

    // Create response message
    const responseMessage = {
      user: userId,
      text: responseText,
      messageId: responseMessageId,
      parentMessageId: userMessageId,
      conversationId,
      isCreatedByUser: false,
      endpoint: 'jarvis',
      model: 'jarvis',
      // Neposílat audio URL, aby se předešlo TTS chybám
      audio: null,
    };

    // Save response message
    await saveMessage(req, responseMessage);

    // Send final event
    sendEvent(res, {
      final: true,
      requestMessage: userMessage,
      responseMessage: responseMessage,
      conversation: {
        conversationId,
        endpoint: 'jarvis',
        model: 'jarvis',
      },
    });

    // Ukončit SSE spojení
    res.end();

  } catch (error) {
    logger.error('[/jarvis/chat] Error:', error);
    sendEvent(res, {
      error: {
        message: 'An error occurred while processing the request',
        details: error.message,
      },
    });
    res.end();
  }
};

module.exports = chat; 