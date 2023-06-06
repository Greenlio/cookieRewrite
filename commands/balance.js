module.exports = {
    name: 'balance',
    description: 'Check your balance',
    execute(message, args, db) {
        const userId = message.author.id;
        db.get('SELECT cookies FROM economy WHERE user_id = ?', [userId], (err, row) => {
            if (err) {
                console.error(err);
                return message.reply('An error occurred while fetching your balance.');
            }
            const balance = row ? row.cookies : 0;
            message.reply(`Your balance: ${balance} cookies`);
        });
    },
};