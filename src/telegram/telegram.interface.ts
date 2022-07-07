import TelegramBot from "node-telegram-bot-api";

export interface ITelegram {
    token: string;
    bot: TelegramBot;
    bootstrap: () => void;
}
