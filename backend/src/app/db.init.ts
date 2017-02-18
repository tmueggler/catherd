import * as r from "rethinkdb";
import * as dbcfg from "./db.config";

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
    db.tableCreate(dbcfg.TABLE_GATEWAY).run(con)
        .then((res) => {
            console.info(`Created table ${dbcfg.TABLE_GATEWAY}`);
            closeAndExit(con);
        })
        .catch((err) => {
            console.error(`Problem creating table ${dbcfg.TABLE_GATEWAY}. Reason ${err}`)
            closeAndExit(con);
        });
}

function initDb(con: r.Connection) {
    r.dbCreate(dbcfg.DB).run(con)
        .then((res) => {
            console.info(`Created db ${dbcfg.DB}`);
            initTables(con, r.db(dbcfg.DB));
        })
        .catch((err) => {
            console.info(`Failed to create db ${dbcfg.DB}. Reason: ${err}`);
            initTables(con, r.db(dbcfg.DB));
        });
}

function init(con: r.Connection) {
    initDb(con);
}

r.connect({host: dbcfg.HOST, port: dbcfg.PORT})
    .then((con) => {
        console.info(`Connection to ${dbcfg.HOST}:${dbcfg.PORT} open`);
        init(con);
    })
    .catch((err) => {
        console.error(`Problem opening connection. Reason ${err}`);
        process.exit(1);
    });