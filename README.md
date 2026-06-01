# =====================================================
# HLL Match Result Bot - Example Configuration
# Kopiere diese Datei zu .env und trage deine Werte ein.
# NIEMALS die echte .env auf GitHub hochladen.
# =====================================================

# Discord Bot Token aus dem Discord Developer Portal
DISCORD_TOKEN=dein_discord_bot_token

# Discord Server/Guild ID.
# Empfohlen: Dann sind Slash Commands direkt sichtbar.
# Leer lassen = globale Commands, kann bis zu 1 Stunde dauern.
DISCORD_GUILD_ID=deine_discord_server_id

# Standard-Channel für Match-Ergebnisse.
# Leer lassen = Bot postet in den Channel, in dem /matchresult genutzt wurde.
RESULT_CHANNEL_ID=

# Optional: Nur diese Rolle darf /matchresult nutzen.
# Leer lassen = Admins und User mit "Nachrichten verwalten" dürfen posten.
ALLOWED_ROLE_ID=

# true = jeder darf /matchresult nutzen
ALLOW_EVERYONE=false

# =====================================================
# Community / Branding
# =====================================================

COMMUNITY_NAME=Your Community
FOOTER_TEXT=Hell Let Loose • Match Result
COMMAND_DESCRIPTION=Postet ein Hell Let Loose Match-Ergebnis als Discord Embed

# Embed-Farbe / linker Streifen
# Beispiele: Rot #E74C3C | Blau #3498DB | Grün #2ECC71 | Gold #F1C40F
EMBED_COLOR=#E74C3C

# Titel-Format
# Platzhalter: {team1}, {team2}, {league}, {result}
TITLE_FORMAT={team1} vs. {team2}

# Optionales Standardbild/Sponsorbild
# Leer lassen = kein Bild
# Beispiel Qonzer:
# DEFAULT_IMAGE_URL=https://cdn.discordapp.com/attachments/1188449415682326538/1509984124436217887/Powered_by_Qonzer.png
DEFAULT_IMAGE_URL=

# image = großes Bild im Embed
# thumbnail = kleines Bild oben rechts
# none = Bild deaktivieren
IMAGE_MODE=image

# =====================================================
# Match-Typen / League-Auswahl
# Wird als Auswahl bei /matchresult angezeigt.
# Nach Änderung Bot neustarten, damit Slash Command neu registriert wird.
# =====================================================

MATCH_TYPES=Friendly,HBL,ECL

# =====================================================
# Embed-Texte / Labels
# =====================================================

LABEL_RESULT=Result
LABEL_DETAILS=Details
LABEL_MAP=Map
LABEL_LEAGUE=League
LABEL_DURATION=Dauer
LABEL_DATE=Datum
AUTHOR_PREFIX=🎥

# Ergebnis-Emojis
WIN_EMOJI=🟢
LOSS_EMOJI=🔴
DRAW_EMOJI=🟡
UNKNOWN_RESULT_EMOJI=🔴

# Button-Texte
STATS_BUTTON_LABEL=Statseite öffnen
STATS_BUTTON_EMOJI=📊
STREAM_BUTTON_LABEL=Stream öffnen
STREAM_BUTTON_EMOJI=🎥

# =====================================================
# Lokale Match-Historie
# =====================================================

SAVE_MATCH_HISTORY=true
MATCH_HISTORY_FILE=data/matches.json
