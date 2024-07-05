const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

const TOKEN = 'BOT TOKEN';

const profileChannelId = '1255774978322993213';
const bannerChannelId = '1255775091048845312';

// Arrays to track recently sent profile pictures and banners
let recentlySentProfiles = [];
let recentlySentBanners = [];

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    setInterval(async () => {
        try {
            client.guilds.cache.forEach(async (guild) => {
                const members = await guild.members.fetch();
                const nonBotMembers = members.filter(m => !m.user.bot);

                if (nonBotMembers.size === 0) {
                    return; // Skip guild if no non-bot members
                }

                // Convert nonBotMembers to an array
                const nonBotMembersArray = Array.from(nonBotMembers.values());

                // Shuffle and filter out recently sent profiles
                let shuffledMembers = shuffleArray(nonBotMembersArray).filter(member => !recentlySentProfiles.includes(member.user.id));

                // Select a random member from shuffled array
                const randomMember = shuffledMembers[Math.floor(Math.random() * shuffledMembers.length)];
                if (!randomMember) {
                    console.error('No valid random member found.');
                    return;
                }
                await randomMember.fetch();

                // Fetch and send profile picture
                const profilePictureUrl = randomMember.user.displayAvatarURL({ format: 'png', dynamic: true });

                const profileEmbed = new EmbedBuilder()
                    .setTitle('Random Profile Picture')
                    .setImage(profilePictureUrl);
                const profileChannel = client.channels.cache.get(profileChannelId);
                await profileChannel.send({ embeds: [profileEmbed] });

                // Add sent profile to recently sent list
                recentlySentProfiles.push(randomMember.user.id);
                if (recentlySentProfiles.length > 10) {
                    recentlySentProfiles.shift(); // Keep list size manageable
                }

                // Fetch and send banner if available and not recently sent
                if (randomMember.user.banner && !recentlySentBanners.includes(randomMember.user.banner)) {
                    const bannerUrl = randomMember.user.bannerURL({ format: 'png', dynamic: true, size: 1024 });

                    const bannerEmbed = new EmbedBuilder()
                        .setTitle('Random Banner')
                        .setImage(bannerUrl);
                    const bannerChannel = client.channels.cache.get(bannerChannelId);
                    await bannerChannel.send({ embeds: [bannerEmbed] });

                    // Add sent banner to recently sent list
                    recentlySentBanners.push(randomMember.user.banner);
                    if (recentlySentBanners.length > 10) {
                        recentlySentBanners.shift(); // Keep list size manageable
                    }
                }
            });

        } catch (error) {
            console.error('An error occurred:', error);
        }
    }, 5000); // Run every 5 seconds
});

client.login(TOKEN);

// Function to shuffle array randomly
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
