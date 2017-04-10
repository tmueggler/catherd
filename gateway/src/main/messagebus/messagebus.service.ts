import {Message} from "@catherd/api/node";
import {EventBus} from "../eventbus/eventbus.service";
import {MessageBusEvent} from "./messagebus.event";
import {SockJSConnection} from "./messagebus.sockjs.connection";
import {MqttConnection} from "./messagebus.mqtt.connection";
import {LoggerFactory} from "@catherd/logcat/node";
import {RoutingTree} from "@catherd/meow/node";

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
    private readonly subscriptions: TopicSubscriptions;
    private readonly handlers: Handlers;
    private readonly connection: MessageBusConnection;
    private reconnect_ms = 5000;

    constructor(private readonly url: string, private readonly events: EventBus) {
        this.subscriptions = new TopicSubscriptions();
        this.handlers = new Handlers();
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
        this.subscriptions.forEach((topic: Topic) => {
            return this.subscribeSafe(topic)
        });
        this.events.send({type: MessageBusEvent.CONNECTED, src_id: null});
    }

    private connectionMessage(topic: string, msg: Message): void {
        log.debug(`Message: ${topic} -> ${msg}`);
        this.handlers.on(topic, msg);
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
        if (!this.subscriptions.is(topic)) {
            let underlying = this.subscribeSafe(topic);
            this.subscriptions.add(topic, underlying);
        }
        this.handlers.add(topic, callback);
        return new MessageBusSubscription(topic, callback, this);
    }

    private subscribeSafe(topic: Topic): Subscription {
        let sub: Subscription = null;
        try {
            sub = this.connection.subscribe(topic);
            log.debug(`Subscribed to ${topic}`);
        } catch (e) {
            log.debug(`Subscription to ${topic} failed. Reason ${e}`);
        }
        return sub;
    }

    unsubscribe(sub: MessageBusSubscription): void {
        let remaining = this.handlers.remove(sub.topic, sub.handler);
        if (remaining > 0) return;
        let underlying = this.subscriptions.remove(sub.topic);
        if (!underlying) return;
        try {
            underlying.unsubscribe();
        } catch (e) {
            log.warn(`Unsubscribe from ${sub.topic} failed. Reason ${e}`);
        }
    }

    send(topic: string, msg: Message): void {
        if (!this.connection.connected) throw new Error(`Not connected`);
        this.connection.send(topic, msg);
    }

    stop(): void {
        this.connection.disconnect();
    }
}

class MessageBusSubscription implements Subscription {
    constructor(public readonly topic: Topic,
                public readonly handler: OnMessage,
                private readonly to: DefaultMessageBus) {
    }

    unsubscribe(): void {
        this.to.unsubscribe(this);
    }
}

class TopicSubscriptions {
    private readonly subscriptions: Map<Topic, Subscription> = new Map();

    is(topic: Topic): boolean {
        return this.subscriptions.has(topic);
    }

    add(topic: Topic, sub: Subscription): void {
        this.subscriptions.set(topic, sub);
    }

    remove(topic: Topic): Subscription {
        let existing = this.subscriptions.get(topic);
        this.subscriptions.delete(topic);
        return existing;
    }

    forEach(callback: (t: Topic) => Subscription): void {
        for (let topic of this.subscriptions.keys()) {
            this.subscriptions.set(topic, callback(topic));
        }
    }
}

class Handlers implements OnMessage {
    private readonly routing: RoutingTree<OnMessage> = new RoutingTree();
    private readonly count: Map<Topic, number> = new Map();

    add(topic: Topic, handler: OnMessage): void {
        this.routing.add(topic, handler);
        this.inc(topic);
    }

    private inc(topic: Topic): number {
        let cnt = this.count.get(topic);
        if (!cnt) cnt = 0;
        cnt += 1;
        this.count.set(topic, cnt);
        return cnt;
    }

    remove(topic: Topic, handler: OnMessage): number {
        this.routing.remove(topic, handler);
        return this.dec(topic);
    }

    private dec(topic: Topic): number {
        let cnt = this.count.get(topic);
        if (!cnt) return 0;
        cnt -= 1;
        if (cnt > 0) {
            this.count.set(topic, cnt);
        } else {
            this.count.delete(topic);
        }
        return cnt;
    }

    on(topic: Topic, msg: Message): void {
        this.routing.forEach(topic, (handler) => {
            try {
                handler.on(topic, msg);
            } catch (e) {
                log.warn(`Uncaught handler exception ${e}`);
            }
        });
    }
}