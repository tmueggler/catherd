import {Component, OnInit} from "@angular/core";
import {Gateway} from "@catherd/api/web";
import {GatewayRepo} from "./gateway.repo";

@Component({
    selector: 'gateways-unauthorized',
    templateUrl: 'app/gateway/gateway-unauthorized.component.html'
})
export class GatewayUnauthorizedComponent implements OnInit {
    constructor(private readonly gatewayrepo: GatewayRepo) {
    }

    gateways: Gateway.Info[] = [];

    ngOnInit(): void {
        this.gatewayrepo.unauthorized()
            .subscribe((res) => this.gateways = res);
    }

    authorize(trg: Gateway.Info) {
        this.gatewayrepo.authorize(trg)
            .subscribe((res) => { // TODO show success
            });
    }
}