global.__rootdir = __dirname;

const express = require("express");
const bodyParser = require("body-parser");
const autoprefixer = require('express-autoprefixer');
const lessMiddleware = require('less-middleware');

const {addTime, getTimes, removeTag, addTag, getTags} = require(__dirname + "/db/index.js")

const PORT = process.env.PORT || 3000;

const app = express();
app.set("trust proxy", "127.0.0.1");
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: false}));

const staticPath = __dirname + '/public';
app.use(lessMiddleware(staticPath));
app.use(autoprefixer({browsers: ["last 3 versions", "> 1%"], cascade: false}));
app.use(express.static(staticPath));

app.get("/api/:name", async (req, res) => {
  const tags = await getTags(req.params.name);
  res.send(tags);
});

app.get("/api/:name/:tag", async (req, res) => {
  const times = await getTimes(req.params.name, req.params.tag, req.query.lim || 0);

  res.send(times);
})

app.delete("/api/:name/:tag", async (req, res) => {
  await removeTag(req.params.name, req.params.tag);

  res.end();
});

app.post("/api/:name/:tag", async (req, res) => {
  await addTag(req.params.name, req.params.tag);
  res.end();
});

app.post("/api/addTime/:name/:tag", async (req, res) => {
  const {opt, time} = req.body;

  await addTime(req.params.name, req.params.tag, opt, time);
  res.end();
});

app.get("/:name", (req, res) => res.render("index", {
  username: req.params.name
}));
app.get("/render/:name", (req, res) => res.render("render", {
  username: req.params.name
}));

app.get("/", (req, res) => res.redirect("/default"));

app.listen(PORT, () => console.log(`Started server at port ${PORT}`));
