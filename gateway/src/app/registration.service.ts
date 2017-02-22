import {EventBus} from "./eventbus.service";
import {GatewayConfig} from "./gateway.config";
import {SignIn, SignOut} from "@catherd/api/registration/registration.messages";

export class RegistrationService {
    constructor(private readonly $cfg: GatewayConfig, private readonly $messaging: EventBus) {
    }

    register(uuid: string) {
        let msg: SignIn = {
            type: SignIn.TYPE,
            from: this.$cfg.uuid,
            to: null,
            version: null
        };
        this.$messaging.send(msg);
    }

    deregister(uuid: string) {
        let msg: SignOut = {
            type: SignOut.TYPE,
            from: this.$cfg.uuid,
            to: null
        };
        this.$messaging.send(msg);
    }
}