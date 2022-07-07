import axios from "axios";
import fs from "fs";
import EventEmitter from "events";
import { Logger } from "tslog";

export class Watcher {
    private eTag?: string;
    private eventEmmitter: EventEmitter;
    private timer ?: NodeJS.Timer;

    constructor(
        private logger: Logger,
        readonly filePath: string,
        readonly targetUrl: string,
        readonly frequency: number,
    ) { 
        this.eventEmmitter = new EventEmitter();
    }

    watch(): EventEmitter {
        this.timer = setInterval(async () => {
            const newEtag = await this.getEtag();
            if (this.eTag == newEtag) {
                this.logger.info(`No updates, etag: ${this.eTag}`);
                return;
            }
            const lastUpdated = await this.updateDoument();
            this.eventEmmitter.emit('change', lastUpdated, this.filePath);
            this.eTag = newEtag;
            this.logger.info(`NEW ETAG: ${this.eTag}`);
        }, this.frequency);

        return this.eventEmmitter;
    }

    unWatch() {
        this.eventEmmitter.removeAllListeners('change');
        clearInterval(this.timer);
        console.log('clearing ', this.timer, this.eventEmmitter.listenerCount('change'));
    }

    private async updateDoument() {
        const response = await axios.request({
            url: this.targetUrl,
            method: 'GET',
            headers: {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "ru,en;q=0.9",
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"100\", \"Yandex\";v=\"22\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Linux\"",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
            },
            responseType: 'stream',
        });

        const fileStream = fs.createWriteStream(this.filePath);
        await response.data.pipe(fileStream);
        return response.headers['last-modified'] ?? undefined;
    }

    private async getEtag() {
        const res = await axios.head(this.targetUrl, {
            headers: {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "ru,en;q=0.9",
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"100\", \"Yandex\";v=\"22\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Linux\"",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
            },
        });
        return res.headers?.etag ?? undefined;
    }
}
