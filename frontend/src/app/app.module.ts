import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./app.component";
import {Configuration} from "./app.config";
import {AppStateManager} from "./appstate.manager";
import {MessageBus} from "./messagebus/messagebus.service";
import {RouterModule, Routes} from "@angular/router";
import {GatewayModule} from "./gateway/gateway.module";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {PageNotFoundComponent} from "./page-not-found.component";
import {NotificationService, NotificationComponentRegistry} from "./notification.service";
import {NotificationComponent} from "./notification.component";

const ROUTES: Routes = [
    {path: 'dashboard', component: DashboardComponent},
    {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
    {path: '**', component: PageNotFoundComponent}
];

@NgModule({
    imports: [
        BrowserModule,
        GatewayModule,
        RouterModule.forRoot(ROUTES)
    ],
    declarations: [
        NotificationComponent,
        AppComponent,
        DashboardComponent,
        PageNotFoundComponent
    ],
    providers: [
        NotificationComponentRegistry,
        NotificationService,
        Configuration.AppCfg,
        AppStateManager,
        MessageBus
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}