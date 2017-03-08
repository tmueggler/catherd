import {Server as HttpServer} from "http";
import {createServer, Connection} from "sockjs";
import {MessageBroker} from "./message.broker";
import {StompMqttRelay} from "./stomp.mqtt.relay";
import {MqttRelay} from "./mqtt.realy";
import {MessagingCfg} from "./messagebus.config";

export class MessageBus {
    private running: boolean;
    private broker: MessageBus.ConnectionHandler;
    private stompRelay: MessageBus.ConnectionHandler;
    private mqttRelay: MessageBus.ConnectionHandler;

    constructor(private readonly cfg: MessagingCfg.ServerCfg) {
        this.running = false;
        this.broker = new MessageBroker(cfg.broker);
        this.stompRelay = new StompMqttRelay(cfg.stomp);
        this.mqttRelay = new MqttRelay(cfg.mqtt);
    }

    start(http: HttpServer) {
        if (this.running) {
            return;
        }

        let sockjs = createServer();
        sockjs.on('connection', (con) => this.broker.handle(con));
        sockjs.installHandlers(http, {prefix: this.cfg.broker.path});

        let stomp = createServer();
        stomp.on('connection', (con) => this.stompRelay.handle(con));
        stomp.installHandlers(http, {prefix: this.cfg.stomp.path});

        let mqtt = createServer();
        mqtt.on('connection', (con) => this.mqttRelay.handle(con));
        mqtt.installHandlers(http, {prefix: this.cfg.mqtt.path});

        this.running = true;
    }

    stop() {
        if (!this.running) {
            return;
        }
    }
}

export namespace MessageBus {
    export interface ConnectionHandler {
        handle(con: Connection): void;
    }
}