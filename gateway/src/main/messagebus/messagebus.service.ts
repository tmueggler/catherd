import {Message} from "@catherd/api/node";
import {EventBus} from "../eventbus/eventbus.service";
import {MessageBusEvent} from "./messagebus.event";
import {SockJSConnection} from "./messagebus.sockjs.connection";
import {MqttConnection} from "./messagebus.mqtt.connection";
import {LoggerFactory} from "@catherd/logcat/node";

export interface MessageBusConnection {
    reconnect_ms: number;
    readonly connected: boolean;
    connect(): void;
    subscribe(topic: string): Subscription;
    send(topic: string, msg: Message): void;
    disconnect(): void;
    onconnected: (src: MessageBusConnection) => void;
    onmessage: (src: MessageBusConnection, topic: string, msg: Message) => void;
    ondisconnected: (src: MessageBusConnection) => void;
    onerror: (src: MessageBusConnection, error: any) => void;
}

export interface MessageReceiver {
    subscribe(topic: Topic, callback: OnMessage): Subscription;
}

export interface OnMessage {
    on(topic: Topic, msg: Message): void;
}

export type Topic = string;

export interface MessageTransmitter {
    send(topic: Topic, msg: Message): void;
}

export interface Subscription {
    unsubscribe(): void;
}

export interface MessageBus extends MessageReceiver, MessageTransmitter {
    start(): void;
    stop(): void;
}

namespace ConnectionType {
    export const SOCKJS: number = 1;
    export const MQTT: number = 2;
}

const log = LoggerFactory.get('default-messagebus');

export class DefaultMessageBus implements MessageBus {
    private readonly subscriptions: Subscriptions;
    private readonly connection: MessageBusConnection;
    private reconnect_ms = 5000;

    constructor(private readonly url: string, private readonly events: EventBus) {
        this.subscriptions = new Subscriptions();
        let con: MessageBusConnection;
        switch (ConnectionType.MQTT) {
            case ConnectionType.SOCKJS:
                con = new SockJSConnection(`${this.url}/messagebus`);
                break;
            case ConnectionType.MQTT:
                con = new MqttConnection(`mqtt://192.168.56.104:1883`);
                break;
            default:
                throw new Error();
        }
        con.onconnected = (con) => this.connectionConnected();
        con.onmessage = (con, topic, msg) => this.connectionMessage(topic, msg);
        con.ondisconnected = (con) => this.connectionDisconnected();
        con.reconnect_ms = this.reconnect_ms;
        this.connection = con;
    }

    private connectionConnected(): void {
        log.debug(`Connected`);
        this.events.send({type: MessageBusEvent.CONNECTED, src_id: null});
    }

    private connectionMessage(topic: string, msg: Message): void {
        log.debug(`Message: ${topic} -> ${msg}`);
        this.subscriptions.on(topic, msg);
    }

    private connectionDisconnected(): void {
        log.debug(`Disconnected`);
        this.events.send({type: MessageBusEvent.DISCONNECTED, src_id: null});
    }

    start(): void {
        if (!this.connection.connected) {
            this.connection.connect();
        }
    }

    subscribe(topic: string, callback: OnMessage): Subscription {
        if (!this.connection.connected) throw new Error(`Not connected`);
        this.subscriptions.add(topic, callback);
        let sub = this.connection.subscribe(topic);
        return new MessageBusSubscription(sub, () => this.unsubscribe(topic, callback));
    }

    private unsubscribe(topic: Topic, callback: OnMessage): void {
        this.subscriptions.remove(topic, callback);
    }

    send(topic: string, msg: Message): void {
        if (!this.connection.connected) throw new Error(`Not connected`);
        this.connection.send(topic, msg);
    }

    stop(): void {
        this.connection.disconnect();
    }
}

class Subscriptions implements OnMessage { // TODO implement registration by actual topic
    private messagehandlers: OnMessage[] = [];

    add(topic: Topic, callback: OnMessage): void {
        this.messagehandlers.push(callback);
    }

    remove(topic: Topic, callback: OnMessage): void {
        let idx = this.messagehandlers.indexOf(callback);
        if (idx > -1) this.messagehandlers.splice(idx, 1);
    }

    on(topic: Topic, msg: Message): void {
        for (let h of this.messagehandlers) {
            try {
                h.on(topic, msg);
            } catch (e) {
                log.warn(`Uncaught message handler exception ${e}`);
            }
        }
    }
}

class MessageBusSubscription implements Subscription {
    constructor(private readonly underlying: Subscription,
                private readonly callback: () => void) {
    }

    unsubscribe(): void {
        this.underlying.unsubscribe();
        this.callback();
    }
}