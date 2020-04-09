import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {HttpService} from "../http/http.service";
import {OAuthService} from "angular-oauth2-oidc";

@Component({
  selector: 'app-redirect',
  templateUrl: './redirect.component.html',
  styleUrls: ['./redirect.component.css']
})
export class RedirectComponent {
  r: any;

  constructor(private router: Router, private httpService: HttpService,private oauthService: OAuthService) {
    // this.askForToken();
    this.r = this.router.getCurrentNavigation().extractedUrl.queryParamMap.get('code');
  }

  askForToken() {
    let token = window.sessionStorage.getItem('PKCI_verifier');
    this.httpService.getToken(this.router.getCurrentNavigation().extractedUrl.queryParamMap.get('code'),
      this.router.getCurrentNavigation().extractedUrl.queryParamMap.get('nonce'),token)
      .subscribe((data) => {
      console.log(data);
    });
  }

}
