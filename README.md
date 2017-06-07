# BotCast - Telegram Broadcasting Bot

 ![Screenshot](screenshot.png)

**BotCast** is a Telegram bot that can be use to broadcast an input in various channels.

It helps if you spend a lot of time copy/pasting the same information in various groups/channels.

You can use this bot by sending it, for example, an interesting link. It'll answer your with an inline keyboard with the possible destination where you'd want to broadcast this interesting link.

It reduces multiple copy/paste in a simple inline keyboard.

It'll also save a csv file containing the history of the interaction with this bot.

## Setup

```
yarn install
cp config.js.sample config.js
```

You need to configure the bot before to run it.

```
yarn start
```

## Configuration

### Tokens

You must create a `.env` file and setup your tokens.

For example:

```
TELEGRAM_TOKEN=233429842:dwdwedkjewfowfeoeifjwfjwfe
SLACK_TOKEN=kdiru-23832749873492834-34889327498320234987283749893d329828
```

* To create a Telegram Token, [create a new bot](https://core.telegram.org/bots#6-botfather) with @BotFather
* To create a Slack Token, connect to your [Legacy Token](https://api.slack.com/custom-integrations/legacy-tokens) page

### config.js

`config.js` file must be filled with your informations.

* *config.owner* : your telegram login, you'll be the only one able to speak to your bot
* *config.backup_file* : path to your csv backup file

### config.connectors

You can setup broadcast connectors in `config.js`.

* *text* : text that will be displayed on the inline keyboard
* *callback_data* : unique id for this connector, it will be saved in the backup file
* *broadcast_method* : method used to broadcast this message, only `telegram` available at the moment
* *chat_id* : if `broadcast_method = telegram`, this variable is used to select the channel where the message will be sent
* *row* : row position on the inline keyboard

### Telegram chat_id

If you need to configure a Telegram `broadcast_method`, you will need the `chat_id` corresponding to the channel where you want to broadcast your information.

To get this id, invite your bot in the selected channel, then send this comment in the channel: `/get_id`

The bot will answer with the channel `chat_id` and you can fill this information in your `config.js` file.
