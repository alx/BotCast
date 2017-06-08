const config = require('./config');
const moment = require('moment');
const fs = require('fs');

const TelegramBot = require('node-telegram-bot-api');
const Slack = require('node-slack');

const env = require('node-env-file');
env(__dirname + '/.env');

if(!process.env.TELEGRAM_TOKEN) {
  console.log('missing TELEGRAM_TOKEN in .env file');
  return null;
}
const telegram_bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {polling: true});

// helper to fetch group chat id to fill config.js
telegram_bot.onText(/\/get_id/, function getId(msg) {
  if(msg.chat.username != config.owner)
    return null;
  telegram_bot.sendMessage(msg.chat.id, msg.chat.id);
});

telegram_bot.on('message', (msg) => {

  if(msg.chat.type != 'private' || msg.chat.username != config.owner)
    return null;

  const chatId = msg.chat.id;

  fs.appendFileSync(config.backup_file, moment().unix() + ',submitted,' + msg.text + '\n');

  const opts = {
    reply_to_message_id: msg.message_id,
    reply_markup: JSON.stringify({
      inline_keyboard: [
        config.connectors.filter(connector => connector.row == 0),
        config.connectors.filter(connector => connector.row == 1),
        config.connectors.filter(connector => connector.row == 2),
      ]
    })
  };
  telegram_bot.sendMessage(msg.chat.id, 'broadcast', opts);
});

telegram_bot.on('callback_query', function onCallbackQuery(callbackQuery) {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  const text = msg.reply_to_message.text;

  fs.appendFileSync(config.backup_file, moment().unix() + ',' + action + ',' + text + '\n');

  const connector = config.connectors.find(connector => {
    return connector.callback_data == action;
  });

  switch(connector.broadcast_method) {
    case 'telegram':
      telegram_bot.sendMessage(connector.chat_id, text);
      break;
    case 'slack':
      const slack = new Slack(connector.web_hook);
      slack.send({
        text: text,
        channel: connector.channel,
        username: connector.bot_name
      });
      break;
  }

});
