import TelegramBot from "node-telegram-bot-api";
import { Logger } from "tslog";
import { ITelegram } from "./telegram.interface";

export class Telegram implements ITelegram {
    readonly bot: TelegramBot;

    constructor(
        private logger: Logger,
        readonly token: string
    ) {
        this.bot = new TelegramBot(this.token, { filepath: false });
    }

    bootstrap() {
        // this.bot.on('message', (msg) => {
        //     this.logger.info(`Message was received`);
        //     this.bot.sendMessage(msg?.chat?.id, `Received your messag: ${msg?.text}`);
        // })

        // Enable graceful stop
        // process.once('SIGINT', () => this.bot.stopPolling());
        // process.once('SIGTERM', () => this.bot.stopPolling());
    }
}
