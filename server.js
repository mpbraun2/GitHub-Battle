var express = require('express');
var path = require("path");
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "./client"))); // This line will open index.html, will automatically know that index.html is the main page!!!
app.use(express.static(path.join(__dirname, "./bower_components")));
app.use(express.static(path.join(__dirname, "./node_modules")));

mongoose.connect('mongodb://localhost/GitHubBattleDB', function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Connected to Mongoose");
    }
});

var Schema = mongoose.Schema;

//db.createCollection("users")
var usersSchema = new Schema({
    name: { type: String, required: true, minlength: 3 },
    username: { type: String, required: true, minlength: 3 },
    score: { type: Number, required: true },
    avatar_url: { type: String, required: true, minlength: 3 },
}, { timestamps: true });

//show collections
mongoose.model('Users', usersSchema);
var Users = mongoose.model('Users');

mongoose.Promise = global.Promise;

var users = {
    index: function (req, res) {
        var promise = Users.find({}).sort({ score: -1 }).exec();
        promise.then(function (users) {
            console.log("find all users: success!");
            res.json({ users: users, errors: [] });
        }).catch(function (err) {
            console.log('find all users: error!', err);
            res.json({ users: [], errors: err });
        });
    },
    new_user: function (req, res) {
        var promise = Users.findOne({$or:[{ username: req.body.username }]});
        promise.then(function (user) {
            if (user) {
                console.log("user:",user);
                console.log("existing user: success!");
                res.json({ message: "success!" });
            }
            else {
                var newUser = new Users({
                    username: req.body.username,
                    name: req.body.name,
                    score: req.body.score,
                    avatar_url: req.body.avatar_url
                });
                console.log("SAVE username",newUser.username);
                console.log("SAVE name",newUser.name);
                console.log("SAVE score",newUser.score);
                console.log("SAVE avatar_url",newUser.avatar_url);
                var promise = newUser.save();
                promise.then(function (user) {
                    console.log("new user: success!");
                    res.json({ message: "success!" });
                }).catch(function (err) {
                    console.log("new user: error!",err);
                    res.json({ message: "error!" });
                });
            }
        }).catch(function (err) {
            console.log("find first user: error!", err);
            res.json({ errors: err });
        });
    }
}

app.get('/api', users.index);
app.post("/api/user", users.new_user);

app.listen(4200, function () {
    console.log("coming to you live on port 4200");
});