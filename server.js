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

io.on("connection", function(socket) {
    var addedUser = false;

    console.log("User Connected");

    // when the client emits 'add user', this listens and executes
    socket.on("add user", username => {
        if (addedUser || numUsers > 25) return;

        // we store the username in the socket session for this client
        socket.username = username;
        ++numUsers;
        addedUser = true;

        // echo globally (all clients) that a person has connected
        socket.broadcast.emit("user joined", {
            username: socket.username,
            numUsers: numUsers
        });
    });

    socket.on("disconnect", function() {
        console.log("User disconnected");
    });
});
