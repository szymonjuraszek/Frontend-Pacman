import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {HTTP_URL_DOWNLOAD} from "../../../global-config";

@Injectable()
export class HttpService {

  constructor(private httpClient: HttpClient) {
  }

  downloadMeasurements() {
    let headers = new HttpHeaders();
    headers = headers.append('Accept', 'text/csv; charset=utf-8');

    return this.httpClient.get(HTTP_URL_DOWNLOAD, {
      headers: headers,
      observe: 'response',
      responseType: 'text'
    })
  }
}
