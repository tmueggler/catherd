import {Component, OnInit, OnDestroy} from "@angular/core";
import {GatewayControlService} from "./gateway-control.service";
import {Gateway, Message, StateChange} from "@catherd/api/web";
import {GatewayRepo} from "./gateway.repo";
import {NotificationService} from "../notification.service";
import {MessageBus, Topic, Subscription} from "../messagebus/messagebus.service";

@Component({
    selector: 'gateway-list',
    templateUrl: 'app/gateway/gateway-authorized.component.html',
})
export class GatewayAuthorizedComponent implements OnInit, OnDestroy {
    private readonly url: string;

    constructor(private readonly messaging: MessageBus,
                private readonly gatewayrepo: GatewayRepo,
                private readonly control: GatewayControlService,
                private readonly notification: NotificationService) {
        this.url = 'http://localhost:3000';
    }

    gateways: Gateway.Info[] = [];

    private subscription: Subscription;

    ngOnInit() {
        this.subscription = this.messaging.subscribe('/gateway/#', (topic, msg) => this.message(topic, msg));
        this.load();
    }

    ngOnDestroy() {
        if (this.subscription) this.subscription.unsubscribe();
    }

    private message(topic: Topic, msg: Message): void {
        console.log(`message ${topic} -> ${msg}`);
        if (msg.type == StateChange.TYPE) {
            let parts = topic.split('/');
            let trgtype = parts[1];
            let trguuid = parts[2];
            let trgprop = parts[3];
            if (trgtype === 'gateway' && trgprop === 'info') {
                let change = msg as StateChange<Gateway.Info>;
                let idx = this.gateways.findIndex((e) => {
                    return e.uuid === trguuid
                });
                if (idx > -1) this.gateways[idx] = change.after;
            }
        }
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