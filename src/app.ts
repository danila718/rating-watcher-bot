import { Logger } from "tslog";
import { ITelegram } from "./telegram/telegram.interface";
import { Watcher } from "./watcher/watcher.service";
import moment from "moment";
import fs from 'fs';
import "moment/locale/ru";

export class App {
    constructor(
        readonly chatId: string,
        readonly telegram: ITelegram,
        readonly watcher: Watcher,
        readonly logger: Logger,
    ) {
        moment.locale('ru');
    }

    bootstrap() {
        // this.telegram.bootstrap();
        const event = this.watcher.watch();
        event.on('change', async(data: string, filePath: string) => {
            const day = moment(data);
            if (day.isValid()) {
                const msg = `Последнее обновление документа: ${moment(data).format("dddd, DD.MM.YYYY, HH:mm:ss")}`;
                this.logger.info(msg);
                this.logger.info(filePath);
                this.sendDocument(filePath, (moment(data).format('DD-MM-YYYY_HH-mm-ss') + '.pdf'), msg);
            }
        });
    }

    async sendDocument(filePath: string, fileName: string, caption?: string) {
        // const stream = fs.createReadStream(filePath);
        const buffer = fs.readFileSync(filePath);
        this.telegram.bot.sendDocument(this.chatId, buffer, { caption: caption }, { filename: fileName, contentType: 'application/pdf' });
    }
}
