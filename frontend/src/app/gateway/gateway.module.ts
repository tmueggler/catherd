import {NgModule} from "@angular/core";
import {GatewayListComponent} from "./gateway-list.component";
import {CommonModule} from "@angular/common";
import {HttpModule} from "@angular/http";
import {GatewayControlService} from "./gateway-control.service";

@NgModule({
    imports: [CommonModule, HttpModule],
    declarations: [GatewayListComponent],
    exports: [GatewayListComponent],
    providers: [GatewayControlService]
})
export class GatewayModule {
}