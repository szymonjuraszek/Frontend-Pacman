import {Injectable} from '@angular/core';
import {MeasurementResponse} from "../model/MeasurementResponse";

@Injectable({
    providedIn: 'root'
})
export class MeasurementService {

    private readonly measurements = new Array<MeasurementResponse>();

    addMeasurementResponse(responseTimeInMillis, responseTimestamp, version) {
        if (this.measurements.length > 1999) {
            this.measurements.splice(0, 1);
        }
        this.measurements.push(new MeasurementResponse(responseTimeInMillis, responseTimestamp, version))
    }

    getResponseMeasurements(): Array<MeasurementResponse> {
        return this.measurements;
    }
}
