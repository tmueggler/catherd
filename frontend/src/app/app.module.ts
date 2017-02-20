import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./app.component";
import {Configuration} from "./app.config";
import {AppStateManager} from "./appstate.manager";
import {EventBus} from "./eventbus.service";
import {RouterModule, Routes} from "@angular/router";
import {GatewayModule} from "./gateway/gateway.module";
import {GatewayListComponent} from "./gateway/gateway-list.component";
import {DashboardComponent} from "./dashboard/dashboard.component";

const ROUTES: Routes = [
    {path: 'gateway', component: GatewayListComponent},
    {path: '', component: DashboardComponent}
];

@NgModule({
    imports: [
        BrowserModule,
        RouterModule.forRoot(ROUTES),
        GatewayModule
    ],
    declarations: [
        AppComponent,
        DashboardComponent
    ],
    providers: [
        Configuration.AppCfg,
        AppStateManager,
        EventBus
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}