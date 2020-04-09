import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Game} from '../model/game';

@Injectable()
export class HttpService {

  constructor(private httpClient: HttpClient) {
  }

  getAllGames(): Observable<Array<Game>> {
    return this.httpClient.get<Array<Game>>('http://localhost:8080/api/games');
  }

  createGame(name: string): Observable<Game> {
    return this.httpClient.post<Game>('http://localhost:8080/api/game', name);
  }

  login() {
    return this.httpClient.get('http://localhost:8080/api/login/user');
  }

  getToken(code: string, nonce: string, token: string) {
    const params = new HttpParams().set('code', code).set('token', token);
    return this.httpClient.get('http://localhost:8080/api/token', {
        params: params
      });
  }
}
