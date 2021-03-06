import * as r from "rethinkdb";
import * as t from "timers";
import * as DBCFG from "./db.config";
import {LoggerFactory} from "@catherd/logcat/node";

export class DbService {
    private readonly log = LoggerFactory.get('db-service');
    private _reconnect_ms = 1000;
    private _con: r.Connection;

    constructor(private opts: r.ConnectionOptions) {
        this._con = null;
    }

    private checkState() {
        if (this._con === null || !this._con.open) {
            throw new Error("Connection not available");
        }
    }

    start(): DbService {
        if (this._con === null) {
            this._stopped = false;
            this.reconnect(0);
        }
        return this;
    }

    private _reconnect: NodeJS.Timer;

    private reconnect(delay_ms: number) {
        if (this._reconnect !== null) {
            t.clearTimeout(this._reconnect);
        }
        if (this._stopped) {
            return;
        }
        this._reconnect = t.setTimeout(
            () => {
                this.connect();
            }, delay_ms
        );
    }

    private connect() {
        r.connect(this.opts)
            .then((con) => {
                this.log.debug(`Connected to db.`);
                con.use(DBCFG.DB_NAME);
                this._con = con;
            })
            .catch((err) => {
                this.log.warn(`Problem connecting to db. Reason ${err}`);
                this.reconnect(this._reconnect_ms);
            });
    }

    run(cmd: r.Operation<any>): Promise<any> {
        this.checkState();
        return cmd.run(this._con);
    }

    private _stopped: boolean;

    stop() {
        if (this._con === null) {
            return;
        }
        this._con.close((err) => {
            if (err !== null) {
                this.log.warn(`Problem closing db connection. Reason ${err}`);
            }
            this._con = null;
        });
        this._stopped = true;
    }
}