import {MessageHandler} from "../messagebus/messagebus.service";
import {Message, SignIn} from "@catherd/api/node";
import {RegistrationService} from "./registration.service";
import {LoggerFactory, Logger} from "@catherd/logcat/node";

export class SignInHandler implements MessageHandler<SignIn> {
    private readonly log: Logger = LoggerFactory.get('signin-handler');

    constructor(private readonly registration: RegistrationService) {
    }

    handle(req: SignIn): Message {
        let uuid = req.from;
        this.log.debug(`Handling sign in message for ${uuid}`);
        this.registration.register(uuid);
        return null;
    }
}