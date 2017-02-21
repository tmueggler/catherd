import * as r from "rethinkdb";
import * as DBCFG from "../db.config";

function closeAndExit(con: r.Connection, exit = 0) {
    con.close()
        .then(res => {
            console.info(`Connection to db closed`);
            process.exit(exit);
        })
        .catch(err => {
            console.error(`Problem closing connection. Reason ${err}`);
            process.exit(exit);
        });
}

function initTables(con: r.Connection, db: r.Db) {
    db.tableCreate(DBCFG.TABLE_GATEWAY, {primary_key: DBCFG.TABLE_GATEWAY_PK}).run(con)
        .then((res) => {
            console.info(`Created table ${DBCFG.TABLE_GATEWAY}`);
            closeAndExit(con);
        })
        .catch((err) => {
            console.error(`Problem creating table ${DBCFG.TABLE_GATEWAY}. Reason ${err}`)
            closeAndExit(con);
        });
}

function initDb(con: r.Connection) {
    r.dbCreate(DBCFG.DB_NAME).run(con)
        .then((res) => {
            console.info(`Created db ${DBCFG.DB_NAME}`);
            initTables(con, r.db(DBCFG.DB_NAME));
        })
        .catch((err) => {
            console.info(`Failed to create db ${DBCFG.DB_NAME}. Reason: ${err}`);
            initTables(con, r.db(DBCFG.DB_NAME));
        });
}

function init(con: r.Connection) {
    initDb(con);
}

r.connect({host: DBCFG.HOST, port: DBCFG.PORT})
    .then((con) => {
        console.info(`Connection to ${DBCFG.HOST}:${DBCFG.PORT} open`);
        init(con);
    })
    .catch((err) => {
        console.error(`Problem opening connection. Reason ${err}`);
        process.exit(1);
    });