const TelegramBot = require('node-telegram-bot-api')

const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason
} = require('@whiskeysockets/baileys')

const P = require('pino')

const TOKEN =
'8544016348:AAHRVh8HiInIrxTn31ZTmEjA8PTvhxFkPjc'

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

        const { version } =
            await fetchLatestBaileysVersion()

        const { state, saveCreds } =
            await useMultiFileAuthState(
                `sessions/${phone}`
            )

        const sock = makeWASocket({

            version,

            auth: state,

            logger: P({
                level: 'silent'
            }),

            browser: [
                'Ubuntu',
                'Chrome',
                '20.0.04'
            ],

            printQRInTerminal: false,

            markOnlineOnConnect: false,

            syncFullHistory: false,

            connectTimeoutMs: 60000,

            defaultQueryTimeoutMs: 60000,

            keepAliveIntervalMs: 10000
        })

        sock.ev.on(
            'creds.update',
            saveCreds
        )

        sock.ev.on(
            'connection.update',
            async (update) => {

                const {
                    connection,
                    lastDisconnect
                } = update

                console.log(update)

                if (connection === 'open') {

                    console.log(
                        'WhatsApp Connected'
                    )
                }

                if (connection === 'close') {

                    const reason =
                        lastDisconnect?.error
                            ?.output?.statusCode

                    console.log(
                        'Connection Closed:',
                        reason
                    )
                }
            }
        )

        // wait before requesting pair code
        await new Promise(resolve =>
            setTimeout(resolve, 8000)
        )

        const code =
            await sock.requestPairingCode(
                phone
            )

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
