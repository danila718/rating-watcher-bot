import { App } from './app';
import { Telegram } from './telegram/telegram.service';
import { Logger } from "tslog";
import 'dotenv/config';
import { Watcher } from './watcher/watcher.service';
import { sep } from 'path';


const token = process.env.TOKEN;
const chatId = process.env.CHAT_ID;
const url = process.env.URL;
const fileName = process.env.FILE_NAME;
const frequency = process.env.FREQUENCY ?? '60000';
if (!token || !chatId || !url || !fileName) {
    throw new Error('Token, chatId, url, fileName must be specified in .env file');
}

//initialize
const logger: Logger = new Logger();
const telegram: Telegram = new Telegram(logger, token);
const watcher: Watcher = new Watcher(logger, (__dirname + sep + fileName), url, Number.parseInt(frequency));
const app = new App(chatId, telegram, watcher, logger);

// starting
logger.info(`Token: ${token}, ChatId: ${chatId}, fileName: ${fileName}, url: ${url}`);
app.bootstrap();
