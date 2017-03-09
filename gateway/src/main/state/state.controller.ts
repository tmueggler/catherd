import {NextObserver} from "rxjs/Observer";
import {Event} from "../eventbus/eventbus.service";
import {EventBusObserver} from "../eventbus/eventbus.beanpostprocessor";
import {MessageBusEvent} from "../messagebus/messagebus.event";
import {MessageBus} from "../messagebus/messagebus.service";
import {GatewayConfig} from "../gateway.config";
import {Gateway, StateChange} from "@catherd/api/node";

@EventBusObserver()
export class StateController implements NextObserver<Event> {
    private info: Gateway.Info;

    constructor(private readonly cfg: GatewayConfig,
                private readonly messaging: MessageBus) {
        this.info = {
            uuid: cfg.uuid,
            version: '0.0.0',
            state: Gateway.State.OFFLINE
        }
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

    private connected() {
        this.info.state = Gateway.State.ONLINE;
        let msg: StateChange<Gateway.Info> = {
            type: StateChange.TYPE,
            before: null,
            after: this.info
        };
        this.messaging.send(`/gateway/${this.cfg.uuid}/info`, msg);
    }

    private disconnected() {
        this.info.state = Gateway.State.OFFLINE;
    }
}