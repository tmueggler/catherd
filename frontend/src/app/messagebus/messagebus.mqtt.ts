import {Connection, Topic, OnMessage, Subscription} from "./messagebus.service";
import {Message} from "@catherd/api/web";
import * as Mqtt from "mqtt";

export class MqttConnection implements Connection {
    constructor(private readonly url: string) {
    }

    private client: Mqtt.Client;

    connect(): void {
        this.client = Mqtt.connect(this.url);
        this.client.on('connect', (pkg: Mqtt.Packet) => this.mqttConnect(pkg));
        this.client.on('message', (topic: string, payload: string, pkg: Mqtt.Packet) => this.mqttMessage(topic, payload, pkg))
        this.client.on('close', () => this.mqttClose());
        this.client.on('error', (error: any) => this.mqttError(error));
        this.client.on('offline', () => this.mqttOffline());
        this.client.on('reconnect', () => this.mqttReconnect());
    }

    private mqttConnect(pkg: Mqtt.Packet): void {
        console.log(`Mqtt connected to ${this.url}`);
    }

    private mqttMessage(topic: string, payload: string, pkg: Mqtt.Packet): void {
        console.log(`Mqtt message: ${topic} -> ${payload}`)
        let msg = JSON.parse(payload);
        this.fireMessage(topic, msg);
    }

    private mqttClose(): void {
        console.log(`Mqtt closed`);
    }

    private mqttError(error: any): void {
        console.warn(`Mqtt error: ${error}`);
    }

    private mqttOffline(): void {
        console.log(`Mqtt offline`)
    }

    private mqttReconnect(): void {
        console.log(`Mqtt reconnect`)
    }

    send(topic: Topic, msg: Message): void {
        if (!this.client) throw new Error();
        this.client.publish(topic, JSON.stringify(msg));
    }

    private onmessage: OnMessage[] = [];

    subscribe(topic: Topic, callback: OnMessage): Subscription {
        if (!this.client) throw new Error();
        this.client.subscribe(topic);
        this.onmessage.push(callback);
        return new MqttSubscription(this, topic, callback);
    }

    unsubscribe(topic: Topic, callback: OnMessage): void {
        if (!this.client)throw new Error();
        this.client.unsubscribe(topic);
        let idx = this.onmessage.indexOf(callback);
        if (idx > -1) {
            this.onmessage.splice(idx, 1);
        }
    }

    private fireMessage(topic: Topic, msg: Message): void {
        this.onmessage.forEach((on) => {
            try {
                on(topic, msg);
            } catch (e) {
                console.warn(`Uncaught message handler exception ${e}`);
            }
        });
    }

    close(): void {
        if (this.client) {
            this.client.end();
            this.client = null;
        }
    }
}

class MqttSubscription implements Subscription {
    constructor(private readonly connection: MqttConnection,
                private readonly topic: Topic,
                private readonly callback: OnMessage) {
    }

    unsubscribe(): void {
        this.connection.unsubscribe(this.topic, this.callback);
    }
}