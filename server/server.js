const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const PRIVATE_KEY = "private_key";
const path = require("path");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(require("cors")({
    origin: "*"
}));
app.use(require("cookie-parser")());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../client/views"));

const users = [];

app.get("/", (req, res) => {
    const { token } = req.cookies;
    if (typeof token !== "undefined") {
        jwt.verify(token, PRIVATE_KEY, (err, decoded) => {
            if (!err) {
                return res.render("user", { "user": decoded });
            } else res.clearCookie("token");
        })
    }
    res.sendFile(path.join(__dirname, "../client/index.html"));
})

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const findedUser = users.find(i => i.username === username);
    if (!findedUser) return res.json({
        error: true,
        message: "User not found"
    });
    if (findedUser.password !== password) return res.json({
        error: true,
        message: "Password not correct"
    });
    const token = jwt.sign(findedUser, PRIVATE_KEY, {
        expiresIn: "2m"
    });
    res.cookie("token", token, {
        httpOnly: true
    });
    res.json({
        message: "Login success"
    });
});

app.post("/register", (req, res) => {
    const { username, password } = req.body;
    const lastInsertedId = users[users.length - 1]?.id || 0;
    console.log(lastInsertedId);
    users.push({
        id: lastInsertedId,
        username,
        password,
        biography: `${username} default biography`
    });
    res.json({
        message: "Register success"
    })
})

app.get("/user", (req, res) => {
    const { token } = req.cookies;
    if (typeof token === "undefined") return res.status(401).json({
        message: "Forbidden Authentication failed"
    })
    jwt.verify(token, PRIVATE_KEY, (err, decoded) => {
        if (err) throw err;
        res.json(decoded);
    })
});

app.get("/updateBio/:bio", (req, res) => {
    const { token } = req.cookies;
    if (typeof token === "undefined") return res.json({
        message: "Forbidden Authentication failed"
    })
    jwt.verify(token, PRIVATE_KEY, (err, decoded) => {
        if (err) throw err;
        console.log(users.find(i => i.username === decoded.username));
        users.find(i => i.username === decoded.username).biography = req.params.io;
        res.json("Başarıyla değiştirildi")
    })
    res.json("test")
});

app.listen(80, () => console.log("Server listening on 80 PORT"));