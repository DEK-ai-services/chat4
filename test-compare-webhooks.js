const axios = require('axios');

// Webhook URL (stejná pro oba)
const webhookUrl = 'https://jarv1s.dekchecker.cloud/webhook/01853d92-764e-4432-a9fd-89432f9c0a4c';
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzMTFkNzVhMi1iODg0LTQ2ODMtYmUzNy02ZGU4NDE2ZTc1ZTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUzMTY0NDkyLCJleHAiOjE3NTU3MjcyMDB9.JetPd4s90kNwkfRTlSIQPCQzMDAWX4MUxK_6jXeHyHs';

async function testWebhook(source) {
  const testData = {
    message: `Ahoj ${source}, jak se máš?`,
    userId: "test-user-123",
    conversationId: "test-conversation-456",
    messageId: "test-message-789",
    timestamp: new Date().toISOString(),
    source: source
  };

  console.log(`\n${source === 'jarvis' ? '🤖' : '🧪'} Testování ${source.toUpperCase()} webhook...`);
  console.log('📤 Data:', JSON.stringify(testData, null, 2));
  
  try {
    const response = await axios.post(webhookUrl, testData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      timeout: 30000
    });

    console.log(`✅ ${source.toUpperCase()} - Úspěšná odpověď!`);
    console.log('📊 Status:', response.status);
    
    if (response.data && response.data.output) {
      console.log('💬 Odpověď:', response.data.output);
    } else {
      console.log('⚠️  Bez "output" pole, dostupná data:', Object.keys(response.data || {}));
    }

    return { success: true, data: response.data, status: response.status };

  } catch (error) {
    console.log(`❌ ${source.toUpperCase()} - Chyba:`, error.message);
    
    if (error.response) {
      console.log('📊 Error status:', error.response.status);
      console.log('📝 Error data:', JSON.stringify(error.response.data, null, 2));
    }
    
    return { success: false, error: error.message, status: error.response?.status };
  }
}

async function compareWebhooks() {
  console.log('🔍 Porovnávací test Jarvis vs Edie webhook komunikace');
  console.log('🌐 Webhook URL:', webhookUrl);
  console.log('⏰ Čas testu:', new Date().toISOString());
  
  // Test Jarvis
  const jarvisResult = await testWebhook('jarvis');
  
  // Počkat 2 sekundy mezi testy
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test Edie
  const edieResult = await testWebhook('edie');
  
  // Porovnání výsledků
  console.log('\n📊 POROVNÁNÍ VÝSLEDKŮ:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🤖 JARVIS:');
  console.log(`   Status: ${jarvisResult.success ? '✅ Úspěch' : '❌ Chyba'}`);
  console.log(`   HTTP Status: ${jarvisResult.status || 'N/A'}`);
  if (jarvisResult.success && jarvisResult.data?.output) {
    console.log(`   Odpověď: "${jarvisResult.data.output}"`);
  }
  
  console.log('\n🧪 EDIE:');
  console.log(`   Status: ${edieResult.success ? '✅ Úspěch' : '❌ Chyba'}`);
  console.log(`   HTTP Status: ${edieResult.status || 'N/A'}`);
  if (edieResult.success && edieResult.data?.output) {
    console.log(`   Odpověď: "${edieResult.data.output}"`);
  }
  
  console.log('\n🔍 ANALÝZA:');
  if (jarvisResult.success && edieResult.success) {
    console.log('✅ Oba webhooky fungují správně');
    if (jarvisResult.data?.output === edieResult.data?.output) {
      console.log('📝 n8n vrací stejnou odpověď pro oba zdroje');
    } else {
      console.log('📝 n8n vrací různé odpovědi podle zdroje');
    }
  } else if (jarvisResult.success && !edieResult.success) {
    console.log('⚠️  Jarvis funguje, ale Edie ne');
    console.log('🔧 Možné příčiny:');
    console.log('   - n8n workflow nerozpoznává "edie" jako platný zdroj');
    console.log('   - Edie webhook ID není nakonfigurováno v n8n');
  } else if (!jarvisResult.success && edieResult.success) {
    console.log('⚠️  Edie funguje, ale Jarvis ne');
  } else {
    console.log('❌ Ani jeden webhook nefunguje');
    console.log('🔧 Zkontrolujte:');
    console.log('   - Dostupnost n8n serveru');
    console.log('   - Platnost API klíče');
    console.log('   - Konfiguraci webhook workflow');
  }
}

// Spustit porovnávací test
compareWebhooks().then(() => {
  console.log('\n🏁 Porovnávací test dokončen');
}).catch((error) => {
  console.log('\n💥 Neočekávaná chyba:', error.message);
}); 