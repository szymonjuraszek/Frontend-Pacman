import { Component, OnInit } from '@angular/core';
import {JwksValidationHandler, OAuthService} from "angular-oauth2-oidc";
import {authCodeFlowConfig} from "../sso.config";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private oauthService: OAuthService) { }

  ngOnInit(): void {
    this.oauthService.configure(authCodeFlowConfig);
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    this.oauthService.loadDiscoveryDocument();
    this.oauthService.tokenEndpoint = 'http://localhost:8080/api/token';
    this.oauthService.tryLoginCodeFlow();
  }

  startGame() {
    this.oauthService.initCodeFlow();
  }

}
