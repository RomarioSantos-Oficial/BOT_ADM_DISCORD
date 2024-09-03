const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set')
        .setDescription('Criar ou apagar cargos no servidor.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('criar')
                .setDescription('Criar um novo cargo.')
                .addStringOption(option => option.setName('nome').setDescription('O nome do novo cargo').setRequired(true))
                .addStringOption(option => option.setName('cor').setDescription('A cor do novo cargo').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('apagar')
                .setDescription('Apagar um cargo existente.')
                .addStringOption(option => option.setName('nome').setDescription('O nome do cargo a apagar').setRequired(true))
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Você não tem permissão para usar este comando.', ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'criar') {
            const roleName = interaction.options.getString('nome');
            const roleColor = interaction.options.getString('cor');

            await interaction.reply('Exibir membros dos cargos separadamente? Responda com 1 para "Sim" ou 2 para "Não".');

            const hoistCollected = await interaction.channel.awaitMessages({ filter: response => ['1', '2'].includes(response.content) && response.author.id === interaction.user.id, max: 1, time: 30000 });

            if (!hoistCollected.size) {
                return interaction.followUp('Tempo esgotado. Tente novamente.');
            }

            const hoist = hoistCollected.first().content === '1';

            await interaction.followUp('Permitir mencionar este cargo? Responda com 1 para "Sim" ou 2 para "Não".');

            const mentionableCollected = await interaction.channel.awaitMessages({ filter: response => ['1', '2'].includes(response.content) && response.author.id === interaction.user.id, max: 1, time: 30000 });

            if (!mentionableCollected.size) {
                return interaction.followUp('Tempo esgotado. Tente novamente.');
            }

            const mentionable = mentionableCollected.first().content === '1';

            await interaction.guild.roles.create({
                name: roleName,
                color: roleColor,
                reason: 'Cargo criado pelo comando automático do bot.',
                hoist: hoist,
                mentionable: mentionable
            });

            return interaction.followUp(`O cargo "${roleName}" foi criado com sucesso.`);
        }

        if (subcommand === 'apagar') {
            const roleName = interaction.options.getString('nome');
            const role = interaction.guild.roles.cache.find(r => r.name === roleName);

            if (!role) {
                return interaction.reply('Cargo não encontrado.');
            }

            await role.delete('Cargo removido pelo comando automático do bot.');
            return interaction.reply(`O cargo "${roleName}" foi apagado com sucesso.`);
        }
    }
};
