require('dotenv').config();

const fs = require('fs');
const path = require('path');
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  REST,
  Routes
} = require('discord.js');

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || '';
const RESULT_CHANNEL_ID = process.env.RESULT_CHANNEL_ID || '';
const ALLOWED_ROLE_ID = process.env.ALLOWED_ROLE_ID || '';
const ALLOW_EVERYONE = String(process.env.ALLOW_EVERYONE || 'false').toLowerCase() === 'true';

// === Public customization ===
const COMMUNITY_NAME = process.env.COMMUNITY_NAME || 'Hell Let Loose';
const EMBED_COLOR = process.env.EMBED_COLOR || '#E74C3C';
const FOOTER_TEXT = process.env.FOOTER_TEXT || `${COMMUNITY_NAME} • Match Result`;
const TITLE_FORMAT = process.env.TITLE_FORMAT || '{team1} vs. {team2}';
const DEFAULT_IMAGE_URL = process.env.DEFAULT_IMAGE_URL || '';
const IMAGE_MODE = (process.env.IMAGE_MODE || 'image').toLowerCase(); // image | thumbnail | none
const MATCH_TYPES = (process.env.MATCH_TYPES || 'Friendly,HBL,ECL')
  .split(',')
  .map(type => type.trim())
  .filter(Boolean)
  .slice(0, 25);

const LABEL_RESULT = process.env.LABEL_RESULT || 'Result';
const LABEL_DETAILS = process.env.LABEL_DETAILS || 'Details';
const LABEL_MAP = process.env.LABEL_MAP || 'Map';
const LABEL_LEAGUE = process.env.LABEL_LEAGUE || 'League';
const LABEL_DURATION = process.env.LABEL_DURATION || 'Dauer';
const LABEL_DATE = process.env.LABEL_DATE || 'Datum';
const AUTHOR_PREFIX = process.env.AUTHOR_PREFIX || '🎥';
const STATS_BUTTON_LABEL = process.env.STATS_BUTTON_LABEL || 'Statseite öffnen';
const STATS_BUTTON_EMOJI = process.env.STATS_BUTTON_EMOJI || '📊';
const STREAM_BUTTON_LABEL = process.env.STREAM_BUTTON_LABEL || 'Stream öffnen';
const STREAM_BUTTON_EMOJI = process.env.STREAM_BUTTON_EMOJI || '🎥';
const WIN_EMOJI = process.env.WIN_EMOJI || '🟢';
const LOSS_EMOJI = process.env.LOSS_EMOJI || '🔴';
const DRAW_EMOJI = process.env.DRAW_EMOJI || '🟡';
const UNKNOWN_RESULT_EMOJI = process.env.UNKNOWN_RESULT_EMOJI || '🔴';
const MATCH_HISTORY_FILE = process.env.MATCH_HISTORY_FILE || 'data/matches.json';
const SAVE_MATCH_HISTORY = String(process.env.SAVE_MATCH_HISTORY || 'true').toLowerCase() === 'true';
const COMMAND_DESCRIPTION = process.env.COMMAND_DESCRIPTION || 'Postet ein Hell Let Loose Match-Ergebnis als Discord Embed';

if (!DISCORD_TOKEN) {
  console.error('FEHLER: DISCORD_TOKEN fehlt in der .env!');
  process.exit(1);
}

if (MATCH_TYPES.length === 0) {
  MATCH_TYPES.push('Friendly');
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [
  new SlashCommandBuilder()
    .setName('matchresult')
    .setDescription(COMMAND_DESCRIPTION)
    .addStringOption(option =>
      option.setName('team1')
        .setDescription('Erstes Team, z.B. Oktogon')
        .setRequired(true)
        .setMaxLength(60)
    )
    .addStringOption(option =>
      option.setName('team2')
        .setDescription('Zweites Team, z.B. DIV33')
        .setRequired(true)
        .setMaxLength(60)
    )
    .addStringOption(option =>
      option.setName('stats_link')
        .setDescription('Direkter Link zur Statseite des Spiels')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('ergebnis')
        .setDescription('Ergebnis, z.B. 3:2')
        .setRequired(true)
        .setMaxLength(20)
    )
    .addStringOption(option =>
      option.setName('map')
        .setDescription('Gespielte Map, z.B. Foy')
        .setRequired(true)
        .setMaxLength(80)
    )
    .addStringOption(option =>
      option.setName('dauer')
        .setDescription('Spieldauer, z.B. 90 Minuten')
        .setRequired(true)
        .setMaxLength(40)
    )
    .addStringOption(option =>
      option.setName('liga')
        .setDescription('Match-Art / Liga')
        .setRequired(true)
        .addChoices(...MATCH_TYPES.map(type => ({ name: type, value: type })))
    )
    .addStringOption(option =>
      option.setName('datum')
        .setDescription('Datum, z.B. 01.06.2026. Leer = heute')
        .setRequired(false)
        .setMaxLength(40)
    )
    .addStringOption(option =>
      option.setName('streamer')
        .setDescription('Optionaler Streamer oben im Embed, z.B. KennyTheViking')
        .setRequired(false)
        .setMaxLength(80)
    )
    .addStringOption(option =>
      option.setName('stream_link')
        .setDescription('Optionaler Link zum Stream/VOD')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('image_url')
        .setDescription('Optionales Logo/Sponsorbild als URL. Leer = Standard aus .env')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('notiz')
        .setDescription('Optionale kurze Notiz, z.B. Grand Final, Scrim, Friendly')
        .setRequired(false)
        .setMaxLength(180)
    )
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Optionaler Zielchannel. Leer = Standardchannel oder aktueller Channel')
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
    )
].map(command => command.toJSON());

function parseColor(hex) {
  const cleaned = String(hex || '').replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return 0xE74C3C;
  return parseInt(cleaned, 16);
}

function isValidHttpUrl(value) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function truncate(value, max = 1024) {
  const str = String(value || '—');
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + '…';
}

function todayGerman() {
  return new Intl.DateTimeFormat('de-DE', {
    timeZone: 'Europe/Berlin',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date());
}

function resultEmoji(result) {
  const normalized = String(result || '').replace('-', ':').replace('–', ':');
  const parts = normalized.split(':').map(part => Number(part.trim()));
  if (parts.length >= 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
    if (parts[0] > parts[1]) return WIN_EMOJI;
    if (parts[0] < parts[1]) return LOSS_EMOJI;
    return DRAW_EMOJI;
  }
  return UNKNOWN_RESULT_EMOJI;
}

function hasPermission(interaction) {
  if (ALLOW_EVERYONE) return true;

  if (ALLOWED_ROLE_ID && interaction.member?.roles?.cache?.has(ALLOWED_ROLE_ID)) {
    return true;
  }

  if (interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) return true;
  if (interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) return true;

  return false;
}

function ensureHistoryFile() {
  const dir = path.dirname(MATCH_HISTORY_FILE);
  if (dir && !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(MATCH_HISTORY_FILE)) fs.writeFileSync(MATCH_HISTORY_FILE, '[]', 'utf8');
}

function saveMatchToHistory(entry) {
  try {
    ensureHistoryFile();
    const raw = fs.readFileSync(MATCH_HISTORY_FILE, 'utf8');
    const data = JSON.parse(raw || '[]');
    data.push(entry);
    fs.writeFileSync(MATCH_HISTORY_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Konnte Match-Historie nicht speichern:', error.message);
  }
}

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
  const appId = client.user.id;

  if (DISCORD_GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(appId, DISCORD_GUILD_ID), { body: commands });
    console.log(`✅ Slash Commands für Guild ${DISCORD_GUILD_ID} registriert.`);
  } else {
    await rest.put(Routes.applicationCommands(appId), { body: commands });
    console.log('✅ Globale Slash Commands registriert. Hinweis: Globale Commands können bis zu 1 Stunde brauchen.');
  }
}

function buildMatchEmbed(data, interactionUser) {
  const detailsText = [
    `**${LABEL_MAP}:** ${truncate(data.map, 80)}`,
    `**${LABEL_LEAGUE}:** ${truncate(data.league, 40)}`,
    `**${LABEL_DURATION}:** ${truncate(data.duration, 40)}`,
    `**${LABEL_DATE}:** ${truncate(data.date, 40)}`
  ].join('\n');

  const title = TITLE_FORMAT
    .replaceAll('{team1}', data.team1)
    .replaceAll('{team2}', data.team2)
    .replaceAll('{league}', data.league)
    .replaceAll('{result}', data.result);

  const descriptionParts = [];
  if (data.note) descriptionParts.push(`**${truncate(data.note, 180)}**`);
  descriptionParts.push(`**${LABEL_RESULT}**\n${resultEmoji(data.result)} **${truncate(data.result, 20)}**`);
  descriptionParts.push(`**${LABEL_DETAILS}**\n${detailsText}`);

  const embed = new EmbedBuilder()
    .setColor(parseColor(EMBED_COLOR))
    .setTitle(title)
    .setURL(data.statsLink)
    .setDescription(descriptionParts.join('\n\n'))
    .setFooter({ text: `${FOOTER_TEXT} • eingetragen von ${interactionUser.username}` })
    .setTimestamp();

  if (data.streamer) {
    embed.setAuthor({
      name: `${AUTHOR_PREFIX} ${data.streamer}`.trim(),
      url: data.streamLink || undefined
    });
  }

  const imageUrl = data.imageUrl || DEFAULT_IMAGE_URL;
  if (imageUrl && isValidHttpUrl(imageUrl) && IMAGE_MODE !== 'none') {
    if (IMAGE_MODE === 'thumbnail') {
      embed.setThumbnail(imageUrl);
    } else {
      embed.setImage(imageUrl);
    }
  }

  return embed;
}

function buildButtons(statsLink, streamLink) {
  const row = new ActionRowBuilder();

  row.addComponents(
    new ButtonBuilder()
      .setLabel(STATS_BUTTON_LABEL)
      .setStyle(ButtonStyle.Link)
      .setURL(statsLink)
      .setEmoji(STATS_BUTTON_EMOJI)
  );

  if (streamLink && isValidHttpUrl(streamLink)) {
    row.addComponents(
      new ButtonBuilder()
        .setLabel(STREAM_BUTTON_LABEL)
        .setStyle(ButtonStyle.Link)
        .setURL(streamLink)
        .setEmoji(STREAM_BUTTON_EMOJI)
    );
  }

  return [row];
}

client.once('ready', async () => {
  console.log(`✅ Bot ist online als ${client.user.tag}`);
  console.log(`📁 Match-Historie: ${MATCH_HISTORY_FILE}`);
  console.log(`🎨 Community: ${COMMUNITY_NAME}`);
  console.log(`🏷️ Match Types: ${MATCH_TYPES.join(', ')}`);

  try {
    await registerCommands();
  } catch (error) {
    console.error('❌ Fehler beim Registrieren der Slash Commands:', error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'matchresult') return;

  try {
    if (!hasPermission(interaction)) {
      await interaction.reply({
        content: '❌ Du hast keine Berechtigung, Match-Ergebnisse zu posten.',
        ephemeral: true
      });
      return;
    }

    const team1 = interaction.options.getString('team1', true);
    const team2 = interaction.options.getString('team2', true);
    const statsLink = interaction.options.getString('stats_link', true);
    const result = interaction.options.getString('ergebnis', true);
    const map = interaction.options.getString('map', true);
    const duration = interaction.options.getString('dauer', true);
    const league = interaction.options.getString('liga', true);
    const date = interaction.options.getString('datum') || todayGerman();
    const streamer = interaction.options.getString('streamer') || '';
    const streamLink = interaction.options.getString('stream_link') || '';
    const imageUrl = interaction.options.getString('image_url') || '';
    const note = interaction.options.getString('notiz') || '';
    const selectedChannel = interaction.options.getChannel('channel');

    if (!isValidHttpUrl(statsLink)) {
      await interaction.reply({ content: '❌ Der `stats_link` muss ein gültiger http/https-Link sein.', ephemeral: true });
      return;
    }

    if (streamLink && !isValidHttpUrl(streamLink)) {
      await interaction.reply({ content: '❌ Der `stream_link` muss ein gültiger http/https-Link sein.', ephemeral: true });
      return;
    }

    if (imageUrl && !isValidHttpUrl(imageUrl)) {
      await interaction.reply({ content: '❌ Die `image_url` muss ein gültiger http/https-Link sein.', ephemeral: true });
      return;
    }

    const targetChannel = selectedChannel
      || (RESULT_CHANNEL_ID ? await client.channels.fetch(RESULT_CHANNEL_ID).catch(() => null) : null)
      || interaction.channel;

    if (!targetChannel || !targetChannel.isTextBased()) {
      await interaction.reply({ content: '❌ Zielchannel nicht gefunden oder nicht beschreibbar.', ephemeral: true });
      return;
    }

    const matchData = {
      team1,
      team2,
      statsLink,
      result,
      map,
      duration,
      league,
      date,
      streamer,
      streamLink,
      imageUrl,
      note
    };

    const embed = buildMatchEmbed(matchData, interaction.user);
    const components = buildButtons(statsLink, streamLink);

    const sent = await targetChannel.send({ embeds: [embed], components });

    if (SAVE_MATCH_HISTORY) {
      saveMatchToHistory({
        ...matchData,
        guildId: interaction.guildId,
        channelId: targetChannel.id,
        messageId: sent.id,
        createdBy: {
          id: interaction.user.id,
          username: interaction.user.username
        },
        createdAt: new Date().toISOString()
      });
    }

    await interaction.reply({
      content: `✅ Match-Ergebnis wurde in ${targetChannel} gepostet.`,
      ephemeral: true
    });
  } catch (error) {
    console.error('Fehler bei /matchresult:', error);
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({ content: '❌ Fehler beim Posten des Match-Ergebnisses.', ephemeral: true }).catch(() => {});
    } else {
      await interaction.reply({ content: '❌ Fehler beim Posten des Match-Ergebnisses.', ephemeral: true }).catch(() => {});
    }
  }
});

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Bot wird heruntergefahren...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM empfangen, Bot wird beendet...');
  client.destroy();
  process.exit(0);
});

client.login(DISCORD_TOKEN).catch(error => {
  console.error('❌ Discord Login fehlgeschlagen:', error);
  process.exit(1);
});
