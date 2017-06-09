const config = require('./config');
const moment = require('moment');
const fs = require('fs');

const TelegramBot = require('node-telegram-bot-api');
const Slack = require('node-slack');
const Discord = require('discord.io');

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

  if(config.exports && config.exports.submit && config.exports.submit.length > 0) {

    config.exports.submit.forEach( output => {

      switch(output.method) {
        case 'csv':
          const content = moment().unix() + ',submitted,' + msg.text.replace(/(\r\n|\n|\r)/gm, ' ') + '\n';
          fs.appendFileSync(output.path, content);
          break;

        case 'network_json':

          let network = {};
          if(fs.existsSync(output.path)) {
            network = JSON.parse(fs.readFileSync(output.path, 'utf8'));
          }

          if(!network.nodes)
            network.nodes = [];

          let text_node = network.nodes.find(node => node.label == msg.text);

          if(!text_node) {
            text_node = {
              id: network.nodes.length,
              label: msg.text,
              size: 1,
              x: Math.random(),
              y: Math.random(),
              actions: [{type: 'submitted', timestamp: moment().unix()}],
            };
            network.nodes.push(text_node);
          } else {
            text_node.actions.push({type: 'submitted', timestamp: moment().unix()});
          }

          fs.writeFileSync(output.path, JSON.stringify(network, null, 2));
          break;
      };

    });

  }

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

  if(config.exports && config.exports.broadcast && config.exports.broadcast.length > 0) {

    config.exports.broadcast.forEach( output => {

      switch(output.method) {
        case 'csv':
          const content = moment().unix() + ',' + action + ',' + text.replace(/(\r\n|\n|\r)/gm, ' ') + '\n';
          fs.appendFileSync(output.path, content);
          break;
        case 'network_json':

          let network = {};
          if(fs.existsSync(output.path)) {
            network = JSON.parse(fs.readFileSync(output.path, 'utf8'));
          }

          if(!network.nodes)
            network.nodes = [];

          let text_node = network.nodes.find(node => node.label == text);

          if(!text_node) {
            text_node = {
              id: network.nodes.length,
              label: text,
              size: 1,
              x: Math.random(),
              y: Math.random(),
              actions: [{type: action, timestamp: moment().unix()}],
            };
            network.nodes.push(text_node)
          } else {
            text_node.actions.push({type: action, timestamp: moment().unix()});
          }

          let broadcast_node = network.nodes.find(node => node.label == action);

          if(!broadcast_node) {
            broadcast_node = {
              id: network.nodes.length,
              label: action,
              x: Math.random(),
              y: Math.random(),
              size: 1,
              actions: [{type: action, timestamp: moment().unix()}],
            };
            network.nodes.push(broadcast_node)
          } else {
            broadcast_node.actions.push({type: action, timestamp: moment().unix()});
          }

          if(!network.edges)
            network.edges = [];

          let text_broadcast_edge = network.edges.find( edge => {
            return edge.source == text_node.id && edge.target == broadcast_node.id;
          });

          if(!text_broadcast_edge) {
            text_broadcast_edge = {
              id: network.edges.length,
              source: text_node.id,
              target: broadcast_node.id,
              timestamps: [moment().unix()],
            };
            network.edges.push(text_broadcast_edge);
          } else {
            text_broadcast_edge.timestamps.push(moment().unix());
          }

          fs.writeFileSync(output.path, JSON.stringify(network, null, 2));
          break;
      };

    });

  }

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
    case 'discord':
      const discord_bot = new Discord.Client({
        token: connector.token,
        autorun: true
      });

      discord_bot.on('ready', function() {
        discord_bot.sendMessage({
          to: connector.channel_id,
          message: text,
        });
      });
      break;
  }

  telegram_bot.answerCallbackQuery(callbackQuery.id);

});
