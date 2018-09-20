var app = require("express")();
var server = require("http").Server(app);
var io = require("socket.io")(server);
var port = process.env.PORT || 3000;

server.listen(port, function() {
    console.log("Listening on " + port);
});

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

var numUsers = 0;
var videoId = "mEU0stNfkxI";
var startTime = 0;
var interval;

io.on("connection", function(socket) {
    var addedUser = false;

    console.log("User Connected");

    if (numUsers == 0) {
        interval = setInterval(() => {
            if (startTime >= 1539) {
                startTime = 0;
            } else {
                startTime++;
            }
        }, 1000);
    }

    socket.emit("video data", {
        id: videoId,
        timestamp: startTime
    });

    // when the client emits 'add user', this listens and executes
    socket.on("add user", username => {
        if (addedUser || numUsers > 25) return;

        // we store the username in the socket session for this client
        socket.username = username;
        ++numUsers;
        addedUser = true;

        // emit globally (all clients) that a person has connected
        socket.broadcast.emit("user joined", {
            username: socket.username,
            numUsers: numUsers
        });
    });

    socket.on("disconnect", function() {
        if (addedUser) {
            --numUsers;

            if (numUsers == 0) {
                clearInterval(interval);
                startTime = 0;
            }

            console.log("User disconnected");

            // emit  globally (all clients) that a person has disconnected
            socket.broadcast.emit("user left", {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });

    socket.on("drawing", data => socket.broadcast.emit("drawing", data));
});
