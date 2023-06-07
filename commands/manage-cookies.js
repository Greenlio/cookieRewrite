module.exports = {
    name: 'manage-cookies',
    description: 'Manage user cookies (Arbiter role only)',
    execute(message, args, db) {
      // Check if the user has the "Arbiter" role
      if (!message.member.roles.cache.some(role => role.name === 'Arbiter')) {
        return message.reply('You must have the "Arbiter" role to use this command.');
      }
  
      // Extract the command and arguments
      const command = args[0];
      const targetUser = message.mentions.users.first();
      const amount = parseInt(args[2]);
  
      // Check if the command and arguments are valid
      if (!command || !targetUser) {
        return message.reply('Invalid command usage! Use `manage-cookies [take|add|set] @user amount`.');
      }
  
      // Handle different commands
      switch (command.toLowerCase()) {
        case 'take':
          if (isNaN(amount) || amount <= 0) {
            return message.reply('Invalid amount! Please provide a positive number.');
          }
          takeCookies(targetUser.id, amount);
          break;
  
        case 'add':
          if (isNaN(amount) || amount <= 0) {
            return message.reply('Invalid amount! Please provide a positive number.');
          }
          addCookies(targetUser.id, amount);
          break;
  
        case 'set':
          if (isNaN(amount) || amount < 0) {
            return message.reply('Invalid amount! Please provide a non-negative number.');
          }
          setCookies(targetUser.id, amount);
          break;
  
        default:
          message.reply('Invalid command! Please use `take`, `add`, or `set`.');
          break;
      }
  
      // Helper function to take cookies from a user
      function takeCookies(userId, amount) {
        db.run('UPDATE economy SET cookies = cookies - ? WHERE user_id = ?', [amount, userId], err => {
          if (err) {
            console.error(err);
            return message.reply('An error occurred while deducting cookies from the user.');
          }
          message.reply(`Successfully took ${amount} cookies from the user.`);
        });
      }
  
      // Helper function to add cookies to a user
      function addCookies(userId, amount) {
        db.run('INSERT INTO economy (user_id, cookies) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET cookies = cookies + ?',
          [userId, amount, amount],
          err => {
            if (err) {
              console.error(err);
              return message.reply('An error occurred while adding cookies to the user.');
            }
            message.reply(`Successfully added ${amount} cookies to the user.`);
          }
        );
      }
  
      // Helper function to set the amnt of cookies for a user
      function setCookies(userId, amount) {
        db.run('INSERT INTO economy (user_id, cookies) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET cookies = ?',
          [userId, amount, amount],
          err => {
            if (err) {
              console.error(err);
              return message.reply('An error occurred while setting the number of cookies for the user.');
            }
            message.reply(`Successfully set the number of cookies to ${amount} for the user.`);
          }
        );
      }
    },
  };