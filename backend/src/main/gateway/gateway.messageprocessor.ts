import {Topic, MessageTransmitter} from "../messagebus/message.receiver";
import {StateChange, Gateway} from "@catherd/api/node";
import {MessageHandler, MessageDispatcher, DoTransmit} from "../messagebus/message.dispatcher";
import {LoggerFactory} from "@catherd/logcat/node";
import {GatewayRepo} from "./gateway.repo";

const LOG_NAME = 'gateway-messageprocessor';

export class GatewayMessageProcessor extends MessageDispatcher {
    constructor(protected readonly tx: MessageTransmitter,
                private readonly gateways: GatewayRepo) {
        super(tx);
        this.register(StateChange.TYPE, new StateChangeHandler(gateways));
    }
}

class StateChangeHandler implements MessageHandler<StateChange<any>> {
    protected readonly log = LoggerFactory.get(LOG_NAME);

    constructor(private readonly gateways: GatewayRepo) {
    }

    handle(topic: Topic, msg: StateChange<any>): DoTransmit {
        let parts = topic.split('/');
        return this.dohandle(parts[0], parts[1], parts[2], msg);
    }

    private dohandle(target: string, uuid: string, property: string, msg: StateChange<any>): DoTransmit {
        this.log.debug(`State change ${target}{${uuid}}.${property} ${msg.before} -> ${msg.after}`);
        if ('gateway' === target && 'info' === property) {
            return this.gatewayInfo(msg);
        } else {
            this.log.debug(`Unhandled state change ${target}{${uuid}}.${property}`);
            return null;
        }
    }

    private gatewayInfo(msg: StateChange<Gateway.Info>): DoTransmit {
        this.gateways.update(msg.after);
        return null;
    }
}