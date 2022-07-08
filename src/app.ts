import { Logger } from "tslog";
import { ITelegram } from "./telegram/telegram.interface";
import { Watcher } from "./watcher/watcher.service";
import fs from 'fs';
import { RatingObject } from "./rating-parser/rating-parser.interface";

export class App {
    constructor(
        readonly chatId: string,
        readonly telegram: ITelegram,
        readonly watcher: Watcher,
        readonly logger: Logger,
    ) { }

    bootstrap() {
        this.telegram.bootstrap();
        const event = this.watcher.watch();
        event.on('change', async (data: RatingObject, filePath: string) => {
            let msg = data.lastUpdated;
            for (const ratingItem of data.ratingItems) {
                msg += `\n${ratingItem.directionName}\nНомер в списке: ${ratingItem.position}`;
            }
            this.logger.info(msg);
            this.logger.info(filePath);
            this.sendDocument(filePath, (data.lastUpdated + '.pdf'), msg);
        });
    }

    async sendDocument(filePath: string, fileName: string, caption?: string) {
        // const stream = fs.createReadStream(filePath);
        const buffer = fs.readFileSync(filePath);
        this.telegram.bot.sendDocument(this.chatId, buffer, { caption: caption }, { filename: fileName, contentType: 'application/pdf' });
    }
}
