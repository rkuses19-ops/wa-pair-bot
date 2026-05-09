const TelegramBot = require('node-telegram-bot-api')

const {
    default: makeWASocket
} = require('@whiskeysockets/baileys')

const P = require('pino')

const TOKEN = '8544016348:AAHRVh8HiInIrxTn31ZTmEjA8PTvhxFkPjc'

const bot = new TelegramBot(TOKEN, {
    polling: true
})

bot.onText(/\\/start/, async (msg) => {

    bot.sendMessage(
        msg.chat.id,
        'Send:\\n/pair 8801XXXXXXXXX'
    )
})

bot.onText(/\\/pair (.+)/, async (msg, match) => {

    const chatId = msg.chat.id

    const phone = match[1]

    bot.sendMessage(
        chatId,
        'Generating pairing code...'
    )

    try {

        const sock = makeWASocket({
            logger: P({ level: 'silent' }),
            browser: ['Railway', 'Chrome', '1.0.0']
        })

        const code =
            await sock.requestPairingCode(phone)

        bot.sendMessage(
            chatId,
            `🔗 Pairing Code:\\n\\n${code}`
        )

    } catch (err) {

        bot.sendMessage(
            chatId,
            `Error:\\n${err.message}`
        )
    }
})

console.log('Bot running...')
