import {NextObserver} from "rxjs/Observer";
import {Event} from "../eventbus/eventbus.service";
import {EventBusObserver} from "../eventbus/eventbus.beanpostprocessor";
import {MessageBusEvent} from "../messagebus/messagebus.event";
import {MessageBus} from "../messagebus/messagebus.service";
import {GatewayConfig} from "../gateway.config";
import {GatewayState, StateChange} from "@catherd/api/node";

@EventBusObserver()
export class StateController implements NextObserver<Event> {
    constructor(private readonly cfg: GatewayConfig,
                private readonly messaging: MessageBus) {
    }

    next(evt: Event) {
        switch (evt.type) {
            case MessageBusEvent.CONNECTED:
                this.connected();
                break;
            case MessageBusEvent.DISCONNECTED:
                this.disconnected();
                break;
            default:
                break;
        }
    }

    private state: GatewayState = GatewayState.OFFLINE;

    private connected() {
        let msg: StateChange<GatewayState> = {
            type: StateChange.TYPE,
            before: this.state,
            after: GatewayState.ONLINE
        };
        this.state = GatewayState.ONLINE;
        this.messaging.send(`/gateway/${this.cfg.uuid}/state`, msg);
    }

    private disconnected() {
        let msg: StateChange<GatewayState> = {
            type: StateChange.TYPE,
            before: this.state,
            after: GatewayState.OFFLINE
        };
        this.state = GatewayState.OFFLINE;
        this.messaging.send(`/gateway/${this.cfg.uuid}/state`, msg);
    }
}