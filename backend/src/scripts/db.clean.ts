import * as r from "rethinkdb";
import * as DBCFG from "./db.config";

function closeAndExit(con: r.Connection, exit = 0) {
    con.close()
        .then(res => {
            console.log(`Connection to db closed`);
            process.exit(exit);
        })
        .catch(err => {
            console.log(`Problem closing connection. Reason ${err}`);
            process.exit(exit)
        });
}

function dropDb(con: r.Connection) {
    r.dbDrop(DBCFG.DB_NAME).run(con)
        .then(res => {
            closeAndExit(con);
        })
        .catch(err => {
            closeAndExit(con);
        });
}

r.connect({host: DBCFG.HOST, port: DBCFG.PORT})
    .then(con => {
        dropDb(con);
    }).catch(err => {
    console.error(`Problem connecting to db. Reason ${err}`);
    process.exit(1);
});