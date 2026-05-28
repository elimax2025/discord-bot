const {
    Client,
    GatewayIntentBits,
    PermissionsBitField,
} = require('discord.js');
// 🔥 HIER rein:
const userMessages = new Map();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const TOKEN = "MTUwODkxNDg1NjI0ODQ3NTc3OQ.GTiqZh.dqa8uPdZ83bcxIqtzFk2wzrZyLMJ_UWcaBqerg";
const joins = [];
const LOG_CHANNEL_ID = "1509568779267473628";
client.once('clientReady', () => {

    console.log(`${client.user.tag} ist online`);

});



// ======================
// COMMANDS
// ======================

client.on('messageCreate', async (message) => {

    if (message.author.bot) return;

    // ======================
    // ANTI SPAM (HIER EINBAUEN)
    // ======================

    const userId = message.author.id;
    const now = Date.now();

    if (!userMessages.has(userId)) {
        userMessages.set(userId, []);
    }

    const timestamps = userMessages.get(userId);

    timestamps.push(now);

    const filtered = timestamps.filter(time => now - time < 8000);

    userMessages.set(userId, filtered);

    if (filtered.length >= 5) {

        try {
            const member = await message.guild.members.fetch(userId);

            await member.timeout(10 * 60 * 1000, "Spamming");

            await message.author.send(
                "You got Timeoutet because Spamming"
            ).catch(() => {});

            userMessages.set(userId, []);

            console.log(`${message.author.tag} wurde getimeoutet wegen Spam`);

        } catch (err) {
            console.log("Timeout Fehler:", err);
        }
    }

    // ======================
    // DEINE COMMANDS
    // ======================

    if (message.content === '!ping') {
        message.reply('Pong!');
    }

    if (message.content === '!hello') {
        message.reply('Hallo 😄');
    }

    if (message.content.startsWith('!clear')) {
        if (!message.member.permissions.has(
            PermissionsBitField.Flags.ManageMessages
        )) {
            return message.reply('Keine Rechte!');
        }

        const args = message.content.split(' ');
        const amount = parseInt(args[1]);

        if (!amount) {
            return message.reply('Bitte Zahl eingeben!');
        }

        await message.channel.bulkDelete(amount);
        message.channel.send(`${amount} Nachrichten gelöscht`);
    }


    if (message.author.bot) return;

    // ======================
    // !ping
    // ======================

    if (message.content === '!ping') {

        message.reply('Pong!');
    }



    // ======================
    // !hello
    // ======================

    if (message.content === '!hello') {

        message.reply('Hallo 😄');
    }



    // ======================
    // !clear
    // ======================

    if (message.content.startsWith('!clear')) {

        // ADMIN CHECK
        if (!message.member.permissions.has(
            PermissionsBitField.Flags.ManageMessages
        )) {
            return message.reply(
                'Keine Rechte!'
            );
        }

        const args = message.content.split(' ');

        const amount = parseInt(args[1]);

        if (!amount) {
            return message.reply(
                'Bitte Zahl eingeben!'
            );
        }

        await message.channel.bulkDelete(amount);

        message.channel.send(
            `${amount} Nachrichten gelöscht`
        );
    }

});


// ======================
// ANTI RAID
// ======================

client.on('guildMemberAdd', async (member) => {

    joins.push(Date.now());

    // Nur Joins der letzten 10 Sekunden
    const recentJoins = joins.filter(
        time => Date.now() - time < 10000
    );

    // Wenn 5 Leute in 10 Sekunden joinen
    if (recentJoins.length >= 5) {

        const channel =
            member.guild.systemChannel;

        if (channel) {

            channel.send(
                ' RAID ERKANNT '
            );
        }

        console.log(
            'Raid erkannt!'
        );
    }
});
// ======================
// ANTI NUKE
// ======================

client.on('channelDelete', async (channel) => {

    try {

        // Audit Logs holen
        const logs =
            await channel.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.ChannelDelete
            });

        const entry =
            logs.entries.first();

        if (!entry) return;

        const executor =
            entry.executor;

        console.log(
            `${executor.tag} hat einen Channel gelöscht`
        );

        // Täter holen
        const member =
            await channel.guild.members.fetch(
                executor.id
            );

        // Adminrechte entfernen
        await member.roles.set([]);

        // Warnung senden
        const logChannel =
    channel.guild.channels.cache.get(
        LOG_CHANNEL_ID
    );

if (logChannel) {

    logChannel.send(
                `⚠️ ${executor.tag} wurde wegen Nuke-Versuch gesichert`
            );
        }

    } catch (err) {

        console.log(err);
    }
});
const { AuditLogEvent } = require('discord.js');

client.on('guildMemberAdd', async (member) => {
    try {

        // Nur Bots prüfen
        if (!member.user.bot) return;

        const guild = member.guild;

        // 1. Bot sofort kicken
        await member.kick("Unauthorized bot join");

        console.log(`Bot gekickt: ${member.user.tag}`);

        // 2. Audit Log holen (wer hat Bot eingeladen)
        const logs = await guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.BotAdd
        });

        const entry = logs.entries.first();

        if (!entry) return;

        const executor = entry.executor; // Person die Bot eingeladen hat

        console.log(`Bot wurde eingeladen von: ${executor.tag}`);

        const inviterMember = await guild.members.fetch(executor.id).catch(() => null);

        if (!inviterMember) return;

        // 3. Rollen entfernen
        await inviterMember.roles.set([]);

        // Log Channel (optional)
        const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);

        if (logChannel) {
            logChannel.send(
                `🚨 ${member.user.tag} Bot wurde gekickt.  
👤 Einlader: ${executor.tag} → Rollen entfernt`
            );
        }

    } catch (err) {
        console.log("Bot-Guard Fehler:", err);
    }
});
client.login(TOKEN);
