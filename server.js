const express = require("express");
const app = new express();
const body_parser = require("body-parser");
const DB = require("./modules/DB");
const db = new DB("travel"); //省略了第二个能数url,使用默认值

app.listen(8888);

app.set("view engine", "ejs");
app.use(express.static("static"));

app.use(body_parser.urlencoded({ extended: false }))
    //let bodyParse = body_parser.urlencoded({ extended: false });


app.get("/", (req, res) => {
    db.find("articles", {}, {}, (articles) => {
        let data = articles[0];
        db.find("pros", {}, { limit: 4 }, (pros) => {
            data.pros = pros;
            res.render("index", data);
        })
    })
})

app.get("/pro_list", (req, res) => {
    /* 分页五大变量：1.当前页(get传参或默认值)；2.每页数量(预设值,limit)；3. 每页起始值(根据当前页与每页数量计算所得，注意起始页的初值是0或1的区别，skip)
                    4.总记录数量，任何查询结果数附加count()函数得到【result.count().then((count)=>{})】；5.总页数(根据总记录数量与每页数量计算所得)。
                    其中：当前页为页面传入或默认值，每页数量为预设的默认值；每页数量与每页起始值需要作为参数传给数据层处理；总的记录数量(及其他数据)
                    由数据层返回；数据、总页数、当前页需要返回前端页面*/
    let page_count = 8,
        cur_page = req.query.page || 1,
        cond2 = {
            limit: page_count,
            skip: (cur_page - 1) * page_count
        }
    db.find("pros", {}, cond2, (pros, count) => { //回调函数参数个数的多态
        res.render("pro_list", { pros, pages: Math.ceil(count / page_count), cur_page }); //注意返回值的数据形态
    })
})

app.get("/booking", (req, res) => {
    let pro_id = req.query.pro_id;
    if (!pro_id) {
        pro_id = "p1"
    }

    db.find("pros", { pro_id: pro_id }, {}, (pros) => {
        res.render("booking", pros[0]); //注意返回值的数据形态，单条记录，提前处理一下！
    })
})

app.post("/booking", (req, res) => {
    let data = req.body;
    db.insert("pro_order", data, () => {
        res.send({ code: 200 }) //写在回调中，表示已处理完毕后的再处理。 
    });
})