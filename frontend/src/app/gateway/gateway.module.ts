import {NgModule} from "@angular/core";
import {GatewayListComponent} from "./gateway-list.component";
import {CommonModule} from "@angular/common";
import {HttpModule} from "@angular/http";
import {GatewayControlService} from "./gateway-control.service";
import {RouterModule, Routes} from "@angular/router";
import {GatewaysComponent} from "./gateways.component";
import {GatewayUnauthorizedComponent} from "./gateway-unauthorized.component";

const ROUTES: Routes = [
    {
        path: 'gateways', component: GatewaysComponent,
        children: [
            {path: 'authorized', component: GatewayListComponent},
            {path: 'unauthorized', component: GatewayUnauthorizedComponent},
            {path: '', redirectTo: 'authorized', pathMatch: 'full'}
        ]
    }
];

@NgModule({
    imports: [CommonModule, HttpModule, RouterModule.forChild(ROUTES)],
    declarations: [GatewaysComponent, GatewayListComponent, GatewayUnauthorizedComponent],
    providers: [GatewayControlService]
})
export class GatewayModule {
}