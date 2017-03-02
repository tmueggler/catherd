import * as r from "rethinkdb";
import * as dbcfg from "../../main/db/db.config";

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
    r.dbDrop(dbcfg.DB_NAME).run(con)
        .then(res => {
            closeAndExit(con);
        })
        .catch(err => {
            closeAndExit(con);
        });
}

r.connect({host: dbcfg.HOST, port: dbcfg.PORT})
    .then(con => {
        dropDb(con);
    }).catch(err => {
    console.error(`Problem connecting to db. Reason ${err}`);
    process.exit(1);
});