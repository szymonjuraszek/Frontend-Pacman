import {Injectable} from '@angular/core';
import {MeasurementResponse} from "../model/MeasurementResponse";

@Injectable({
    providedIn: 'root'
})
export class MeasurementService {

    private measurements: Array<MeasurementResponse>

    constructor() {
        this.measurements = new Array<MeasurementResponse>();
    }

    addMeasurementResponse(nickname, responseTimeInMillis, responseTimestamp) {
        this.measurements.push(new MeasurementResponse(nickname,responseTimeInMillis,responseTimestamp))
    }

    getResponseMeasurements(): Array<MeasurementResponse> {
        return this.measurements;
    }

    clearCache() {
        this.measurements.length = 0;
    }
}
