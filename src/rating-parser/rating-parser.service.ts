import { IRatingParser, RatingItem, RatingObject } from "./rating-parser.interface";

export class RatingParser implements IRatingParser {

    constructor(
        readonly rowSep: string,
        readonly targetDirections: string[],
        readonly directionSep: string,
        readonly targetSnils: string
    ) { }

    parse(value: string): RatingObject {
        let textArray = value.substring(2).split(this.rowSep);
        const result: RatingObject = {
            lastUpdated: textArray.slice(0, 3).join(' '),
            ratingItems: [],
        };
        let directionFound = false;
        let directionName = '';
        for (const textRow of textArray) {
            if (!directionFound) {
                for (const targetDirection of this.targetDirections) {
                    if (textRow == targetDirection) {
                        directionFound = true;
                        directionName = textRow;
                        break;
                    }
                }
            } else {
                const index = textRow.indexOf(this.targetSnils)
                if (index !== -1) {
                    const item: RatingItem = {
                        directionName: directionName,
                        position: textRow.slice(0, textRow.indexOf(this.targetSnils))
                    }
                    result.ratingItems.push(item);
                    directionFound = false;
                } else if (textRow == this.directionSep) {
                    directionFound = false;
                }
            }
        }

        return result;
    }
}
