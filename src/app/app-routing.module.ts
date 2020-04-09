import {RouterModule, Routes} from "@angular/router";
import {AppComponent} from "./app.component";
import {NgModule} from "@angular/core";
import {MainSceneComponent} from "./scenes/main-scene/main-scene.component";
import {HttpService} from "./http/http.service";
import {RedirectComponent} from "./redirect/redirect.component";
import {MenuSceneComponent} from "./scenes/menu-scene/menu-scene.component";
import {HomeComponent} from "./home/home.component";

const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: 'menu', component: MenuSceneComponent},
  {path: 'game', component: MainSceneComponent},
  {path: '**', redirectTo: 'home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
