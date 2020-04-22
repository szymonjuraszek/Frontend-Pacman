import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { MainSceneComponent } from './scenes/main-scene/main-scene.component';
import {WebsocketService} from './websocket/websocket.service';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {HttpService} from './http/http.service';
import {AppRoutingModule} from "./app-routing.module";
import {OAuthModule} from "angular-oauth2-oidc";
import { OAuth2Interceptor } from './oauth/OAuth2Interceptor';
import {CookieService} from "ngx-cookie-service";
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    MainSceneComponent,
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
