import {Injectable} from "@angular/core";
import {Configuration} from "./app.config";

@Injectable()
export class EventBus {
    private socket: SocketIOClient.Socket;

    constructor(private cfg: Configuration.AppCfg) {
    }

    start() {
        if (this.socket != null && this.socket.connected) {
            return;
        }
        this.socket = io(
            this.cfg.socketIo.url,
            {transports: ['websocket', 'polling']}
        );
        let self = this;
        this.socket.on('connect', function (this: SocketIOClient.Socket) {
            console.debug(`Connected to ${this.io.uri}`);
            self.connected();
        });
        this.socket.on('disconnect', function (this: SocketIOClient.Socket) {
            console.debug(`Disconnected from ${this.io.uri}`);
            self.disconnected();
        });
    }

    private connected() {
    }

    private disconnected() {
    }

    stop() {
        if (this.socket === null) {
            return;
        }
        this.socket.close();
    }
}