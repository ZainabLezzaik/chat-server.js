//Zainab Lezzaik
//101263105

const server = require('http').createServer(handler) // import the 'http' module for creating an HTTP server 
const io = require('socket.io')(server) // import 'socket.io' and create a WebSocket server on top of the HTTP server
const fs = require('fs') //this is the file system to server static files
const url = require('url'); //this is to parse url strings
const PORT = process.env.PORT || 3000 //incase specifying port through environment variable
                                      // or command line arguments 

const ROOT_DIR = 'html' //dir to serve static files from
const MIME_TYPES = {
  'css': 'text/css',
  'gif': 'image/gif',
  'htm': 'text/html',
  'html': 'text/html',
  'ico': 'image/x-icon',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'js': 'application/javascript',
  'json': 'application/json',
  'png': 'image/png',
  'svg': 'image/svg+xml',
  'txt': 'text/plain'
}

function get_mime(filename) {
  for (let ext in MIME_TYPES) {
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return MIME_TYPES[ext]
    }
  }
  return MIME_TYPES['txt']
}

server.listen(PORT) //starts the http server listening on PORT

function handler(request, response) {
    //handler for http server requests including the static files
    let urlObj = url.parse(request.url, true, false) //parse the url
    console.log('\n============================')
    console.log("PATHNAME: " + urlObj.pathname)
    console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
    console.log("METHOD: " + request.method)
  
    let filePath = ROOT_DIR + urlObj.pathname
    // check if the requested URL is the root directory ('/')
    if (urlObj.pathname === '/') filePath = ROOT_DIR + '/index.html' // if so, serve the 'index.html' file
    // read the file and send it as a response to the client
    fs.readFile(filePath, function(err, data) {
      if (err) {
        //report the error to console
        console.log('ERROR: ' + JSON.stringify(err))
        //respond with not found 404 to client
        response.writeHead(404);
        response.end(JSON.stringify(err))
        return //do notjing
      }
      response.writeHead(200, {
        'Content-Type': get_mime(filePath)
      })
      response.end(data)
    })
}

const connectedUsers = new Map() //create a map to store the connected/registered users with their socket Id
//listen for a 'connection' event 
io.on('connection', function(socket){  //when a new user connects to the server
  //here
    //this logs the socket's ID to the console when a user connect
    console.log('The Clients Socket ID is ' + socket.id) //printing the socket id of each user that joins
    // this is a listen for a 'register' event sent by a client
    socket.on('register', (data)=>{ // i tried using 'connect' but it said that connecgt is a reserved event name
      //this parses the received data
        dataObj = JSON.parse(data) // as a JSON object
        //in this condition,
        if (!connectedUsers.has(dataObj.username)){ //it checks if the username is not already connected/registered
          //this a return object  
          let returnObj = {}; // object to be returned to the registernation
            //check
            //this displays a welcoming message for the user,
            returnObj.text = "Welcome "+ dataObj.username + "! You are now connected to the CHAT SERVER!" // it acknowledge them that they r now connected
            returnObj.userSender = dataObj.username //setting the sender's name of returnobj as username for dataobj
            returnObj.private = dataObj.private
            //thru this set operation
            connectedUsers.set(dataObj.username, socket.id) //we store the username and its socket id in the map
            console.log("Clients connected now : ", connectedUsers) //this will log and print the users connected now
            //this will emit a "successfulConnection" event to acknowledge 
            socket.emit('successfulConnection', JSON.stringify(returnObj)) //the regesteration to the client

        }
    })
  //this is a listen for a 'publicMessageFromCLient' event
    socket.on('publicMessageFromCLient', function(data){ // when a client sends a public chat message
      //this will log a msg to acknowledge a message
        console.log("Public chat message is received") // to tell that a public message is received
        console.log("WHAT WE RECEIVED :  " + data) //displays the message received
        dataObj = JSON.parse(data) //parse the data
        //this creates a return object
        let returnObj = {} // for the public chat message
        returnObj.text = dataObj.username + " : "+ dataObj.text
        returnObj.userSender = dataObj.username
        returnObj.private = dataObj.private
        //this checks if the sender is a registered/connected user 
        if (connectedUsers.has(dataObj.username)){
            for (const socID of connectedUsers.values()){ //and then send the message to all registered users
                io.to(socID).emit('serverSays', JSON.stringify(returnObj)) //and then send the message to all registered users
            }
        }
    })
    //this is a listen for a 'privateMessageFromClient' event 
    socket.on('privateMessageFromClient', function(data) { //when a client sends a private chat message
      //this will log a msg to acknowledge a message
        console.log("Private chat message is received ") // to tell that a private message is received
        console.log('RECEIVED THE FOLLOWING : ' + data) //displays the message received
        dataObj = JSON.parse(data);
        //this creates a return object
        let returnObj = {} // for the private chat message
        returnObj.text = dataObj.username + " : "+ dataObj.text
        returnObj.userSender = dataObj.username //setting the sender's name of returnobj as username for dataobj
        returnObj.private = dataObj.private
        // this adds the sender's username 
        dataObj.private.push(dataObj.username) //to the list of private recipients
        //this condition checks if the sender is a register/connected sender
        if(connectedUsers.has(dataObj.username)){
          //this loops through the private recipients 
          for(messageReceiver of dataObj.private){ //and then sends the message to each of them
            //this condition checks if the recipient is a registered user 
            if (connectedUsers.has(messageReceiver.trim())){ //and then send the message
              io.to(connectedUsers.get(messageReceiver.trim())).emit('serverSays', JSON.stringify(returnObj))
             }
          }
        }
      })
    //this is a listen for when the user closes the tab aka disconnects
    socket.on('disconnect', function(data){
      //since connectedUsers is a map
      for (const [username, id] of connectedUsers.entries()) {//so it has both a key and a value
        if (id === socket.id) { //in this condition we compare the id of the user in the map to socket.id
          //remove the user  by removing its username 
          connectedUsers.delete(username); //from the map
          console.log(username + " has disconnected from CHAT SERVER"); //print a stateemnt to inform 
          break; //exit the loop since the user was found and removed
        }
      }
    })
    
})

console.log(`Server Running at port ${PORT}  CNTL-C to quit`)
console.log(`To Test :`)
console.log(`Open several browsers to: http://localhost:3000/clientChat.html`)

