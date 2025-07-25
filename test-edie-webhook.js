const axios = require('axios');

// Test data pro Edie
const testData = {
  message: "Ahoj Edie, jak se máš?",
  userId: "test-user-123",
  conversationId: "test-conversation-456",
  messageId: "test-message-789",
  timestamp: new Date().toISOString(),
  source: 'edie'
};

// Webhook URL pro Edie (stejná jako Jarvis pro testování)
const webhookUrl = 'https://jarv1s.dekchecker.cloud/webhook/923098bd-432d-46c4-ab09-b891531b05bc';
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzMTFkNzVhMi1iODg0LTQ2ODMtYmUzNy02ZGU4NDE2ZTc1ZTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUzMTY0NDkyLCJleHAiOjE3NTU3MjcyMDB9.JetPd4s90kNwkfRTlSIQPCQzMDAWX4MUxK_6jXeHyHs';

async function testEdieWebhook() {
  console.log('🧪 Testování Edie webhook komunikace s n8n...');
  console.log('📤 Odesílám data:', JSON.stringify(testData, null, 2));
  console.log('🌐 Webhook URL:', webhookUrl);
  
  try {
    console.log('\n⏳ Čekám na odpověď z n8n...');
    
    const response = await axios.post(webhookUrl, testData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      timeout: 30000 // 30 sekund timeout
    });

    console.log('\n✅ Úspěšná odpověď z n8n!');
    console.log('📊 Status:', response.status);
    console.log('📄 Headers:', JSON.stringify(response.headers, null, 2));
    console.log('📝 Response data:', JSON.stringify(response.data, null, 2));
    
    // Kontrola, zda odpověď obsahuje očekávané pole
    if (response.data && response.data.output) {
      console.log('\n🎯 n8n odpověď obsahuje "output" pole:');
      console.log('💬 Zpráva:', response.data.output);
    } else {
      console.log('\n⚠️  n8n odpověď neobsahuje "output" pole');
      console.log('📋 Dostupná pole:', Object.keys(response.data || {}));
    }

  } catch (error) {
    console.log('\n❌ Chyba při komunikaci s n8n:');
    console.log('🔍 Error message:', error.message);
    
    if (error.response) {
      console.log('📊 Error status:', error.response.status);
      console.log('📄 Error headers:', JSON.stringify(error.response.headers, null, 2));
      console.log('📝 Error data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('🌐 Network error - žádná odpověď z serveru');
    }
  }
}

// Spustit test
testEdieWebhook().then(() => {
  console.log('\n🏁 Test dokončen');
}).catch((error) => {
  console.log('\n💥 Neočekávaná chyba:', error.message);
}); 