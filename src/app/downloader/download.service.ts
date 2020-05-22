import {Injectable} from '@angular/core';
import {HttpService} from "../http/http.service";
import {MeasurementService} from "../cache/measurement.service";
import {saveAs} from 'file-saver';

@Injectable({
    providedIn: 'root'
})
export class DownloadService {

    private RESPONSE_FILE = "response_measurement.csv";
    private REQUEST_FILE = "request_measurement.csv";

    constructor(private cacheMeasurement: MeasurementService, private httpService: HttpService) {
    }

    downloadRequestMeasurements() {
        this.httpService.downloadMeasurements().subscribe((data) => {
            this.downloadRequestFile(data.body)
        })
    }

    downloadResponseMeasurements() {
        this.downloadResponseFile(this.cacheMeasurement.getResponseMeasurements());
        this.cacheMeasurement.clearCache();
    }

    private downloadRequestFile(data) {
        const blob = new Blob([data], {type: 'text/csv'});
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.download = this.REQUEST_FILE; // here you can specify file name
        anchor.href = url;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }

    private downloadResponseFile(data: any) {
        const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
        const header = ['nickname', 'responseTimeInMillis', 'responseTimestamp'];
        let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
        csv.unshift(header.join(','));
        let csvArray = csv.join('\r\n');

        saveAs(new Blob([csvArray], {type: 'text/csv'}), this.RESPONSE_FILE);
    }

}
