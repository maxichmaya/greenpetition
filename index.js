const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const db = require("./utils/db");
const bc = require("./utils/db");
var cookie = require("cookie");
const bodyParser = require("body-parser");
var cookieSession = require("cookie-session");
const csurf = require("csurf");
const helmet = require("helmet");
var bcrypt = require("./utils/bc");
// const { requireLoggedOut } = require("./middleware");

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);
// BODY-PARSER extract the entire body portion of an incoming request stream and exposes it on req.body.
app.use(
    require("body-parser").urlencoded({
        extended: false
    })
);
app.use(helmet());
app.use(csurf());

app.use(function(req, res, next) {
    res.set("x-frame-options", "deny");
    next();
});

app.use(function(req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});

//  HANDLEBARS
app.engine(
    "handlebars",
    handlebars({
        defaultLayout: "main"
    })
);
app.set("view engine", "handlebars");

// Static is serving static files
app.use(express.static("./public"));

app.get("/", (req, res) => {
    res.redirect("/register");
});

//register GET
app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main"
    });
});

//login GET
app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main"
    });
});

//profile GET
app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main"
    });
});

// welcome GET
app.get("/welcome", (req, res) => {
    res.render("welcome", {
        layout: "main"
    });
});

// gratitude GET
app.get("/gratitude", (req, res) => {
    db.NumOfSigners()
        .then(total => {
            return db.getImage(req.session.id).then(results => {
                console.log("results: ", results);
                res.render("gratitude", {
                    total: total.rows[0].count,
                    show: results.rows[0].signature,
                    name: results.rows[0].name
                });
            });
        })
        .catch(err => {
            console.log("err: ", err);
            res.sendStatus(500);
        });
});

// edit GET
app.get("/edit", (req, res) => {
    db.editData(req.session.id).then(results => {
        res.render("edit", {
            layout: "main",
            userInfo: results.rows
        });
    });
});

// signerslist GET
app.get("/signerslist", (req, res) => {
    db.getUsers()
        .then(results => {
            console.log("results: ", results.rows);
            res.render("signerslist", {
                signers: results.rows
            });
        })
        .catch(err => {
            console.log("err: ", err);
            res.sendStatus(500);
        });
});

// city GET
app.get("/signerslist/:city", (req, res) => {
    db.getCity(req.params.city)
        .then(results => {
            res.render("city", {
                signers: results.rows,
                city: req.params.city
            });
        })
        .catch(err => {
            console.log("err: ", err);
            res.sendStatus(500);
        });
});

// logout GET
app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/register");
});

//  register POST
app.post("/register", (req, res) => {
    if (
        req.body.name == "" ||
        req.body.surname == "" ||
        req.body.email == "" ||
        req.body.password == ""
    ) {
        res.render("register", { fillInMessage: true });
    } else {
        bcrypt
            .hashPassword(req.body.password)
            .then(hash => {
                db.signersName(
                    req.body.name,
                    req.body.surname,
                    req.body.email,
                    hash
                ).then(results => {
                    req.session.id = results.rows[0].id;
                    console.log("req.session:", req.session);
                    res.redirect("/profile");
                });
            })
            .catch(err => {
                console.log("err ", err);
                res.sendStatus(500);
            });
    }
});

// login POST
app.post("/login", (req, res) => {
    console.log("req.body: ", req.body);
    if (req.body.email == "" || req.body.password == "") {
        res.render("login", { fillInMessage: true });
    }
    db.loginEmail(req.body.email)
        .then(emailPass => {
            console.log("emailPass.rows:", emailPass.rows);
            if (emailPass.rows.length == 0) {
                res.render("login", {
                    fillInMessage: true
                });
            } else {
                req.session.id = emailPass.rows[0].id;
                console.log("req.session.id :", req.session.id);
                return bcrypt
                    .checkPassword(
                        req.body.password,
                        emailPass.rows[0].password
                    )
                    .then(results => {
                        console.log("results: ", results);
                        if (!results) {
                            res.render("login", {
                                fillInMessage: true
                            });
                        }
                        if (results) {
                            return db
                                .checkIfSignture(req.session.id)
                                .then(data => {
                                    if (data.rows[0].signature == null) {
                                        res.redirect("/welcome");
                                    } else {
                                        req.session.sigId = true;
                                        res.redirect("gratitude");
                                    }
                                })
                                .catch(err => {
                                    console.log("err:", err);
                                });
                        }
                    })
                    .catch(err => {
                        console.log("check pass", err);
                    });
            }
        })
        .catch(err => {
            console.log("get pass", err);
        });
});

// profile POST
app.post("/profile", (req, res) => {
    if (!req.body.url.startsWith("http")) {
        req.body.url = "http://" + req.body.url;
    }
    console.log("req.body :", req.body);
    console.log("req.session :", req.session.id);
    db.profileInfo(
        req.body.age || null,
        req.body.city,
        req.body.url,
        req.session.id
    )
        .then(() => {
            res.redirect("/welcome");
        })
        .catch(err => {
            console.log("get pass this too", err);
        });
});

// welcome POST
app.post("/welcome", (req, res) => {
    if (req.body.signature.length == 0) {
        res.render("welcome", { fillInMessage: true });
    } else {
        return db
            .signaturePhoto(req.body.signature, req.session.id)
            .then(results => {
                req.session.sigId = true;
                res.redirect("/gratitude");
            })
            .catch(err => {
                console.log("err: ", err);
                res.sendStatus(500);
            });
    }
});

// edit POST
app.post("/edit", (req, res) => {
    if (req.body.age == "") {
        req.body.age = null;
    } else if (req.body.password != "") {
        bcrypt
            .hashPassword(req.body.password)
            .then(hash => {
                return db
                    .editUserWithPassword(
                        req.body.name,
                        req.body.surname,
                        req.body.email,
                        hash,
                        req.session.id
                    )
                    .then(() => {
                        return db.editUserProfile(
                            req.body.age,
                            req.body.city,
                            req.body.url,
                            req.session.id,
                            res.redirect("/signerslist")
                        );
                    });
            })
            .catch(err => {
                console.log("err SOMETHING IS WRONG: ", err);
                res.render("edit", {
                    error: "error"
                });
            });
    } else {
        db.editUserWithoutPassword(
            req.body.name,
            req.body.surname,
            req.body.email,
            req.session.id
        )
            .then(() => {
                return db.editUserProfile(
                    req.body.age,
                    req.body.city,
                    req.body.url,
                    req.session.id,
                    res.redirect("/signerslist")
                );
            })
            .catch(err => {
                console.log("err NO PASSWORD: ", err);
                res.render("edit", {
                    error: "error"
                });
            });
    }
});

app.listen(process.env.PORT || 8080, () => console.log("Saturday"));
