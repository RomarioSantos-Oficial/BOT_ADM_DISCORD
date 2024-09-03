const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cargos')
        .setDescription('Atribuir ou remover cargos de membros.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('atribuir')
                .setDescription('Atribuir um cargo a um membro.')
                .addUserOption(option => option.setName('membro').setDescription('O membro para atribuir o cargo').setRequired(true))
                .addStringOption(option => option.setName('cargo').setDescription('O nome do cargo a atribuir').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remover')
                .setDescription('Remover um cargo de um membro.')
                .addUserOption(option => option.setName('membro').setDescription('O membro para remover o cargo').setRequired(true))
                .addStringOption(option => option.setName('cargo').setDescription('O nome do cargo a remover').setRequired(true))
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Você não tem permissão para usar este comando.', ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'atribuir') {
            const member = interaction.options.getMember('membro');
            const roleName = interaction.options.getString('cargo');
            let role = interaction.guild.roles.cache.find(r => r.name === roleName);

            if (!role) {
                await interaction.reply('O cargo não existe. Deseja criar um novo cargo? Responda com 1 para "Sim" ou 2 para "Não".');

                const filter = response => ['1', '2'].includes(response.content) && response.author.id === interaction.user.id;
                const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 });

                if (!collected.size) {
                    return interaction.followUp('Tempo esgotado. Tente novamente.');
                }

                const response = collected.first();

                if (response.content === '1') {
                    await interaction.followUp('Qual é o nome do novo cargo?');

                    const nameCollected = await interaction.channel.awaitMessages({ filter: response => response.author.id === interaction.user.id, max: 1, time: 30000 });

                    if (!nameCollected.size) {
                        return interaction.followUp('Tempo esgotado. Tente novamente.');
                    }

                    const newRoleName = nameCollected.first().content;

                    await interaction.followUp('Exibir membros dos cargos separadamente? Responda com 1 para "Sim" ou 2 para "Não".');

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

                    role = await interaction.guild.roles.create({
                        name: newRoleName,
                        color: '#0000FF',
                        reason: 'Cargo criado pelo comando automático do bot.',
                        hoist: hoist,
                        mentionable: mentionable
                    });

                    await interaction.followUp(`O cargo "${newRoleName}" foi criado com sucesso.`);
                } else {
                    return interaction.followUp('Cargo não existe.');
                }
            }

            await member.roles.add(role);
            return interaction.followUp(`O cargo "${roleName}" foi atribuído a ${member.displayName}.`);
        }

        if (subcommand === 'remover') {
            const member = interaction.options.getMember('membro');
            const roleName = interaction.options.getString('cargo');
            const role = interaction.guild.roles.cache.find(r => r.name === roleName);

            if (!role) {
                return interaction.reply('Cargo não encontrado.');
            }

            await member.roles.remove(role);
            return interaction.reply(`O cargo "${roleName}" foi removido de ${member.displayName}.`);
        }
    }
};
