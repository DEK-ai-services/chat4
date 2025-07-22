import React, { useState } from 'react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const SimpleJarvis: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;

    // Přidat uživatelskou zprávu
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulovat odpověď Jarvis
    setTimeout(() => {
      const jarvisMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'OK, jasné',
        isUser: false,
      };
      setMessages(prev => [...prev, jarvisMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '20px auto',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      height: '500px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '15px',
        borderBottom: '1px solid #eee',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px 8px 0 0'
      }}>
        <h2 style={{ margin: 0, color: '#333' }}>🤖 Jarvis</h2>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
          Jednoduchý chat - odpovídá "OK, jasné"
        </p>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: '#999',
            marginTop: '50px'
          }}>
            <p>Napište něco a Jarvis odpoví "OK, jasné"</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              justifyContent: message.isUser ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              maxWidth: '70%',
              padding: '10px 15px',
              borderRadius: '15px',
              backgroundColor: message.isUser ? '#007bff' : '#f1f1f1',
              color: message.isUser ? 'white' : '#333',
              wordWrap: 'break-word'
            }}>
              {message.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start'
          }}>
            <div style={{
              padding: '10px 15px',
              borderRadius: '15px',
              backgroundColor: '#f1f1f1',
              color: '#666'
            }}>
              <span>Jarvis píše</span>
              <span style={{ 
                animation: 'blink 1s infinite',
                opacity: 1
              }}>...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        padding: '15px',
        borderTop: '1px solid #eee',
        display: 'flex',
        gap: '10px'
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Napište zprávu..."
          disabled={isTyping}
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '14px'
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            opacity: (!input.trim() || isTyping) ? 0.5 : 1
          }}
        >
          Odeslat
        </button>
      </div>
    </div>
  );
};

export default SimpleJarvis; 