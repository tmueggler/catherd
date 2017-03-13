import {Component, OnInit} from "@angular/core";
import {Gateway} from "@catherd/api/web";
import {GatewayRepo} from "./gateway.repo";
import {NotificationService} from "../notification.service";

@Component({
    selector: 'gateways-unauthorized',
    templateUrl: 'app/gateway/gateway-unauthorized.component.html'
})
export class GatewayUnauthorizedComponent implements OnInit {
    constructor(private readonly gatewayrepo: GatewayRepo, private readonly notification: NotificationService) {
    }

    gateways: Gateway.Info[] = [];

    ngOnInit(): void {
        this.gatewayrepo.unauthorized()
            .subscribe(
                (res) => this.gateways = res,
                (error) => console.warn(`Failed to load unauthorized gateways. Reason ${error}`) // TODO show in view
            );
    }

    authorize(trg: Gateway.Info) {
        this.gatewayrepo.authorize(trg)
            .subscribe(
                (res) => this.notification.success('_gateway_authorize_success_'),
                (error) => this.notification.warning('_gateway_authorize_failed_')
            );
    }
}