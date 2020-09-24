import {Injectable} from '@angular/core';
import {MeasurementService} from "../cache/measurement.service";
import {saveAs} from 'file-saver';
import {CSV_RESPONSE_HEADERS} from "../../../global-config";

@Injectable({
    providedIn: 'root'
})
export class DownloadService {

    private RESPONSE_FILE = "response_measurement.csv";

    constructor(private cacheMeasurement: MeasurementService) {
    }

    downloadResponseMeasurements() {
        this.downloadResponseFile(this.cacheMeasurement.getResponseMeasurements());
    }

    private downloadResponseFile(data: any) {
        const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
        let header = CSV_RESPONSE_HEADERS;
        let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
        header = header.map(function(x){ return x.toUpperCase() })
        csv.unshift(header.join(','));
        let csvArray = csv.join('\r\n');

        saveAs(new Blob([csvArray], {type: 'text/csv'}), this.RESPONSE_FILE);
    }

}
