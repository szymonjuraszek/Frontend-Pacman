export class MonsterMeasurement {
    private _id: string;
    private _specific_second_of_communication: number;
    private _request_timestamp: number;
    private _response_time_in_millis: number;


    constructor(id: string, specific_second_of_communication: number, request_timestamp: number, response_time_in_millis: number) {
        this._id = id;
        this._specific_second_of_communication = specific_second_of_communication;
        this._request_timestamp = request_timestamp;
        this._response_time_in_millis = response_time_in_millis;
    }


    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get specific_second_of_communication(): number {
        return this._specific_second_of_communication;
    }

    set specific_second_of_communication(value: number) {
        this._specific_second_of_communication = value;
    }

    get request_timestamp(): number {
        return this._request_timestamp;
    }

    set request_timestamp(value: number) {
        this._request_timestamp = value;
    }


    get response_time_in_millis(): number {
        return this._response_time_in_millis;
    }

    set response_time_in_millis(value: number) {
        this._response_time_in_millis = value;
    }
}
