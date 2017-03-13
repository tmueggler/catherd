import {Component, OnInit} from "@angular/core";
import {Http, Response} from "@angular/http";
import {GatewayControlService} from "./gateway-control.service";
import {Gateway} from "@catherd/api/web";
import {GatewayRepo} from "./gateway.repo";

@Component({
    selector: 'gateway-list',
    templateUrl: 'app/gateway/gateway-authorized.component.html',
})
export class GatewayAuthorizedComponent implements OnInit {
    private readonly url: string;

    constructor(private readonly gatewayrepo: GatewayRepo, private readonly control: GatewayControlService) {
        this.url = 'http://localhost:3000';
    }

    gateways: Gateway.Info[] = [];

    ngOnInit() {
        this.gatewayrepo.authorized()
            .subscribe((res) => this.gateways = res);
    }

    delete(trg: Gateway.Info) {
        this.gatewayrepo.delete(trg)
            .subscribe((res) => {
                // TODO show success
            });
    }

    restart(trg: Gateway.Info) {
        this.control.restart(trg);
    }

    update(trg: Gateway.Info) {
        this.control.update(trg);
    }

    shutdown(trg: Gateway.Info) {
        this.control.shutdown(trg);
    }
}