import {Connection, Topic, OnMessage, Subscription} from "./messagebus.service";
import * as SockJS from "sockjs-client";
import {Message} from "@catherd/api/web";
import Stomp = require("stompjs");

export class StompConnection implements Connection {
    constructor(private readonly url: string) {
    }

    private client: Stomp.Client;

    connect(): void {
        let sock: WebSocket = <any>SockJS(this.url);
        this.client = Stomp.over(sock);
        this.client.connect('', '',
            (frame) => {
                console.log(``);
            },
            (error) => {
                console.log(``);
            })
    }

    send(topic: string, message: Message): void {
        if (!this.client) {
            throw new Error('Not connected');
        }
        this.client.send(topic, {}, JSON.stringify(message));
    }

    subscribe(topic: Topic, callback: OnMessage): Subscription {
        if (!this.client) throw new Error('Not connected');
        return this.client.subscribe(topic, (msg) => callback(topic, JSON.parse(msg.body)));
    }

    unsubscribe(sub: any): void {
        if (!this.client)throw new Error('Not connected');
        sub.unsubscribe();
    }

    close(): void {
        if (this.client) {
            this.client.disconnect(() => {
            });
        }
    }
}