// set up port, express for server
var express = require("express");
const { emit } = require("process");
const { Socket } = require("dgram");
var app = express();
app.use(express.static("./public"));
app.set("view engine", "ejs");// set view de hien home
app.set("views", "./views");

var server = require("http").createServer(app);
var io = require("socket.io")(server);// set up SOCKET.IO
server.listen(process.env.PORT || 2802);

var ArrUser = [];
// listen to creat connection if recieve request
//4 step for login
// Step 1: client send user name to server ----- client_send_username
// Step 2: Server send back when regist failed ----- server_send_failed
// Step 3: Server send back when regist success  ----- server_send_success
// Step 4: Server send list user updated with new client to all clients ------ server_send_broadcast
io.on("connection", function(socket){
    console.log("Connection create with id "+ socket.id);
    //step 1: server listen
    socket.on("client_send_username", function(data_from_client){
        console.log(data_from_client);
        if(ArrUser.indexOf(data_from_client)>=0) // indexOf = InStr
        {
            //Step 2: Server send failed to client
            socket.emit("server_send_failed");
        }
        else
        {
            //Step 3: Server send success to client
            // send back for client who request this 
            ArrUser.push(data_from_client);// add new user to array user
            socket.Username = data_from_client;// CREATE NEW PROPERTY FOR SOCKET (IMPORTANT)
            socket.emit("server_send_success", data_from_client);
            
            //Step 4: send broadcast for other client
            io.sockets.emit("server_send_broadcast", ArrUser);
            //console.log(ArrUser);//debug
        }
    });

    socket.on("client_send_logout",function(){
        ArrUser.splice(ArrUser.indexOf(socket.Username), 1);
        socket.broadcast.emit("server_send_broadcast", ArrUser);
    });

    // recieve message from client
    socket.on("user_send_message",function(message_data_from_client){
        //---normal txt recieve and send back to all clients
        //io.sockets.emit("server_send_message",message_data_from_client);

        //using Json
        io.sockets.emit("server_send_message",{un: socket.Username, content: message_data_from_client});
    });

    // server listen event when client typing
    socket.on("client_typing", function(){
        console.log(socket.Username +" is typing");//debug
        var str1 = socket.Username + " is typing ...";
        socket.broadcast.emit("typing_from_server", str1);
    });

    // server listen event when client stop typing
    socket.on("client_stop_typing", function(){
        console.log(socket.Username +" is stop typing");//debug
       io.sockets.emit("stop_typing_from_server");
    });


});

app.get("/",function(req, res){
    res.render("home");

});