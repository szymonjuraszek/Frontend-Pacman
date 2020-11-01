import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {MainSceneComponent} from "./scene/main-scene.component";
import {HomeComponent} from "./home/home.component";

const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: 'game', component: MainSceneComponent},
  {path: '**', redirectTo: 'home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
