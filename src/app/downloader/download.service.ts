import {Injectable} from '@angular/core';
import {MeasurementService} from "../cache/measurement.service";
import {saveAs} from 'file-saver';
import {CSV_RESPONSE_HEADERS_MONSTER, CSV_RESPONSE_HEADERS_PLAYER} from "../../../global-config";

@Injectable({
    providedIn: 'root'
})
export class DownloadService {

    private RESPONSE_FILE_PLAYER = "response_measurement_player.csv";
    private RESPONSE_FILE_MONSTER = "response_measurement_monster.csv";

    constructor(private cacheMeasurement: MeasurementService) {
    }

    downloadResponseMeasurements() {
        this.downloadResponseFile(this.cacheMeasurement.getResponseMeasurements(), CSV_RESPONSE_HEADERS_PLAYER, this.RESPONSE_FILE_PLAYER);
        this.downloadResponseFile(this.cacheMeasurement.getResponseMeasurementsForMonster(), CSV_RESPONSE_HEADERS_MONSTER,this.RESPONSE_FILE_MONSTER);
    }

    private downloadResponseFile(data: any, headers, fileName) {
        const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
        let csv = data.map(row => headers.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
        headers = headers.map(function(x){ return x.toUpperCase() })
        csv.unshift(headers.join(','));
        let csvArray = csv.join('\r\n');

        saveAs(new Blob([csvArray], {type: 'text/csv'}), fileName);
    }

}
