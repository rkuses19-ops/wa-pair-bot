const {
    default: makeWASocket
} = require('@whiskeysockets/baileys')

const P = require('pino')

async function start() {

    const sock = makeWASocket({
        logger: P({ level: 'silent' }),
        browser: ['Railway', 'Chrome', '1.0.0']
    })

    const phone = process.argv[2]

    const code = await sock.requestPairingCode(phone)

    console.log(code)

    process.exit()
}

start()
