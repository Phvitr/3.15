const {createServer} = require('http');
const fs = require('fs');
const {Server} = require('socket.io');

let mimeTypes = {
    "html": "text/html",
    "js": "text/javascript",
    "css": "text/css"
};

const httpServer = createServer((req,res) => {
    if (req.url === '/') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        fs.createReadStream('./templates/index.html').pipe(res);
    }
    const fileDefences = req.url.match(/\.js|.css/);
    if (fileDefences) {
        const extension = mimeTypes[fileDefences[0].toString().split('.')[1]];
        res.writeHead(200, {'Content-Type': extension});
        fs.createReadStream(__dirname + "/" +req.url).pipe(res);
    }
});

const io = new Server(httpServer);

const users = {};

io.on('connection',socket => {
    socket.on('new-user', name => {
        users[socket.id] = name;
        socket.broadcast.emit('user-connected', name);
    });
    socket.on('send-chat-message', message => {
        socket.broadcast.emit('chat-message', {message: message, name: users[socket.id]})
    })
    socket.on('disconnect', ()=> {
        socket.broadcast.emit('user-disconnected', users[socket.id]);
        delete users[socket.id];
    })
})

httpServer.listen(8080, () => {
    console.log('server is listening on port 8080')
})
