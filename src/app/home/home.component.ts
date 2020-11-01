import {Component} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  public nickname: string;
  public answer: string;
  public message: string;

  constructor(private router: Router) {
    if(this.router.getCurrentNavigation().extras.state) {
      this.answer = this.router.getCurrentNavigation().extras.state.nick;
      this.message = this.router.getCurrentNavigation().extras.state.message;
    }
  }

  startGame(nickname: string) {
    this.router.navigate(['game'], {state: {nick: nickname}});
  }

}
