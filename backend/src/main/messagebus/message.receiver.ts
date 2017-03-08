import {Message} from "@catherd/api/node";
import {LoggerFactory} from "@catherd/logcat/node";
import * as Mqtt from "mqtt";
import * as Uuid from "uuid";
import {MessagingCfg} from "./messagebus.config";

export type SubscriptionId = string;
export type Topic = string;

export interface Subscription {
    readonly id: SubscriptionId;
    readonly topic: Topic;
    unsubscribe(): Subscription;
}

export interface MessageProcessor<M> {
    process(topic: Topic, msg: Message): void;
}

const LOGGER_NAME = 'message-receiver';

export class MessageReceiver {
    private readonly log = LoggerFactory.get(LOGGER_NAME);
    private readonly subscriptions: Subscriptions;
    private readonly processors: Processors;

    constructor(private readonly cfg: MessagingCfg.ReceiverCfg) {
        this.subscriptions = new Subscriptions();
        this.processors = new Processors();
    }

    private client: Mqtt.Client;

    start(): void {
        this.log.info(`Staring message receiver from ${this.cfg.broker_url}`);
        let c = Mqtt.connect(this.cfg.broker_url);
        c.on('connect', () => this.connected());
        c.on('message', (topic: string, payload: string, packet: Mqtt.Packet) => this.dispatch(topic, payload, packet));
        c.on('offline', () => this.offline());
        c.on('reconnect', () => this.reconnect());
        c.on('close', (error: Error) => this.closed(error));
        c.on('error', (error: Error) => this.error(error));
        this.client = c;
    }

    private connected(): void {
        this.log.debug(`Connected to ${this.cfg.broker_url}`);
        this.subscriptions.forEach((sub) => { // Resubscribe
            this.client.subscribe(sub.topic, {qos: 0}, (error, granted) => {
                if (error) {
                    this.log.warn(`Subscribe to ${sub.topic} failed. Reasaon ${error}`);
                } else {
                    let g: Mqtt.Granted = (<any>granted)[0];
                    this.log.debug(`Subscribed to ${g.topic} -> qos=${g.qos}`);
                }
            });
        });
    }

    private dispatch(topic: string, payload: string, packet: Mqtt.Packet): void {
        this.log.debug(`Message ${topic} -> ${payload}`);
        let msg: Message = JSON.parse(payload);
        this.processors.process(topic, msg);
    }

    private offline(): void {
        this.log.warn(`Offline`);
    }

    private reconnect(): void {
        this.log.debug(`Reconnecting to ${this.cfg.broker_url}`);
    }

    private closed(error: Error): void {
        this.log.debug(`Connection to ${this.cfg.broker_url} closed. Reason ${error.message}`)
    }

    private error(error: Error): void {
        this.log.warn(`Connection to ${this.cfg.broker_url} error. Reason ${error.message}`);
    }

    stop(): void {
        if (this.client) {
            this.client.end();
            this.client = null;
            this.log.info(`Stopped message receiver from ${this.cfg.broker_url}`);
        }
    }

    subscribe(topic: Topic, processor: MessageProcessor<any>): Subscription {
        let sub = new __SubscriptionImpl(Uuid(), topic, processor, this);
        this.subscriptions.add(topic, sub);
        this.processors.add(topic, processor);
        if (this.client && this.subscriptions.size(topic) === 1) { // If its the first subscription
            // Try to subscribe if currently not connected subscriptions will be done once connected
            this.client.subscribe(topic, {qos: 0}, (error, granted) => {
                if (error) {
                    this.log.debug(`Subscribe to ${topic} failed. Reason ${error}`);
                } else {
                    let g: Mqtt.Granted = (<any>granted)[0];
                    this.log.debug(`Subscribed ${g.topic} -> qos=${g.qos}`);
                }
            });
        }
        return sub;
    }

    __unsubscribe(sub: __SubscriptionImpl): Subscription {
        let removed = this.subscriptions.remove(sub.topic, sub);
        this.processors.remove(sub.topic, sub.processor);
        if (this.client && removed && this.subscriptions.size(sub.topic) === 0) { // If it was the last subscription
            this.client.unsubscribe(sub.topic, {}, (error, granted) => {
                if (error) {
                    this.log.debug(`Unsubscribe from ${sub.topic} failed. Reason ${error}`);
                } else {
                    this.log.debug(`Unsubscribed from ${granted.topic} -> qos=${granted.qos}`);
                }
            });
        }
        return null;
    }
}

class __SubscriptionImpl implements Subscription {
    constructor(readonly id: SubscriptionId,
                readonly topic: Topic,
                readonly processor: MessageProcessor<any>,
                private readonly delegate: MessageReceiver) {
    }

    unsubscribe(): Subscription {
        return this.delegate.__unsubscribe(this);
    }
}

class Subscriptions {
    private readonly subscriptions: Map<Topic, Set<Subscription>>;

    constructor() {
        this.subscriptions = new Map();
    }

    add(topic: Topic, sub: Subscription): boolean {
        let active = this.subscriptions.get(topic);
        if (!active) {
            active = new Set();
            this.subscriptions.set(topic, active);
        }
        if (active.has(sub)) {
            return false;
        }
        active.add(sub);
        return true;
    }

    remove(topic: Topic, sub: Subscription): boolean {
        let active = this.subscriptions.get(topic);
        if (!active) {
            return false;
        }
        if (!active.has(sub)) {
            return false;
        }
        active.delete(sub);
        if (active.size === 0) {
            this.subscriptions.delete(topic);
        }
        return true;
    }

    size(topic: Topic): number {
        let active = this.subscriptions.get(topic);
        return active ? active.size : 0;
    }

    forEach(callbackfn: (sub: Subscription) => void): void {
        for (let active of this.subscriptions.values()) {
            active.forEach(callbackfn);
        }
    }
}

// TODO maintain topic tree
class Processors {
    private readonly log = LoggerFactory.get(LOGGER_NAME);
    private processors: Set<MessageProcessor<any>>;

    constructor() {
        this.processors = new Set();
    }

    add(topic: Topic, processor: MessageProcessor<any>): void {
        this.processors.add(processor);
    }

    remove(topic: Topic, processor: MessageProcessor<any>): void {
        this.processors.delete(processor);
    }

    process(topic: Topic, msg: Message): void {
        this.processors.forEach((p) => {
            try {
                p.process(topic, msg)
            } catch (error) {
                this.log.warn(`Uncaught processor exception ${error}`);
            }
        })
    }
}