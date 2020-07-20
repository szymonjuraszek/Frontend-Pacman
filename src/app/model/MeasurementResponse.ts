export class MeasurementResponse {
    private _response_time_in_millis: number;
    private _response_timestamp: number;
    private _version_response: number;

    constructor(response_time_in_millis: number, response_timestamp: number, version_response: number) {
        this._response_time_in_millis = response_time_in_millis;
        this._response_timestamp = response_timestamp;
        this._version_response = version_response;
    }

    get response_time_in_millis(): number {
        return this._response_time_in_millis;
    }

    set response_time_in_millis(value: number) {
        this._response_time_in_millis = value;
    }

    get response_timestamp(): number {
        return this._response_timestamp;
    }

    set response_timestamp(value: number) {
        this._response_timestamp = value;
    }

    get version_response(): number {
        return this._version_response;
    }

    set version_response(value: number) {
        this._version_response = value;
    }
}
