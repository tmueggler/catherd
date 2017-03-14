import {Component, OnInit} from "@angular/core";
import {GatewayControlService} from "./gateway-control.service";
import {Gateway} from "@catherd/api/web";
import {GatewayRepo} from "./gateway.repo";
import {NotificationService} from "../notification.service";

@Component({
    selector: 'gateway-list',
    templateUrl: 'app/gateway/gateway-authorized.component.html',
})
export class GatewayAuthorizedComponent implements OnInit {
    private readonly url: string;

    constructor(private readonly gatewayrepo: GatewayRepo,
                private readonly control: GatewayControlService,
                private readonly notification: NotificationService) {
        this.url = 'http://localhost:3000';
    }

    gateways: Gateway.Info[] = [];

    ngOnInit() {
        this.load();
    }

    private load(): void {
        this.gatewayrepo.authorized()
            .subscribe(
                (result) => this.gateways = result,
                (error) => console.warn(`Failed to load authorized gateways. Reason ${error}`)
            );
    }

    delete(trg: Gateway.Info) {
        this.gatewayrepo.delete(trg)
            .subscribe(
                (result) => {
                    this.load();
                    this.notification.success('_gatway_delete_success_');
                },
                (error) => this.notification.danger('_gatway_delete_failed_')
            );
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