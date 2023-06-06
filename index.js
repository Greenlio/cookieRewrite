const Discord = require('discord.js');
const fs = require('fs');
const sqlite3 = require('sqlite3');
require('dotenv').config();

const client = new Discord.Client();
client.commands = new Discord.Collection();

const db = new sqlite3.Database('./cookies.db');

// Read the command files and load them into the command collection
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// Bot event: ready
client.on('ready', () => {
  console.log(`Bot is ready. Logged in as ${client.user.tag}`);
});

// Bot event: message
client.on('message', message => {
  // Ignore messages from bots
  if (message.author.bot) return;

  // Extract the command name and arguments
  const prefix = process.env.prefix; // Customize the prefix as per your preference
  if (!message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Execute the command
  const command = client.commands.get(commandName);
  if (!command) return;
  try {
    command.execute(message, args, db);
  } catch (error) {
    console.error(error);
    message.reply('An error occurred while executing the command.');
  }
});

// Start the bot
client.login(process.env.token);