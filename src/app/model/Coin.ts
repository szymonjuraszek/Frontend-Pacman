export class Coin {
    private _positionX: number;
    private _positionY: number;

    constructor(positionX: number, positionY: number) {
        this._positionX = positionX;
        this._positionY = positionY;
    }


    get positionX(): number {
        return this._positionX;
    }

    set positionX(value: number) {
        this._positionX = value;
    }

    get positionY(): number {
        return this._positionY;
    }

    set positionY(value: number) {
        this._positionY = value;
    }
}
