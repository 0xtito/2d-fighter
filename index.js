var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.use(express.static(__dirname + "/game"));

app.listen(3000, () => {
  console.log(`listening on port 3000`);
});
