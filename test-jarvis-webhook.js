const fetch = require('node-fetch');

async function testJarvisWebhook() {
  try {
    console.log('🧪 Testuji Jarvis endpoint s n8n webhookem...');
    console.log('📝 Jarvis nyní čeká na odpověď z n8n workflow');
    
    const testMessage = 'Test zpráva pro n8n webhook - ' + new Date().toISOString();
    
    // Zkusíme bez autentizace (některé endpointy to umožňují)
    let response = await fetch('http://localhost:3080/api/jarvis/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: testMessage,
        conversationId: null,
        parentMessageId: '00000000-0000-0000-0000-000000000000'
      })
    });

    if (response.ok) {
      console.log('✅ Jarvis endpoint s n8n webhookem funguje! (bez autentizace)');
      console.log('Odeslaná zpráva:', testMessage);
      console.log('Status:', response.status);
      
      const data = await response.text();
      console.log('Odpověď:', data);
    } else if (response.status === 401) {
      console.log('⚠️ Jarvis endpoint vyžaduje autentizaci (status: 401)');
      console.log('📝 Pro testování v aplikaci:');
      console.log('   1. Spusťte LibreChat aplikaci');
      console.log('   2. Přihlaste se');
      console.log('   3. Vyberte Jarvis model');
      console.log('   4. Odešlete zprávu');
      console.log('   5. Jarvis čeká na odpověď z n8n (max 30s)');
      console.log('   6. Zkontrolujte logy aplikace');
    } else {
      console.log('❌ Jarvis endpoint nefunguje');
      console.log('Status:', response.status);
      console.log('Text:', await response.text());
    }
  } catch (error) {
    console.log('❌ Chyba při testování:', error.message);
  }
}

// Test také přímého webhooku s simulací odpovědi
async function testDirectWebhook() {
  try {
    console.log('\n🔗 Testuji přímý webhook na n8n...');
    
    const webhookUrl = 'https://jarv1s.dekchecker.cloud/webhook/01853d92-764e-4432-a9fd-89432f9c0a4c';
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzMTFkNzVhMi1iODg0LTQ2ODMtYmUzNy02ZGU4NDE2ZTc1ZTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUzMTY0NDkyLCJleHAiOjE3NTU3MjcyMDB9.JetPd4s90kNwkfRTlSIQPCQzMDAWX4MUxK_6jXeHyHs';
    
    const testData = {
      message: 'Přímý test webhooku - ' + new Date().toISOString(),
      userId: 'test-user',
      conversationId: 'test-conversation',
      messageId: 'test-message',
      timestamp: new Date().toISOString(),
      source: 'direct-test'
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(testData)
    });

    if (response.ok) {
      console.log('✅ Přímý webhook na n8n funguje!');
      console.log('Status:', response.status);
      
      // Zkusíme přečíst odpověď z n8n
      try {
        const responseData = await response.json();
        if (responseData.output) {
          console.log('📤 n8n odpověď:', responseData.output);
        } else {
          console.log('📤 n8n odpověď (bez output):', responseData);
        }
      } catch (parseError) {
        console.log('📤 n8n odpověď (nelze parsovat JSON):', await response.text());
      }
    } else {
      console.log('❌ Přímý webhook na n8n nefunguje');
      console.log('Status:', response.status);
      console.log('Text:', await response.text());
    }
  } catch (error) {
    console.log('❌ Chyba při testování přímého webhooku:', error.message);
  }
}

// Spustit oba testy
async function runTests() {
  await testJarvisWebhook();
  await testDirectWebhook();
}

runTests(); 