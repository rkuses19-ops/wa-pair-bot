import subprocess

from telegram import Update
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    ContextTypes
)

BOT_TOKEN = "8544016348:AAHRVh8HiInIrxTn31ZTmEjA8PTvhxFkPjc"


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):

    await update.message.reply_text(
        "Send:\\n/pair 8801XXXXXXXXX"
    )


async def pair(update: Update, context: ContextTypes.DEFAULT_TYPE):

    if len(context.args) == 0:
        await update.message.reply_text(
            "Usage:\\n/pair 8801XXXXXXXXX"
        )
        return

    phone = context.args[0]

    await update.message.reply_text(
        "Generating pairing code..."
    )

    try:

        result = subprocess.check_output(
            ["node", "pair.js", phone],
            text=True
        )

        code = result.strip()

        await update.message.reply_text(
            f"🔗 Pairing Code:\\n\\n{code}"
        )

    except Exception as e:

        await update.message.reply_text(
            f"Error:\\n{str(e)}"
        )


app = ApplicationBuilder().token(BOT_TOKEN).build()

app.add_handler(CommandHandler("start", start))
app.add_handler(CommandHandler("pair", pair))

print("Bot running...")

app.run_polling()
