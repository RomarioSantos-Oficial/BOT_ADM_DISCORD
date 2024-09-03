const { Client, GatewayIntentBits, PermissionsBitField, Partials, Collection } = require('discord.js');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once('ready', () => {
    console.log(`Bot ${client.user.tag} está online!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Ocorreu um erro ao executar esse comando.', ephemeral: true });
    }
});

client.on('messageCreate', async message => {
    if (!message.guild || !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    if (message.content.startsWith('!atribuir')) {
        const args = message.content.split(' ').slice(1);
        const roleName = args[0];
        
        const role = message.guild.roles.cache.find(r => r.name === roleName);

        if (!role) {
            await message.channel.send('O cargo não existe. Deseja criar um novo cargo? Responda com 1 para "Sim" ou 2 para "Não".');

            const filter = response => ['1', '2'].includes(response.content);
            const collector = message.channel.createMessageCollector({ filter, time: 30000, max: 1 });

            collector.on('collect', async response => {
                if (response.content === '1') {
                    await message.channel.send('Qual é o nome do novo cargo?');
                    
                    const nameFilter = response => response.content.length > 0;
                    const nameCollector = message.channel.createMessageCollector({ filter: nameFilter, time: 30000, max: 1 });

                    nameCollector.on('collect', async nameResponse => {
                        const newRoleName = nameResponse.content;

                        await message.guild.roles.create({
                            name: newRoleName,
                            color: '#0000FF',
                            reason: 'Cargo criado pelo comando automático do bot.',
                            hoist: false,
                            mentionable: false
                        });

                        await message.channel.send(`O cargo "${newRoleName}" foi criado com sucesso.`);
                    });
                } else {
                    await message.channel.send('Cargo não existe. Deseja criar um novo cargo? Responda com 1 para "Sim" ou 2 para "Não".');
                }
            });
        } else {
            const user = message.mentions.members.first();
            if (user) {
                await user.roles.add(role);
                await message.channel.send(`O cargo "${roleName}" foi atribuído a ${user.displayName}.`);
            } else {
                await message.channel.send('Mencione um usuário para atribuir o cargo.');
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN);


