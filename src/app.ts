import { Logger } from "tslog";
import { ITelegram } from "./telegram/telegram.interface";
import { Watcher } from "./watcher/watcher.service";
import fs from 'fs';
import { RatingObject } from "./rating-parser/rating-parser.interface";

export class App {
    private lastSendTime: number = 0;

    constructor(
        private firstSend: boolean,
        private maxDelayTime: number,
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
                this.lastSendTime = Date.now();
                return;
            }
            let msg = `<b>Обнаружено изменение в списках!</b>\n${data.lastUpdated}`;
            for (const ratingItem of data.ratingItems) {
                msg += `\n${ratingItem.directionName}\nНомер в списке: ${ratingItem.position}`;
            }
            this.logger.info('Sending Changes');
            await this.sendDocument(filePath, (data.lastUpdated + '.pdf'), msg);
            this.lastSendTime = Date.now();
        });
        event.on('not_change', async (data: RatingObject, filePath: string) => {
            if (!this.lastSendTime || (Date.now() - this.lastSendTime) < this.maxDelayTime) {
                return;
            }
            let msg = `<b>Изменения в списках не обнаружены в течении ${Math.round(this.maxDelayTime / 3600000 * 100) / 100} часов</b>`;
            for (const ratingItem of data.ratingItems) {
                msg += `\n${ratingItem.directionName}\nНомер в списке: ${ratingItem.position}`;
            }
            this.logger.info('Sending NOT Change');
            await this.sendDocument(filePath, (data.lastUpdated + '.pdf'), msg);
            this.lastSendTime = Date.now();
        });
    }

    async sendDocument(filePath: string, fileName: string, caption?: string) {
        // const stream = fs.createReadStream(filePath);
        const buffer = fs.readFileSync(filePath);
        this.telegram.bot.sendDocument(this.chatId, buffer, { caption: caption, parse_mode: 'HTML' }, { filename: fileName, contentType: 'application/pdf' });
    }
}
