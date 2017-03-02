import {Server as HttpServer} from "http";
import {Server, createServer, Connection} from "sockjs";
import {Message, MessageType, SignIn, SignOut} from "@catherd/api/node";

export class MessageBus {
    private server: Server;
    private connectionHandler: MessageBusConnectionHandler;

    start(http: HttpServer) {
        if (this.server) {
            return;
        }
        let s: Server = createServer();
        s.on('connection', this.newConnection.bind(this));

        let dispatcher = new DispatchingMessageHandler();
        this.connectionHandler = new MessageBusConnectionHandler(dispatcher);

        s.installHandlers(http, {prefix: '/eventbus'});
        this.server = s;
    }

    private newConnection(con: Connection) {
        new MessageBusConnection(con, this.connectionHandler);
    }

    stop() {
        if (!this.server) {
            return;
        }
    }
}

class MessageBusConnection {
    constructor(private readonly con: Connection, private readonly handler: MessageBusConnectionHandler) {
        con.on('data', this.ondata.bind(this));
        con.on('close', this.onerror.bind(this));
        con.on('error', this.onclose.bind(this));
    }

    uuid: string;

    private ondata(msg: string) {
        let message: Message = JSON.parse(msg);
        this.handler.handle(this, message);
    }

    private onerror(err: any) {
        this.handler.error(this, err);
    }

    private onclose() {
        this.handler.close(this);
    }

    public send(msg: Message) {
        this.con.write(JSON.stringify(msg));
    }

    public close() {
        this.con.close();
    }
}

class MessageBusConnectionHandler {
    private connections: Map<string, MessageBusConnection> = new Map();

    constructor(private readonly handler: MessageHandler<any>) {
    }

    handle(con: MessageBusConnection, msg: Message) {
        try {
            switch (msg.type) {
                case SignIn.TYPE:
                    this.interceptSignIn(con, msg as SignIn);
                    break;
                case SignOut.TYPE:
                    this.interceptSignOut(con, msg as SignOut);
                    break;
                default:
                    this.handleMessage(con, msg);
                    break;
            }
        } catch (err) {
            console.warn(`Uncaught message handler error. ${err}`);
        }
    }

    private interceptSignIn(src: MessageBusConnection, msg: SignIn) {
        let uuid = msg.from;
        let existing = this.connections.get(uuid);
        if (existing) {
            if (existing !== src) {
                throw Error(`Only one connection allowed per uuid`);
            }
            return; // No need to sign in again
        }
        src.uuid = uuid;
        this.connections.set(uuid, src);
        this.handleMessage(src, msg);
    }

    private interceptSignOut(src: MessageBusConnection, msg: SignOut) {
        let uuid = msg.from;
        let existing = this.connections.get(uuid);
        if (!existing) {
            throw Error(`No connection found for uuid`);
        } else if (existing !== src) {
            throw Error(`Invalid connection uuid`);
        }
        try {
            this.handleMessage(src, msg);
        } finally {
            this.connections.delete(uuid);
        }
    }

    private handleMessage(src: MessageBusConnection, msg: Message) {
        let res = this.handler.handle(msg);
        if (!res) {
            return;
        } else if (!res.to || res.to.length === 0) {
            throw Error(`Response message to: not set`);
        }
        let dst = this.connections.get(res.to);
        if (!dst) {
            throw Error(`To destination not found`);
        }
        dst.send(res);
    }

    error(con: MessageBusConnection, err: any) {
        try {
            con.close();
        } catch (err) {
            console.log(`Connection close on error failed. Reason ${err}`);
        } finally {
            this.connections.delete(con.uuid);
        }
    }

    close(con: MessageBusConnection) {
        if (con.uuid) {
            this.connections.delete(con.uuid);
            con.uuid = null;
        }
    }
}

class DispatchingMessageHandler implements MessageHandler<any> {
    private handlers: Map<MessageType, MessageHandler<any>> = new Map();

    register(type: MessageType, handler: MessageHandler<any>): void {
        this.handlers.set(type, handler);
    }

    handle(msg: Message): Message {
        if (!msg) {
            return null;
        }
        let h: MessageHandler<Message> = this.handlers.get(msg.type);
        if (!h) {
            return msg; // Message will be forwarded
        }
        return h.handle(msg);
    }
}

export interface MessageHandler<M> {
    handle(msg: M): Message;
}
