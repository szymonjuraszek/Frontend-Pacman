import {HttpInterceptor, HttpRequest, HttpEvent, HttpHandler} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CookieService} from 'ngx-cookie-service';
import {LocalStorageService, SessionStorageService, LocalStorage, SessionStorage} from 'angular-web-storage';
import {LOCAL_STORAGE, WebStorageService} from "angular-webstorage-service";
import {Validators} from "@angular/forms";
import {OAuthService} from "angular-oauth2-oidc";
import {Router} from "@angular/router";

@Injectable()
export class OAuth2Interceptor implements HttpInterceptor {
  private regex = new RegExp('https://localhost:8080/api/.+');

  constructor(private cookieService: CookieService, private router: Router) {
  }

  intercept(req: HttpRequest<any>,
            next: HttpHandler): Observable<HttpEvent<any>> {
    // console.log(sessionStorage.getItem("access_token"));
    // console.log(sessionStorage.getItem('id_token'));

    const accessToken = sessionStorage.getItem('access_token');
    const idToken = sessionStorage.getItem('id_token');

    if (idToken && accessToken && this.regex.exec(req.url)) {
      console.error('dodaje kolejne informacje do zapytania')
      const cloned = req.clone({
        headers: req.headers.set('Authorization',
          'Bearer ' + idToken).set('id_token', accessToken)
      });

      return next.handle(cloned);

    } else {
      return next.handle(req);
    }

  }

}
