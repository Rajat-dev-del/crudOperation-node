const sqlite3 = require('sqlite3');
const express = require("express");
var cors = require('cors');
var app = express();

const HTTP_PORT = 4003
app.listen(HTTP_PORT, () => {
    console.log("Server is listening on port " + HTTP_PORT);
});

const db = new sqlite3.Database('./index.db', (err) => {
    if (err) {
        console.error("Error opening database " + err.message);
    } else {

        db.run('CREATE TABLE employees( \
            sentance_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,\
            source_lang NVARCHAR(20)  NOT NULL,\
            target_lang NVARCHAR(20),\
            sugestions NVARCHAR(20),\
            page_no INTERGER\
        )', (err) => {
            if (err) {
                console.log("Table already exists.");
            }
            let insert = 'INSERT INTO employees (source_lang, target_lang, sugestions,page_no) VALUES (?,?,?,?)';
            db.run(insert, ["Hello how are you?", "", "hello how are you?", 1]);
            db.run(insert, ["what are you doing?", "", "what are you doing?", 1]);
            db.run(insert, ["whats up?", "", "whats up?", 1]);
        });
    }
});

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/employees/:id", (req, res, next) => {
    var params = [req.params.id]
    db.get(`SELECT * FROM employees where sentance_id = ?`, [req.params.id], (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.status(200).json(row);
    });
});
app.get("/employees", (req, res, next) => {
    db.all("SELECT * FROM employees", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.status(200).json({ rows });
    });
});
app.post("/employees", (req, res, next) => {
    var reqBody = req.body;
    console.log(reqBody);
    db.run(`INSERT INTO employees (source_lang, target_lang, sugestions, page_no) VALUES (?,?,?,?)`, [reqBody.source_lang, reqBody.target_lang, reqBody.sugestions, reqBody.page_no],
        function(err, result) {
            if (err) {
                res.status(400).json({ "error": err.message })
                return;
            }
            res.status(201).json({
                "sentance_id": this.lastID
            })
        });
});
app.patch("/employees/:id", (req, res, next) => {
    var reqBody = req.body;
    console.log(reqBody)
    db.run(`UPDATE employees set source_lang = ?, target_lang = ?, sugestions = ?, page_no = ? WHERE sentance_id = ?`, [reqBody.source_lang, reqBody.target_lang, reqBody.sugestions, reqBody.page_no, req.params.id],
        function(err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.status(200).json({ updatedID: this.changes });
        });
});
app.delete("/employees/:id", (req, res, next) => {
    db.run(`DELETE FROM user WHERE id = ?`,
        req.params.id,
        function(err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.status(200).json({ deletedID: this.changes })
        });
});