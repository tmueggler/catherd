import {DbService} from "./db.service";
import * as DBCFG from "./db.config";
import * as r from "rethinkdb";

export class RegistrationService {
    constructor(private db: DbService) {
    }

    register(uuid: string): Promise<void> {
        return this.db.run(
            r.db(DBCFG.DB).table(DBCFG.TABLE_GATEWAY).insert({uuid: uuid, state: 'CONNECTED'})
        );
    }

    deregister(uuid: string): Promise<void> {
        return null;
    }
}