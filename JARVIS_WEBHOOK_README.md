# Jarvis Webhook Integration

## Přehled
Jarvis endpoint byl rozšířen o integraci s n8n webhookem. Při každé zprávě uživatele se obsah zprávy odešle na n8n webhook a Jarvis čeká na odpověď, kterou zobrazí uživateli.

## 🆕 Nová funkcionalita
- **Čekání na odpověď:** Jarvis nyní čeká na odpověď z n8n workflow (max 30 sekund)
- **Zobrazení odpovědi:** Místo statické "OK, jasné" zobrazí odpověď z n8n
- **Fallback:** Pokud n8n neodpoví, použije se "OK, jasné" jako záložní odpověď

## Implementace

### Backend změny
- **Soubor:** `api/server/controllers/jarvis/chat.js`
- **Funkce:** Přidán axios request na n8n webhook s čekáním na odpověď
- **Data odesílaná na webhook:**
  ```json
  {
    "message": "text zprávy uživatele",
    "userId": "ID uživatele",
    "conversationId": "ID konverzace",
    "messageId": "ID zprávy",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "source": "jarvis"
  }
  ```
- **Očekávaná odpověď z n8n:**
  ```json
  {
    "output": "odpověď z n8n workflow"
  }
  ```

### Konfigurace
- **Webhook URL:** `https://jarv1s.dekchecker.cloud/webhook/01853d92-764e-4432-a9fd-89432f9c0a4c`
- **API Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzMTFkNzVhMi1iODg0LTQ2ODMtYmUzNy02ZGU4NDE2ZTc1ZTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUzMTY0NDkyLCJleHAiOjE3NTU3MjcyMDB9.JetPd4s90kNwkfRTlSIQPCQzMDAWX4MUxK_6jXeHyHs`
- **Timeout:** 30 sekund pro n8n odpověď

## Testování

### ⚠️ Důležité: Autentizace
Jarvis endpoint vyžaduje platnou autentizaci (JWT token). Přímé testování přes curl nebo Node.js selže s 401 Unauthorized.

### 1. Testování v LibreChat aplikaci (DOPORUČENO)
1. Spusťte LibreChat aplikaci
2. Přihlaste se do aplikace
3. Vyberte Jarvis model v nabídce modelů
4. Odešlete zprávu
5. Jarvis čeká na odpověď z n8n (max 30s)
6. Zobrazí se odpověď z n8n workflow
7. Zkontrolujte logy aplikace pro potvrzení webhook volání

### 2. Test přímého webhooku
```bash
node test-jarvis-webhook.js
```
Tento test ověří, že n8n webhook funguje a vrátí odpověď ve formátu `{"output": "..."}`.

### 3. HTML Test
Otevřete `test-jarvis-webhook.html` v prohlížeči:
- Test přímého webhooku funguje a zobrazuje n8n odpověď
- Test Jarvis endpointu selže kvůli autentizaci, ale ukáže správné instrukce

## Logy
- Úspěšné webhook volání: `[/jarvis/chat] Webhook sent successfully to n8n and received response`
- Přijatá odpověď z n8n: `[/jarvis/chat] Received response from n8n: [odpověď]`
- Chyba webhooku: `[/jarvis/chat] Webhook error: [chyba]`
- Chybějící output: `[/jarvis/chat] n8n response missing "output" field: [data]`

## Chování
- Jarvis odešle zprávu na n8n webhook
- Čeká na odpověď z n8n workflow (max 30 sekund)
- Pokud n8n odpoví s `{"output": "text"}`, zobrazí se tento text
- Pokud n8n neodpoví nebo odpoví bez `output` pole, použije se "OK, jasné"
- Pokud webhook selže, chat pokračuje s fallback odpovědí

## Bezpečnost
- API key je hardcoded v kódu (pro produkci by měl být v environment proměnných)
- Webhook používá Bearer token autentizaci
- Timeout zabraňuje dlouhému čekání na webhook odpověď
- Jarvis endpoint vyžaduje platnou JWT autentizaci

## Troubleshooting
1. **401 Unauthorized:** Jarvis endpoint vyžaduje autentizaci - použijte LibreChat aplikaci
2. **Timeout (30s):** n8n workflow trvá příliš dlouho - zkontrolujte workflow
3. **Chybějící output:** n8n nevrátil `{"output": "..."}` - zkontrolujte workflow
4. **Webhook nefunguje:** Zkontrolujte URL a API key
5. **CORS chyby:** Webhook by měl být dostupný z LibreChat serveru

## Ověření funkčnosti
✅ **n8n webhook funguje** - přímý test vrací status 200  
✅ **n8n vrací odpověď** - test zobrazuje `{"output": "..."}`  
⚠️ **Jarvis endpoint vyžaduje autentizaci** - testujte v LibreChat aplikaci

## Další kroky
- Přesunout konfiguraci do environment proměnných
- Přidat retry mechanismus pro failed webhook volání
- Implementovat webhook response handling
- Přidat monitoring webhook volání
- Přidat možnost konfigurace timeout hodnoty 