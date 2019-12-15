const MongoClient = require("mongodb").MongoClient;
const _connect = (url, database, callback) => { //定义函数，最后参数为传入的实参回调函数，主要作用：1、传递定义时的返回数据给回调，供调用处使用；2、供调用处，另行定义回调函数，扩展执行本函数后的其他功能。
    MongoClient.connect(url, (err, client) => {
        if (!err) {
            let db = client.db(database);
            callback(client, db); //通过执行回调，将数据传给回调函数
        } else {
            console.log(err);
        };
    })
}

function DB(database, url = "mongodb://127.0.0.1:27017") { //默认值参数放在尾部，当认可默认值时，调用时可省略。
    this.url = url;
    this.database = database;
}

DB.prototype = {
    //获取数据
    find(collection, cond1, cond2, cb) { //统一将回调参数放最后，更清晰些。
        _connect(this.url, this.database, (client, db) => {
            let coll = db.collection(collection);
            let result = coll.find(cond1);
            let { limit, skip } = cond2; //对象解构赋值，通过解构能有效减少函数参数个数，增加函数灵活性
            if (limit) {
                result = result.limit(limit);
            }
            if (skip) {
                result = result.skip(skip);
            };

            result.toArray((err, data) => { //result Cursor对象，有toArray(cb)方法与each(data)方法
                if (!err) {
                    result.count().then((count) => {
                        cb(data, count); //将本函数处理后数据，通过执行本函数的传入的参数回调，传入或返回给调用处使用。
                    })
                } else {
                    console.log(err);
                }
                client.close();
            });
        });
    },
    //获取数据
    insert(collection, data, cb) {
        _connect(this.url, this.database, (client, db) => {
            let coll = db.collection(collection);
            coll.insert(data, (err) => {
                if (!err) {
                    cb();
                } else {
                    console.log(err);
                }
                client.close();
            });
        });

    },
    //获取数据
    update() {

    },
    //获取数据
    delete() {

    }
}

module.exports = DB;