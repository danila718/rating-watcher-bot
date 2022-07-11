import { App } from './app';
import { Telegram } from './telegram/telegram.service';
import { Logger } from "tslog";
import 'dotenv/config';
import { Watcher } from './watcher/watcher.service';
import { sep } from 'path';
import { RatingParser } from './rating-parser/rating-parser.service';


const token = process.env.TOKEN;
const chatId = process.env.CHAT_ID;
const url = process.env.URL;
const fileName = process.env.FILE_NAME;
const frequency = process.env.FREQUENCY ?? '60000';
const directions = process.env.TARGET_DIRECTIONS ? JSON.parse(process.env.TARGET_DIRECTIONS) : undefined;
const snils = process.env.TARGET_SNILS ?? '123';
const firstSend = (process.env.FIRST_SEND ?? '0') === '1' ? true : false;
const maxDelay = process.env.MAX_DELAY ?? '10800000';
if (!token || !chatId || !url || !fileName) {
    throw new Error('Token, chatId, url, fileName must be specified in .env file');
}

//initialize
const logger: Logger = new Logger();
const telegram: Telegram = new Telegram(logger, token);
const parser: RatingParser = new RatingParser(
    '\n',
    directions,
    'No',
    snils, 
);
const watcher: Watcher = new Watcher(logger, parser, (__dirname + sep + fileName), url, Number.parseInt(frequency));
const app = new App(firstSend,  Number.parseInt(maxDelay), chatId, telegram, watcher, logger);

// starting
logger.info(`Token: ${token}, ChatId: ${chatId}, fileName: ${fileName}, url: ${url}`);
app.bootstrap();
