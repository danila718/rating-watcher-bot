export interface IRatingParser {
    rowSep: string;
    targetDirections: string[];
    directionSep: string;
    targetSnils: string;

    parse: (value: string) => RatingObject;
}

export interface RatingObject {
    lastUpdated: string;
    ratingItems: RatingItem[];
}

export interface RatingItem {
    directionName: string;
    position: string;
}
