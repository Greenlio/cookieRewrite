const crypto = require('node:crypto')

module.exports = {
    name: 'guess',
    description: 'Guess a number between 1 and 100',
    execute(message, args, db) {
        // Generate a random number between 1 and 100
        //const randomNumber = Math.floor(Math.random() * 100) + 1;
        // Let's make it cryptographically sound instead.
        const randomNumber = crypto.randomInt(1, 100);

        // Get the current number of cookies for the correct guesser
        db.get('SELECT cookies FROM economy WHERE user_id = ?', [message.author.id], (err, row) => {
            if (err) {
                console.error(err);
                return message.reply('An error occurred while fetching your balance.');
            }
            const currentCookies = row ? row.cookies : 0;

            // Get the last person who guessed correctly
            db.get('SELECT user_id, cookies FROM last_guess', (err, lastGuessRow) => {
                if (err) {
                    console.error(err);
                    return message.reply('An error occurred while fetching the last guess.');
                }

                // Check if the guess is correct
                if (parseInt(args[0]) === randomNumber) {
                    if (lastGuessRow && lastGuessRow.user_id === message.author.id) {
                        // The current guesser was the last person to guess correctly
                        message.reply('You have already guessed correctly recently. Wait for someone else to guess correctly.');
                    } else {
                        // Update the cookies for the current guesser
                        const newCookies = currentCookies + 1;
                        db.run('UPDATE economy SET cookies = ? WHERE user_id = ?', [newCookies, message.author.id], (err) => {
                            if (err) {
                                console.error(err);
                                return message.reply('An error occurred while updating your balance.');
                            }

                            // Update the last guess
                            db.run('INSERT INTO last_guess (user_id, cookies) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET cookies = ?',
                                [message.author.id, newCookies, newCookies],
                                (err) => {
                                    if (err) {
                                        console.error(err);
                                        return message.reply('An error occurred while updating the last guess.');
                                    }

                                    message.reply(`Congratulations! You guessed the correct number (${randomNumber}). Your cookies count increased to ${newCookies}.`);
                                }
                            );
                        });
                    }
                } else {
                    message.reply(`Wrong guess! The number was ${randomNumber}. Try again.`);
                }
            });
        });
    },
};