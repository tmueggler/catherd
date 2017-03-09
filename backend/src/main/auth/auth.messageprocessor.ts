import {Topic, MessageTransmitter} from "../messagebus/message.receiver";
import {Message, SignIn, Authorizations} from "@catherd/api/node";
import {MessageDispatcher, MessageHandler, DoTransmit} from "../messagebus/message.dispatcher";
import {LoggerFactory} from "@catherd/logcat/node";

const LOG_NAME = 'auth-messageprocessor';

export class AuthMessageProcessor extends MessageDispatcher {
    constructor(protected readonly tx: MessageTransmitter) {
        super(tx);
        this.register(SignIn.TYPE, new OnSignIn());
    }
}

abstract class AuthHandlerBase<M extends Message> implements MessageHandler<M> {
    handle(topic: Topic, msg: M): DoTransmit {
        let parts = topic.split('/');
        return this.dohandle(parts[1], parts[2], msg);
    }

    protected abstract dohandle(thing: string, uuid: string, msg: Message): DoTransmit;
}

class OnSignIn extends AuthHandlerBase<SignIn> {
    private readonly log = LoggerFactory.get(LOG_NAME);

    dohandle(thing: string, uuid: string, msg: Message): DoTransmit {
        this.log.debug(`Sign in ${thing} ${uuid}`);
        let res = Authorizations.pending();
        return (tx) => tx.send(`/auth/${thing}/${uuid}/res`, res);
    }
}