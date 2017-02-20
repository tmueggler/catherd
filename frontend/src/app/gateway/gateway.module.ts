import {NgModule} from "@angular/core";
import {GatewayListComponent} from "./gateway-list.component";
import {CommonModule} from "@angular/common";
import {HttpModule} from "@angular/http";

@NgModule({
    imports: [CommonModule, HttpModule],
    declarations: [GatewayListComponent],
    exports: [GatewayListComponent]
})
export class GatewayModule {
}