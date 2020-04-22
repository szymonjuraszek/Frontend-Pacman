import {Component} from '@angular/core';
import {JwksValidationHandler, OAuthService} from "angular-oauth2-oidc";
import {authCodeFlowConfig} from "../sso.config";
import {Router} from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(private oauthService: OAuthService, private router: Router) {
    this.oauthService.configure(authCodeFlowConfig);
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    this.oauthService.loadDiscoveryDocument();
    if (window.location.search.includes('code')) {
      this.oauthService.tokenEndpoint = 'https://localhost:8080/api/token';
      this.oauthService.tryLoginCodeFlow().then(oauthService => {
        this.router.navigate(['game']);
      });
    }
  }

  startGame() {
    this.oauthService.initCodeFlow();
  }

}
