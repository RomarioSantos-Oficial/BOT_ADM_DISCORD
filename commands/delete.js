const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Apaga um cargo do servidor')
        .addStringOption(option =>
            option.setName('nome')
                .setDescription('Nome do cargo a ser apagado')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Você não tem permissão para usar este comando.', ephemeral: true });
        }

        const roleName = interaction.options.getString('nome');
        const role = interaction.guild.roles.cache.find(r => r.name === roleName);

        if (!role) {
            return interaction.reply({ content: 'Este cargo não existe.', ephemeral: true });
        }

        await role.delete('Cargo apagado pelo comando /delete.');
        await interaction.reply({ content: `Cargo ${roleName} apagado com sucesso.`, ephemeral: true });
    },
};
