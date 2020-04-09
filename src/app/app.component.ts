import { Component } from '@angular/core';
import {WebsocketService} from './websocket/websocket.service';
import {HttpService} from "./http/http.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title;

  constructor(private httpService: HttpService) {
  }

  login() {
    this.httpService.login();
  }
}
