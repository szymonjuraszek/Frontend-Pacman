export class MeasurementResponse {
    private _id: string;
    private _response_time_in_millis: number;
    private _request_timestamp: number;
    private _version_response: number;
    private _size: number;

    constructor(id: string, response_time_in_millis: number, request_timestamp: number, version_response: number, size: number) {
        this._id = id;
        this._response_time_in_millis = response_time_in_millis;
        this._request_timestamp = request_timestamp;
        this._version_response = version_response;
        this._size = size;
    }

    get response_time_in_millis(): number {
        return this._response_time_in_millis;
    }

    set response_time_in_millis(value: number) {
        this._response_time_in_millis = value;
    }

    get request_timestamp(): number {
        return this._request_timestamp;
    }

    set request_timestamp(value: number) {
        this._request_timestamp = value;
    }

    get version_response(): number {
        return this._version_response;
    }

    set version_response(value: number) {
        this._version_response = value;
    }


    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get size(): number {
        return this._size;
    }

    set size(value: number) {
        this._size = value;
    }
}
