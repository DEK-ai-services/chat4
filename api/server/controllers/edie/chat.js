const { sendEvent } = require('@librechat/api');
const { logger } = require('@librechat/data-schemas');
const { Constants } = require('librechat-data-provider');
const { v4: uuidv4 } = require('uuid');
const { saveMessage } = require('~/models');
const axios = require('axios');

/**
 * @route POST /api/edie/chat
 * @desc Chat with Edie (with n8n webhook response) - TEXT VERSION
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
      endpoint: 'edie',
      model: 'edie',
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

    // Odeslat zprávu na n8n webhook a čekat na odpověď
    let responseText = "OK, jasné"; // Fallback odpověď
    try {
      const webhookUrl = 'https://jarv1s.dekchecker.cloud/webhook/923098bd-432d-46c4-ab09-b891531b05bc';
      const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzMTFkNzVhMi1iODg0LTQ2ODMtYmUzNy02ZGU4NDE2ZTc1ZTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUzMTY0NDkyLCJleHAiOjE3NTU3MjcyMDB9.JetPd4s90kNwkfRTlSIQPCQzMDAWX4MUxK_6jXeHyHs';
      
      const webhookData = {
        message: text,
        userId: userId,
        conversationId: conversationId,
        messageId: userMessageId,
        timestamp: new Date().toISOString(),
        source: 'edie'
      };

      logger.info('[/edie/chat] Sending webhook request to:', webhookUrl);
      logger.info('[/edie/chat] Webhook data:', JSON.stringify(webhookData, null, 2));

      const webhookResponse = await axios.post(webhookUrl, webhookData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 30000 // 30 sekund timeout pro n8n odpověď
      });

      logger.info('[/edie/chat] Webhook response status:', webhookResponse.status);
      logger.info('[/edie/chat] Webhook response data:', JSON.stringify(webhookResponse.data, null, 2));

      // Zpracovat odpověď z n8n - n8n vrací text, ne JSON
      if (webhookResponse.status === 200 && webhookResponse.data) {
        if (typeof webhookResponse.data === 'string') {
          responseText = webhookResponse.data;
          logger.info('[/edie/chat] Received text response from n8n:', responseText);
        } else if (webhookResponse.data.output) {
          // Fallback pro případ, že n8n vrátí JSON s output polem
          responseText = webhookResponse.data.output;
          logger.info('[/edie/chat] Received JSON response with output from n8n:', responseText);
        } else {
          logger.warn('[/edie/chat] n8n response is not text or JSON with output field:', webhookResponse.data);
        }
      } else {
        logger.warn('[/edie/chat] n8n returned non-200 status:', webhookResponse.status);
      }

      logger.info('[/edie/chat] Webhook sent successfully to n8n and received response');
    } catch (webhookError) {
      logger.error('[/edie/chat] Webhook error:', webhookError.message);
      if (webhookError.response) {
        logger.error('[/edie/chat] Webhook error response status:', webhookError.response.status);
        logger.error('[/edie/chat] Webhook error response data:', webhookError.response.data);
      }
      // Pokračujeme s fallback odpovědí i když webhook selže
    }

    // Create response message s odpovědí z n8n nebo fallback
    const responseMessage = {
      user: userId,
      text: responseText,
      messageId: responseMessageId,
      parentMessageId: userMessageId,
      conversationId,
      isCreatedByUser: false,
      endpoint: 'edie',
      model: 'edie',
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
        endpoint: 'edie',
        model: 'edie',
      },
    });

    // Ukončit SSE spojení
    res.end();

  } catch (error) {
    logger.error('[/edie/chat] Error:', error);
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