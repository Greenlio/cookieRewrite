module.exports = {
    name: 'ban',
    description: 'Ban a user from executing commands',
    execute(message, args, db) {
        // Check if the user has permission to use the command
        if (!message.member.roles.cache.some(role => role.name === 'Arbiter')) {
            return message.reply('You must have the "Arbiter" role to use this command.');
        }

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('You need to mention a user to ban.');
        }

        // Toggle ban status for the user
        const isBanned = isUserBanned(targetUser.id, db);
        if (isBanned) {
            unbanUser(targetUser.id, db);
            message.reply(`${targetUser} has been unbanned from executing commands.`);
        } else {
            banUser(targetUser.id, db);
            message.reply(`${targetUser} has been banned from executing commands.`);
        }
    },
    isBanned(userId, db) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM banned_users WHERE user_id = ?', [userId], (err, row) => {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                resolve(!!row); // Convert row to a boolean
            });
        });
    },
};

function banUser(userId, db) {
    db.run('INSERT INTO banned_users (user_id) VALUES (?)', [userId], err => {
        if (err) {
            console.error(err);
        }
    });
}

function unbanUser(userId, db) {
    db.run('DELETE FROM banned_users WHERE user_id = ?', [userId], err => {
        if (err) {
            console.error(err);
        }
    });
}

function isUserBanned(userId, db) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM banned_users WHERE user_id = ?', [userId], (err, row) => {
            if (err) {
                console.error(err);
                return reject(err);
            }
            resolve(!!row); // Convert row to a boolean
        });
    });
}