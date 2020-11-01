import {Injectable} from '@angular/core';
import {MeasurementResponse} from "../model/MeasurementResponse";
import {MonsterMeasurement} from "../model/MonsterMeasurement";

@Injectable({
    providedIn: 'root'
})
export class MeasurementService {

    private readonly measurements = new Array<MeasurementResponse>();
    private readonly monsterMeasurements = new Array<MonsterMeasurement>();
    private firstMonsterTimestamp: number;

    addMeasurementResponse(id, responseTimeInMillis, specificSecondOfCommunication, version, size, requestTimestamp) {
        this.measurements.push(new MeasurementResponse(id, responseTimeInMillis, specificSecondOfCommunication, version, size, requestTimestamp))
    }

    addMonsterMeasurement(id, requestTimestamp) {
        if(this.monsterMeasurements.length === 0) {
            this.firstMonsterTimestamp = requestTimestamp;
        }
        // this.monsterMeasurements.push(new MonsterMeasurement(id,
        //     Math.ceil((requestTimestamp - this.firstMonsterTimestamp) / 1000),
        //     requestTimestamp));
    }

    addMonsterMeasurementWithTime(id, requestTimestamp, responseTimeInMillis) {
        if(this.monsterMeasurements.length === 0) {
            this.firstMonsterTimestamp = requestTimestamp;
        }
        this.monsterMeasurements.push(new MonsterMeasurement(id,
            Math.ceil((requestTimestamp - this.firstMonsterTimestamp) / 1000),
            requestTimestamp, responseTimeInMillis));
    }

    getResponseMeasurements(): Array<MeasurementResponse> {
        return this.measurements;
    }

    getResponseMeasurementsForMonster(): Array<MonsterMeasurement> {
        return this.monsterMeasurements;
    }
}
