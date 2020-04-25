import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable()
export class HttpService {

  constructor(private httpClient: HttpClient) {
  }

  logout(): Observable<any> {
    return this.httpClient.delete<any>('https://localhost:8080/api/game');
  }
  addPlayer() {
    return this.httpClient.get('https://localhost:8080/api/game');
  }
}
