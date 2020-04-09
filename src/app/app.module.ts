import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { MainSceneComponent } from './scenes/main-scene/main-scene.component';
import { MenuSceneComponent } from './scenes/menu-scene/menu-scene.component';
import {WebsocketService} from './websocket/websocket.service';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {HttpService} from './http/http.service';
import {AppRoutingModule} from "./app-routing.module";
import {OAuthModule} from "angular-oauth2-oidc";
import { RedirectComponent } from './redirect/redirect.component';
import { OAuth2Interceptor } from './oauth/OAuth2Interceptor';
import {AngularWebStorageModule } from "angular-web-storage";
import { StorageServiceModule } from 'angular-webstorage-service';
import {CookieService} from "ngx-cookie-service";
import { LoginSceneComponent } from './scenes/login-scene/login-scene.component';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    MainSceneComponent,
    MenuSceneComponent,
    RedirectComponent,
    LoginSceneComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    OAuthModule.forRoot()
  ],
  providers: [WebsocketService, HttpService,CookieService,
  {
    provide: HTTP_INTERCEPTORS,
    useClass: OAuth2Interceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
