import {MessageHandler} from "../messagebus/messagebus.service";
import {Message, SignOut} from "@catherd/api/node";
import {RegistrationService} from "./registration.service";
import {LoggerFactory, Logger} from "@catherd/logcat/node";

export class SignOutHandler implements MessageHandler<SignOut> {
    private readonly log: Logger = LoggerFactory.get('singout-handler');

    constructor(private readonly registration: RegistrationService) {
    }

    handle(req: SignOut): Message {
        let uuid = req.from;
        this.log.debug(`Handling sign out for ${uuid}`);
        this.registration.deregister(uuid);
        return null;
    }
}