const fetch = require('node-fetch');

async function testJarvis() {
  try {
    console.log('🧪 Testuji Jarvis endpoint...');
    
    const response = await fetch('http://localhost:3080/api/jarvis/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        text: 'Ahoj Jarvis!',
        conversationId: null,
        parentMessageId: '00000000-0000-0000-0000-000000000000'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Jarvis endpoint funguje!');
      console.log('Odpověď:', data);
    } else {
      console.log('❌ Jarvis endpoint nefunguje');
      console.log('Status:', response.status);
      console.log('Text:', await response.text());
    }
  } catch (error) {
    console.log('❌ Chyba při testování:', error.message);
  }
}

testJarvis(); 