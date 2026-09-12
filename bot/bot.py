"""Telegram bot that opens the Tiger Runner Mini App."""

from __future__ import annotations

import asyncio
import logging
import os
import sys

from aiogram import Bot, Dispatcher, F
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import CommandStart
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    MenuButtonWebApp,
    Message,
    ReplyKeyboardMarkup,
    WebAppInfo,
)
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
log = logging.getLogger("tiger-runner-bot")

BOT_TOKEN = os.getenv("BOT_TOKEN", "").strip()
WEBAPP_URL = os.getenv("WEBAPP_URL", "").strip().rstrip("/")


def webapp_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🎮 Play · Грати",
                    web_app=WebAppInfo(url=WEBAPP_URL),
                )
            ]
        ]
    )


def reply_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="🎮 Play / Грати", web_app=WebAppInfo(url=WEBAPP_URL))]
        ],
        resize_keyboard=True,
    )


async def on_startup(bot: Bot) -> None:
    await bot.set_chat_menu_button(
        menu_button=MenuButtonWebApp(
            text="Play",
            web_app=WebAppInfo(url=WEBAPP_URL),
        )
    )
    me = await bot.get_me()
    log.info("Bot @%s ready. WebApp: %s", me.username, WEBAPP_URL)


async def cmd_start(message: Message) -> None:
    await message.answer(
        "🐅 <b>Tiger Runner</b>\n"
        "Endless 3-lane runner — swipe, jump, collect альтушки, "
        "don’t get caught by Kozatska Rada.\n\n"
        "Натисни <b>Грати</b> / tap <b>Play</b> to open the Mini App.",
        reply_markup=webapp_keyboard(),
    )
    await message.answer(
        "You can also use the button below anytime.",
        reply_markup=reply_keyboard(),
    )


async def main() -> None:
    if not BOT_TOKEN or BOT_TOKEN.startswith("123456789"):
        log.error("Set BOT_TOKEN in .env (see .env.example)")
        sys.exit(1)
    if not WEBAPP_URL or "your-domain" in WEBAPP_URL:
        log.error("Set WEBAPP_URL to a public HTTPS origin (see .env.example)")
        sys.exit(1)
    if not WEBAPP_URL.startswith("https://"):
        log.error("WEBAPP_URL must be HTTPS for Telegram WebApps")
        sys.exit(1)

    bot = Bot(
        token=BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    dp = Dispatcher()
    dp.startup.register(on_startup)
    dp.message.register(cmd_start, CommandStart())
    dp.message.register(cmd_start, F.text.in_({"/play", "/грати"}))

    log.info("Starting polling…")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
