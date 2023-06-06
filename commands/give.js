module.exports = {
    name: 'give',
    description: 'Give cookies to another player',
    execute(message, args, db) {
        const userId = message.author.id;
        const targetUser = message.mentions.users.first();
        const amount = parseInt(args[1]);

        if (!targetUser || isNaN(amount) || amount <= 0) {
            return message.reply('Invalid command usage! Use `give @user amount`.');
        }

        db.serialize(() => {
            db.get('SELECT cookies FROM economy WHERE user_id = ?', [userId], (err, row) => {
                if (err) {
                    console.error(err);
                    return message.reply('An error occurred while fetching your balance.');
                }
                const senderBalance = row ? row.cookies : 0;
                if (senderBalance < amount) {
                    return message.reply('Insufficient balance to perform the transaction.');
                }

                db.run('UPDATE economy SET cookies = cookies - ? WHERE user_id = ?', [amount, userId], (err) => {
                    if (err) {
                        console.error(err);
                        return message.reply('An error occurred while deducting cookies from your balance.');
                    }

                    db.run('INSERT INTO economy (user_id, cookies) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET cookies = cookies + ?',
                        [targetUser.id, amount, amount],
                        (err) => {
                            if (err) {
                                console.error(err);
                                return message.reply('An error occurred while adding cookies to the recipient\'s balance.');
                            }

                            message.reply(`Successfully transferred ${amount} cookies to ${targetUser.username}`);
                        }
                    );
                });
            });
        });
    },
};