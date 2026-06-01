# HLL Match Result Bot

Ein frei anpassbarer Discord Bot für **Hell Let Loose Match-Ergebnisse**.

Der Bot postet per Slash Command `/matchresult` ein sauberes Match-Result-Embed mit Teams, Ergebnis, Map, Match-Typ/Liga, Dauer, Datum, Statseiten-Link und optionalem Streamer/VOD-Link.

## Features

- `/matchresult` Slash Command
- Klickbarer Titel mit Statseiten-Link
- Button zur Statseite
- Optionaler Streamer oben im Embed
- Optionaler Stream-/VOD-Button
- Match-Typen frei anpassbar, z. B. `Friendly,HBL,ECL`
- Embed-Farbe, Texte, Labels, Buttons und Bild über `.env` anpassbar
- Optionales Sponsor-/Community-Bild als großes Bild oder Thumbnail
- PM2-ready für 24/7 Betrieb
- Lokale Match-Historie in `data/matches.json`

## Voraussetzungen

- Node.js 18 oder neuer
- npm
- PM2 optional, aber empfohlen
- Discord Bot mit Slash-Command-Rechten

## Installation

```bash
npm install
cp .env.example .env
nano .env
```

Danach die wichtigsten Werte in `.env` eintragen:

```env
DISCORD_TOKEN=dein_discord_bot_token
DISCORD_GUILD_ID=deine_discord_server_id
RESULT_CHANNEL_ID=optional_standard_channel_id
```

## Bot starten

### Lokal testen

```bash
npm start
```

### Mit PM2 starten

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
```

Logs ansehen:

```bash
pm2 logs hll-match-result-bot
```

Bot neustarten:

```bash
pm2 restart hll-match-result-bot
```

## Discord Bot einladen

Im Discord Developer Portal bei OAuth2 folgende Scopes wählen:

```text
bot
applications.commands
```

Benötigte Rechte:

```text
Send Messages
Embed Links
Use Slash Commands
Read Message History
```

## Slash Command

Beispiel:

```text
/matchresult
team1: Oktogon
team2: DIV33
stats_link: https://deine-statseite.de/match/123
ergebnis: 3:2
map: Foy
dauer: 90 Minuten
liga: Friendly
datum: 01.06.2026
streamer: SimplyFluffy
stream_link: https://twitch.tv/simplyfluffy
```

## Customizing

Alle wichtigen Einstellungen liegen in der `.env`.

### Branding

```env
COMMUNITY_NAME=Your Community
FOOTER_TEXT=Hell Let Loose • Match Result
EMBED_COLOR=#E74C3C
TITLE_FORMAT={team1} vs. {team2}
```

Mögliche Platzhalter für `TITLE_FORMAT`:

```text
{team1}
{team2}
{league}
{result}
```

Beispiele:

```env
TITLE_FORMAT={team1} vs. {team2}
TITLE_FORMAT={league} • {team1} vs. {team2}
TITLE_FORMAT={team1} {result} {team2}
```

### Match-Typen / League-Auswahl

```env
MATCH_TYPES=Friendly,HBL,ECL
```

Andere Communities können daraus z. B. machen:

```env
MATCH_TYPES=Friendly,Scrim,Tournament,League Cup,Training
```

Nach Änderung von `MATCH_TYPES` den Bot neustarten, damit Discord den Slash Command neu registriert:

```bash
pm2 restart hll-match-result-bot
```

### Bild / Sponsorbild

```env
DEFAULT_IMAGE_URL=
IMAGE_MODE=image
```

`IMAGE_MODE` kann sein:

```text
image      = großes Bild im Embed
thumbnail  = kleines Bild oben rechts
none       = kein Bild
```

Beispiel mit Sponsorbild:

```env
DEFAULT_IMAGE_URL=https://example.com/powered-by-sponsor.png
IMAGE_MODE=image
```

### Embed-Labels

```env
LABEL_RESULT=Result
LABEL_DETAILS=Details
LABEL_MAP=Map
LABEL_LEAGUE=League
LABEL_DURATION=Dauer
LABEL_DATE=Datum
```

Damit kann man den Bot auch komplett deutsch machen:

```env
LABEL_RESULT=Ergebnis
LABEL_DETAILS=Details
LABEL_MAP=Karte
LABEL_LEAGUE=Match-Art
LABEL_DURATION=Spieldauer
LABEL_DATE=Datum
```

### Buttons

```env
STATS_BUTTON_LABEL=Statseite öffnen
STATS_BUTTON_EMOJI=📊
STREAM_BUTTON_LABEL=Stream öffnen
STREAM_BUTTON_EMOJI=🎥
```

## Berechtigungen

Standardmäßig dürfen posten:

- Administratoren
- User mit „Nachrichten verwalten“
- User mit der Rolle aus `ALLOWED_ROLE_ID`, falls gesetzt

Jeder darf posten, wenn du setzt:

```env
ALLOW_EVERYONE=true
```
