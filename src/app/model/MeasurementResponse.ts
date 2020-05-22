export class MeasurementResponse {
    private _nickname: string;
    private _responseTimeInMillis: number;
    private _responseTimestamp: number;

    constructor(nickname, responseTimeInMillis, responseTimestamp) {
        this._nickname = nickname;
        this._responseTimeInMillis = responseTimeInMillis;
        this._responseTimestamp = responseTimestamp;
    }


    get nickname(): string {
        return this._nickname;
    }

    set nickname(value: string) {
        this._nickname = value;
    }

    get responseTimeInMillis(): number {
        return this._responseTimeInMillis;
    }

    set responseTimeInMillis(value: number) {
        this._responseTimeInMillis = value;
    }

    get responseTimestamp(): number {
        return this._responseTimestamp;
    }

    set responseTimestamp(value: number) {
        this._responseTimestamp = value;
    }
}
