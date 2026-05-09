const TelegramBot = require('node-telegram-bot-api')

const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion
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

    await bot.sendMessage(
        chatId,
        'Generating pairing code...'
    )

    try {

        // Latest WhatsApp version
        const { version } =
            await fetchLatestBaileysVersion()

        // Session storage
        const { state, saveCreds } =
            await useMultiFileAuthState(
                `sessions/${phone}`
            )

        // Create WhatsApp socket
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

        // Save session
        sock.ev.on(
            'creds.update',
            saveCreds
        )

        // Connection updates
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
                        '✅ PAIR SUCCESSFUL'
                    )

                    await bot.sendMessage(
                        chatId,
                        '✅ WhatsApp linked successfully!'
                    )
                }

                if (connection === 'close') {

                    console.log(
                        '❌ Connection Closed'
                    )

                    console.log(
                        lastDisconnect
                    )
                }
            }
        )

        // Wait before requesting code
        await new Promise(resolve =>
            setTimeout(resolve, 8000)
        )

        // Generate pairing code
        const code =
            await sock.requestPairingCode(
                phone
            )

        await bot.sendMessage(
            chatId,
            `🔗 Pairing Code:\n\n${code}\n\nEnter this code in WhatsApp now.`
        )

        // KEEP CONNECTION ALIVE
        await new Promise(resolve =>
            setTimeout(resolve, 120000)
        )

    } catch (err) {

        console.log(err)

        await bot.sendMessage(
            chatId,
            `Error:\n${err.message}`
        )
    }
})

console.log('🤖 Bot running...')
