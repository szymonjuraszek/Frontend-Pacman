// @ts-ignore
import {BrowserModule} from '@angular/platform-browser';
// @ts-ignore
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {GameComponent} from './game/game.component';
import {MainSceneComponent} from './scene/main-scene.component';
import {WebsocketService} from './communication/websocket/websocket.service';
// @ts-ignore
import {HttpClientModule} from '@angular/common/http';
import {AppRoutingModule} from "./app-routing.module";
import {HomeComponent} from './home/home.component';
// @ts-ignore
import {FormsModule} from "@angular/forms";

import {MatRadioModule} from '@angular/material/radio';

// @ts-ignore
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
        FormsModule,
        MatRadioModule
    ],
    providers: [WebsocketService],
    bootstrap: [AppComponent]
})
export class AppModule {
}
