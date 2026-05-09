const TelegramBot = require('node-telegram-bot-api')

const {
    default: makeWASocket,
    useMultiFileAuthState
} = require('@whiskeysockets/baileys')

const P = require('pino')

const TOKEN = '8544016348:AAHRVh8HiInIrxTn31ZTmEjA8PTvhxFkPjc'

const bot = new TelegramBot(TOKEN, {
    polling: true
})

bot.onText(/\/start/, async (msg) => {

    bot.sendMessage(
        msg.chat.id,
        'Send:\n/pair 8801XXXXXXXXX'
    )
})

bot.onText(/\/pair (.+)/, async (msg, match) => {

    const chatId = msg.chat.id

    const phone = match[1]

    bot.sendMessage(
        chatId,
        'Generating pairing code...'
    )

    try {

        // Create auth state
        const { state, saveCreds } =
            await useMultiFileAuthState(
                `sessions/${phone}`
            )

        // Create socket
        const sock = makeWASocket({
            auth: state,
            logger: P({ level: 'silent' }),
            browser: ['Ubuntu', 'Chrome', '20.0.04'],
            printQRInTerminal: false,
            markOnlineOnConnect: false,
            syncFullHistory: false
        })

        // Save credentials
        sock.ev.on('creds.update', saveCreds)

        // Connection logs
        sock.ev.on('connection.update', (update) => {

            const { connection } = update

            console.log(update)

            if (connection === 'close') {

                console.log('Connection Closed')
            }

            if (connection === 'open') {

                console.log('Connected Successfully')
            }
        })

        // Wait before generating pairing code
        await new Promise(resolve =>
            setTimeout(resolve, 5000)
        )

        // Generate pairing code
        const code =
            await sock.requestPairingCode(phone)

        bot.sendMessage(
            chatId,
            `🔗 Pairing Code:\n\n${code}`
        )

    } catch (err) {

        console.log(err)

        bot.sendMessage(
            chatId,
            `Error:\n${err.message}`
        )
    }
})

console.log('Bot running...')
