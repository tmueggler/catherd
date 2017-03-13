import {TemporalValue} from "./temporal.value";
import {DbService} from "../db/db.service";
import * as r from "rethinkdb";
import * as DBCFG from "../db/db.config";

export class GatewayPersistedRepo {
    constructor(private readonly db: DbService) {
    }

    all(): Promise<GatewayPersisted[]> {
        return this.db.run(
            r.table(DBCFG.TABLE_GATEWAY)
        ).then((cursor) => {
            return cursor.toArray()
        });
    }

    get(uuid: string): Promise<GatewayPersisted> {
        return this.db.run(
            r.table(DBCFG.TABLE_GATEWAY).get(uuid)
        );
    }

    create(data: GatewayPersisted): Promise<any> {
        return this.db.run(
            r.table(DBCFG.TABLE_GATEWAY).insert(data, {conflict: 'error'})
        );
    }

    update(data: GatewayPersisted): Promise<any> {
        return this.db.run(
            r.table(DBCFG.TABLE_GATEWAY).update(data)
        );
    }

    delete(uuid: string): Promise<any> {
        return this.db.run(
            r.table(DBCFG.TABLE_GATEWAY).get(uuid).delete()
        );
    }
}

export interface GatewayPersisted {
    readonly uuid: TemporalValue<string>;
    readonly version: TemporalValue<string>;
    readonly authorized: TemporalValue<boolean>;
}