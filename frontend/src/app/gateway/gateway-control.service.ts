import {Injectable} from "@angular/core";
import {EventBus} from "../eventbus.service";
import {Gateway} from "./gateway.model";

@Injectable()
export class GatewayControlService {
    constructor(private readonly eventbus: EventBus) {
    }

    restart(trg: Gateway) {
        this.eventbus.send({
            type: 11,
            from: null,
            to: trg.uuid,
            delay_ms: 0
        });
    }

    update(trg: Gateway) {
        this.eventbus.send({
            type: 12,
            from: null,
            to: trg.uuid,
            version: null
        });
    }

    shutdown(trg: Gateway) {
        this.eventbus.send({
            type: 13,
            from: null,
            to: trg.uuid,
            delay_ms: 0
        });
    }
}