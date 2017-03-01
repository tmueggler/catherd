import {MessageBus} from "../messagebus/messagebus.service";
import {GatewayConfig} from "../gateway.config";
import {SignIn, SignOut} from "@catherd/api/node";

export class RegistrationService {
    constructor(private readonly $cfg: GatewayConfig, private readonly $messaging: MessageBus) {
    }

    register(): void {
        let msg: SignIn = {
            type: SignIn.TYPE,
            from: this.$cfg.uuid,
            to: null,
            version: null
        };
        this.$messaging.send(msg);
    }

    deregister(): void {
        let msg: SignOut = {
            type: SignOut.TYPE,
            from: this.$cfg.uuid,
            to: null
        };
        this.$messaging.send(msg);
    }
}