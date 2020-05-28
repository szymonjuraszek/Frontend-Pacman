import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable()
export class HttpService {

  constructor(private httpClient: HttpClient) {
  }

  downloadMeasurements() {
    let headers = new HttpHeaders();
    headers = headers.append('Accept', 'text/csv; charset=utf-8');

    return this.httpClient.get('https://pacman-application.herokuapp.com/report/measurement', {
      headers: headers,
      observe: 'response',
      responseType: 'text'
    })
  }
}
