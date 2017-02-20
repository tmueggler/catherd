import {DbService} from "./db.service";
import * as r from "rethinkdb";
import * as DBCFG from "./db.config"

export class GatewayService {
    constructor(private db: DbService) {
    }

    all() {
        return this.db.run(
            r.table(DBCFG.TABLE_GATEWAY)
        ).then((cursor) => {
            return cursor.toArray()
        });
    }

    get(uuid: string) {
        return this.db.run(
            r.table(DBCFG.TABLE_GATEWAY).get(uuid)
        );
    }
}