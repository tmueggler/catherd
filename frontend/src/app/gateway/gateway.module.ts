import {NgModule} from "@angular/core";
import {GatewayAuthorizedComponent} from "./gateway-authorized.component";
import {CommonModule} from "@angular/common";
import {HttpModule} from "@angular/http";
import {GatewayControlService} from "./gateway-control.service";
import {RouterModule, Routes} from "@angular/router";
import {GatewaysComponent} from "./gateways.component";
import {GatewayUnauthorizedComponent} from "./gateway-unauthorized.component";
import {GatewayRepo} from "./gateway.repo";

const ROUTES: Routes = [
    {
        path: 'gateways', component: GatewaysComponent,
        children: [
            {path: 'authorized', component: GatewayAuthorizedComponent},
            {path: 'unauthorized', component: GatewayUnauthorizedComponent},
            {path: '', redirectTo: 'authorized', pathMatch: 'full'}
        ]
    }
];

@NgModule({
    imports: [CommonModule, HttpModule, RouterModule.forChild(ROUTES)],
    declarations: [GatewaysComponent, GatewayAuthorizedComponent, GatewayUnauthorizedComponent],
    providers: [GatewayRepo, GatewayControlService]
})
export class GatewayModule {
}