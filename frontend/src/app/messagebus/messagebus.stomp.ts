import {Connection, Topic} from "./messagebus.service";
import * as SockJS from "sockjs-client";
import {Message} from "@catherd/api/web";
import Stomp = require("stompjs");

export class StompConnection implements Connection {
    private client: Stomp.Client;

    connect(url: string): void {
        let sock: WebSocket = <any>SockJS(url);
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

    subscribe(topic: Topic, callback: (msg: Message) => void) {
        if (!this.client) {
            throw new Error('Not connected');
        }
        this.client.subscribe(topic, (msg) => callback(JSON.parse(msg.body)));
    }

    close(): void {
        if (this.client) {
            this.client.disconnect(() => {
            });
        }
    }
}