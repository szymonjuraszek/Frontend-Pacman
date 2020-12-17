import {Component, Input} from '@angular/core';
import {Router} from "@angular/router";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  public nickname: string;
  public answer: string;
  public message: string;
  public versionName = environment.versionName;
  public contentFormat = environment.contentFormat;
  public vpsServer= environment.vpsServerUrl;
  public localServerUrl= environment.localServerUrl;
  public speed = 21;
  public additionalObjects = 0;
  public serverUrl = environment.vpsServerUrl;

  constructor(private router: Router) {
    if(this.router.getCurrentNavigation().extras.state) {
      this.answer = this.router.getCurrentNavigation().extras.state.nick;
      this.message = this.router.getCurrentNavigation().extras.state.message;
    }
  }

  startGame(nickname: string) {
    this.router.navigate(['game'], {
      state: {
        nick: nickname,
        speed: this.speed,
        additionalObjects: this.additionalObjects,
        serverUrl: this.serverUrl,
        formatter: environment.formatter
      }
    });
  }

}
