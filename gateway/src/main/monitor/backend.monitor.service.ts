import {EventBusObserver} from "../eventbus/eventbus.beanpostprocessor";
import {NextObserver} from "rxjs/Observer";
import {Event} from "../eventbus/eventbus.service";
import {MessageBusEvent} from "../messagebus/messagebus.event";
import {LoggerFactory} from "@catherd/logcat/node";
import {MessageBus, OnMessage, Topic} from "../messagebus/messagebus.service";
import {Message, Ping, Pong} from "@catherd/api/node";
import {GatewayConfig} from "../gateway.config";
import {MessageHandler} from "../messagebus/messagehandler.beanpostprocessor";

const log = LoggerFactory.get('backend-monitor-service');

@EventBusObserver()
export class BackendMonitorService implements NextObserver<Event>, OnMessage {
    private readonly interval_ms: number;

    constructor(private readonly cfg: GatewayConfig, readonly messaging: MessageBus) {
        this.interval_ms = 10 * 1000;
    }

    next(evt: Event): void {
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

    @MessageHandler(`/gateway/+/monitor/#`)
    on(topic: Topic, msg: Message): void {
        if (msg.type === Pong.TYPE) {
            let pong: Pong = <any>msg;
            let now = Date.now();
            let roundtrip_ms = now - pong.pingtimestamp;
            let d_servertime_ms = now - pong.timestamp;
            log.debug(`Pong rountrip ${roundtrip_ms}ms, delta server time ${d_servertime_ms}ms`);
        }
    }

    private interval: NodeJS.Timer;

    private connected(): void {
        this.interval = setInterval(() => this.ping(), this.interval_ms);
        log.info(`Started ping every ${this.interval_ms}ms`);
    }

    private ping() {
        try {
            let ping: Ping = {type: Ping.TYPE, timestamp: Date.now()};
            this.messaging.send(`/gateway/${this.cfg.uuid}/monitor`, ping);
        } catch (e) {
            log.warn(`Ping failed. Reason ${e}`);
        }
    }

    private disconnected(): void {
        clearInterval(this.interval);
        log.info('Stopped ping');
    }
}