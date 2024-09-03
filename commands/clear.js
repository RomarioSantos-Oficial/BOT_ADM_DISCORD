const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Limpa um número específico de mensagens no canal atual.')
        .addIntegerOption(option =>
            option.setName('quantidade')
                .setDescription('Número de mensagens a serem excluídas (1-100)')
                .setRequired(true)),
    async execute(interaction) {
        const amount = interaction.options.getInteger('quantidade');

        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: 'Você precisa inserir um número entre 1 e 100.', ephemeral: true });
        }

        await interaction.channel.bulkDelete(amount, true)
            .catch(error => {
                console.error(error);
                interaction.reply({ content: 'Houve um erro ao tentar limpar as mensagens neste canal.', ephemeral: true });
            });

        await interaction.reply({ content: `Limpadas ${amount} mensagens.`, ephemeral: true });
    },
};
