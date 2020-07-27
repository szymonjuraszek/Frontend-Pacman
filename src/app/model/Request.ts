export class Request {
    private _id: number;
    private _x: number;
    private _y: number;

    constructor(id: number, x: number, y: number) {
        this._id = id;
        this._x = x;
        this._y = y;
    }


    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
    }
}
