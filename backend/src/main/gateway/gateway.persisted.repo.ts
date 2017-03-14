import {TemporalValue, DefaultTemporalValue} from "./temporal.value";
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
            return mapAll(cursor.toArray())
        });
    }

    get(uuid: string): Promise<GatewayPersisted> {
        return this.db.run(
            r.table(DBCFG.TABLE_GATEWAY).get(uuid)
        ).then((row) => {
            return map(row)
        });
    }

    create(data: GatewayPersisted): Promise<any> {
        this.validate(data);
        return this.db.run(
            r.table(DBCFG.TABLE_GATEWAY).insert(data, {conflict: 'error'})
        );
    }

    update(data: GatewayPersisted): Promise<any> {
        this.validate(data);
        return this.db.run(
            r.table(DBCFG.TABLE_GATEWAY).update(data)
        );
    }

    delete(uuid: string): Promise<any> {
        return this.db.run(
            r.table(DBCFG.TABLE_GATEWAY).get(uuid).delete()
        );
    }

    private validate(data: GatewayPersisted): void {
        if (!data.id) throw new Error('Property id must be set');
        if (!data.uuid || !data.uuid.value) throw new Error('Property uuid must be set');
        if (data.id !== data.uuid.value)throw new Error('Property id must be equal to uuid');
    }
}

export interface GatewayPersisted {
    id: string,
    readonly uuid: TemporalValue<string>;
    readonly version: TemporalValue<string>;
    readonly authorized: TemporalValue<boolean>;
}

function mapAll(rows: GatewayPersisted[]): GatewayPersisted[] {
    return rows ? rows.map(map) : null;
}

function map(row: GatewayPersisted): GatewayPersisted {
    if (!row) return null;
    Reflect.setPrototypeOf(row.uuid, new DefaultTemporalValue());
    Reflect.setPrototypeOf(row.version, new DefaultTemporalValue());
    Reflect.setPrototypeOf(row.authorized, new DefaultTemporalValue());
    return row;
}