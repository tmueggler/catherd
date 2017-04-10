import {Topic, MessageTransmitter} from "../messagebus/message.receiver";
import {StateChange, Gateway, Ping, Pong} from "@catherd/api/node";
import {MessageHandler, MessageDispatcher, DoTransmit} from "../messagebus/message.dispatcher";
import {LoggerFactory} from "@catherd/logcat/node";
import {GatewayRepo} from "./gateway.repo";

const log = LoggerFactory.get('gateway-message-processor');

export class GatewayMessageProcessor extends MessageDispatcher {
    constructor(protected readonly tx: MessageTransmitter,
                private readonly gateways: GatewayRepo) {
        super(tx);
        this.register(StateChange.TYPE, new StateChangeHandler(gateways));
        this.register(Ping.TYPE, new PingHandler());
    }
}

class StateChangeHandler implements MessageHandler<StateChange<any>> {
    constructor(private readonly gateways: GatewayRepo) {
    }

    handle(topic: Topic, msg: StateChange<any>): DoTransmit {
        let parts = topic.split('/');
        return this.dohandle(parts[1], parts[2], parts[3], msg);
    }

    private dohandle(target: string, uuid: string, property: string, msg: StateChange<any>): DoTransmit {
        log.debug(`State change ${target}{${uuid}}.${property} ${msg.before} -> ${msg.after}`);
        if ('gateway' === target && 'info' === property) {
            return this.gatewayInfo(msg);
        } else {
            log.debug(`Unhandled state change ${target}{${uuid}}.${property}`);
            return null;
        }
    }

    private gatewayInfo(msg: StateChange<Gateway.Info>): DoTransmit {
        this.gateways.update(msg.after);
        return null;
    }
}

class PingHandler implements MessageHandler<Ping> {
    handle(topic: Topic, msg: Ping): DoTransmit {
        let parts = topic.split('/');
        return this.dohandle(parts[1], parts[2], parts[3], msg);
    }

    private dohandle(target: string, uuid: string, property: string, msg: Ping): DoTransmit {
        return ((tx: MessageTransmitter) => {
            let pong: Pong = {type: Pong.TYPE, timestamp: Date.now(), pingtimestamp: msg.timestamp};
            tx.send(`/gateway/${uuid}/monitor`, pong);
            log.debug('Sent pong');
        });
    }
}