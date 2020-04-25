import {Component} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  public nickname: string;

  constructor(private router: Router) {
  }

  startGame(nickname: string) {
    this.router.navigate(['game'], {state: {nick: nickname}});
  }

}
