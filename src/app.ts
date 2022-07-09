import { Logger } from "tslog";
import { ITelegram } from "./telegram/telegram.interface";
import { Watcher } from "./watcher/watcher.service";
import fs from 'fs';
import { RatingObject } from "./rating-parser/rating-parser.interface";

export class App {
    constructor(
        private firstSend: boolean,
        readonly chatId: string,
        readonly telegram: ITelegram,
        readonly watcher: Watcher,
        readonly logger: Logger,
    ) { }

    bootstrap() {
        const event = this.watcher.watch();
        event.on('change', async (data: RatingObject, filePath: string) => {
            if (!this.firstSend) {
                this.firstSend = true;
                return;
            }
            let msg = `<b>Обнаружено изменение в списках!</b>\n${data.lastUpdated}`;
            for (const ratingItem of data.ratingItems) {
                msg += `\n${ratingItem.directionName}\nНомер в списке: ${ratingItem.position}`;
            }
            this.logger.info('Sending changes');
            this.sendDocument(filePath, (data.lastUpdated + '.pdf'), msg);
        });
    }

    async sendDocument(filePath: string, fileName: string, caption?: string) {
        // const stream = fs.createReadStream(filePath);
        const buffer = fs.readFileSync(filePath);
        this.telegram.bot.sendDocument(this.chatId, buffer, { caption: caption, parse_mode: 'HTML' }, { filename: fileName, contentType: 'application/pdf' });
    }
}
