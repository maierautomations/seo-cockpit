# Google Search Console API — Setup-Anleitung

## Voraussetzungen

- Google-Konto mit Zugriff auf mindestens eine Search Console Property
- Node.js und das SEO Cockpit Projekt lokal eingerichtet

## Schritt 1: Google Cloud Projekt erstellen

1. Öffne die [Google Cloud Console](https://console.cloud.google.com/)
2. Klicke oben auf das Projekt-Dropdown → **Neues Projekt**
3. Name: z.B. "SEO Cockpit" → **Erstellen**
4. Warte bis das Projekt erstellt ist und wechsle dorthin

## Schritt 2: Search Console API aktivieren

1. Gehe zu **APIs & Dienste** → **Bibliothek**
2. Suche nach "Google Search Console API"
3. Klicke auf **Google Search Console API** → **Aktivieren**

## Schritt 3: OAuth-Zustimmungsbildschirm konfigurieren

1. Gehe zu **APIs & Dienste** → **OAuth-Zustimmungsbildschirm**
2. Wähle **Extern** → **Erstellen**
3. Fülle aus:
   - App-Name: "SEO Cockpit"
   - Support-E-Mail: deine E-Mail
   - Autorisierte Domains: (leer lassen für Entwicklung)
   - E-Mail-Adresse des Entwicklers: deine E-Mail
4. **Speichern und fortfahren**
5. Bei **Bereiche**: Klicke **Bereiche hinzufügen oder entfernen**
   - Suche und füge hinzu: `https://www.googleapis.com/auth/webmasters.readonly`
   - **Aktualisieren** → **Speichern und fortfahren**
6. Bei **Testnutzer**: Füge deine Google-E-Mail-Adresse hinzu → **Speichern und fortfahren**
7. **Zurück zum Dashboard**

> **Hinweis:** Im Test-Modus können nur die hinzugefügten Testnutzer sich anmelden.
> Für Produktionsbetrieb muss die App bei Google zur Überprüfung eingereicht werden.

## Schritt 4: OAuth 2.0 Credentials erstellen

1. Gehe zu **APIs & Dienste** → **Anmeldedaten**
2. Klicke **Anmeldedaten erstellen** → **OAuth-Client-ID**
3. Anwendungstyp: **Webanwendung**
4. Name: "SEO Cockpit Web Client"
5. **Autorisierte Weiterleitungs-URIs** hinzufügen:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   > Für Produktion zusätzlich: `https://deine-domain.com/api/auth/callback/google`
6. **Erstellen** klicken
7. **Client-ID** und **Client-Secret** kopieren

## Schritt 5: Umgebungsvariablen konfigurieren

Erstelle oder ergänze die Datei `.env.local` im Projektverzeichnis:

```env
# Google OAuth (für GSC API)
GOOGLE_CLIENT_ID=deine-client-id-hier
GOOGLE_CLIENT_SECRET=dein-client-secret-hier

# NextAuth Session-Verschlüsselung
AUTH_SECRET=ein-zufaelliger-string-min-32-zeichen
```

### AUTH_SECRET generieren

```bash
npx auth secret
```

Oder manuell: Verwende einen zufälligen String mit mindestens 32 Zeichen.

## Schritt 6: Testen

1. Starte den Dev-Server: `npm run dev`
2. Öffne `http://localhost:3000`
3. Klicke "Mit Google Search Console verbinden"
4. Melde dich mit einem Testnutzer-Konto an
5. Wähle eine Property und lade Daten

## Fehlerbehebung

### "Zugriff blockiert: Diese App wurde nicht überprüft"
- Klicke auf **Erweitert** → **Weiter zu SEO Cockpit (unsicher)**
- Das ist normal im Test-Modus

### "Keine Properties gefunden"
- Stelle sicher, dass dein Google-Konto als Inhaber oder Nutzer in der [Google Search Console](https://search.google.com/search-console) hinterlegt ist

### "redirect_uri_mismatch"
- Prüfe ob die Weiterleitungs-URI in den Google Cloud Credentials exakt übereinstimmt:
  `http://localhost:3000/api/auth/callback/google`
- Beachte: `http` vs `https` und trailing slashes sind relevant

### "Sitzung abgelaufen"
- Der Refresh Token ist ungültig geworden
- Lösung: Abmelden und erneut verbinden
