//Zainab Lezzaik
//101263105

//thru this, we connect to the server and get back the socket
const socket = io('http://' + window.document.location.host) //it should connect to the same host that served that doc


//function for handling the messages
function handleMessage(message, contentMsg){ //this should add the message to the chat
    // this gets the user's username from the 'clientName' input field 
    let username = document.getElementById('clientName').value.trim()//and trim any leading/trailing spaces
    //here im creating a new 'msgDiv' element
    let msgDiv = document.createElement('div') //inorder to display the message
    //these conditions determine the text color depending on multiple conditions
    if(username.toLowerCase() === message.userSender.toLowerCase() && !contentMsg && message.private===""){ //this determines if the message was meant to be a public message
        msgDiv.style.color = 'blue' //it displays it in blue if it is
    }else if (message.private !== "" && !contentMsg){ //incase the message here is private 
        msgDiv.style.color = 'red' //display it in red color
    } 
    //thru this, im setting the text content of the message 'msgDiv' element
    msgDiv.textContent = message.text
    //this appends the message 'msgDiv' elemenet
    document.getElementById('messages').appendChild(msgDiv) //to the messages container
}
// a listen for 'serverSays' events 
socket.on('serverSays' ,function(message){ //from the socket server and display message received
    let messageReceived = JSON.parse(message) //this parses the message reeived as a JSON object
    //this calls the 'handleMessage' function 
    handleMessage(messageReceived, false) //to add the message received to the chat
})

// this is a isten for 'successfulConnection' events 
socket.on('successfulConnection', function(message){ //from the socket server
    console.log("Message is " + message) //display the message in the console
    //disable the 'clientName' input field 
    let disconnectedUsername = document.getElementById('clientName')
    disconnectedUsername.setAttribute('disabled', '');
    document.getElementById('connectButton').setAttribute('disabled', ''); //and the 'connectButton' once the user is connected
    //this parses the message received 
    let messageReceived = JSON.parse(message) //as a JSON object
    // this calls the 'handleMessage' function 
    handleMessage(messageReceived, true) //to add the registration acknowledgment message to the chat
})
//this a function to send a message to the server
function handleSendMessage(){
    //NEW
    // Check if the user is registered. If not, return without sending the message.
    if (document.getElementById('clientName').value === '') {
        console.log("User is not registered. Please register to send messages.");
        return;
     }
    //changed it here
    //this gets the message text from the 'messageBox' input field
    let message = document.getElementById('messageBox').value.trim()  //and trims any leading or trailing spaces
    let privateClients = ""
    //this is if the message is empty
    if(message === '') return //do nothing
    //thru this condition, it checks if the message is supposed to be private
    if(message.indexOf(":") !== -1){  //it checks that by seeing if it contains a colon
        let privateMessges = message.split(":") //it splits
        //have it now as a private message
        message = privateMessges[1]
        privateClients = privateMessges[0].split(",")
    }
    //create a data object containing the username, message text and the private clients list
    let dataObj = {"username": document.getElementById('clientName').value.trim(), "text": message, "private": privateClients }
    //thru this, it checks if the message is a public msg or a private msg
    if(privateClients === ""){ //if the privateClients does not contain anything
        console.log("Public Message") //then it is a public msg
        //this emits the appropriate event 
        socket.emit('publicMessageFromCLient', JSON.stringify(dataObj)) //to the server
    } else { //incase the privateClients contains 
        console.log("Private Message") //then it is a private msg
         //this emits the appropriate event 
        socket.emit('privateMessageFromClient', JSON.stringify(dataObj)) //to the server
    }
    //this clears the message input field
    document.getElementById('messageBox').value = ''
}
//this a function is for the clear button
function handleClearMessage(){
    while (document.getElementById('messages').childNodes.length > 1) { //incase we have messages in the chat
        //when the clear button is clicked
        document.getElementById('messages').removeChild(document.getElementById('messages').lastChild);//it removes all the chat by using the 
        //.removeChild operation
    }
}
//defien a function to connect the user
function handleConnectUsers(){
    //it gets the username from the 'clientName'
    let username = document.getElementById('clientName').value.trim() //and trim any leading/trailing spaces
    //this displays a connection message to the console
    console.log("Connecting the user : " + username) //with the username that connected
    //incase the username is empty 
    if(username === '') return //do nothing
    //in this if condition, im amking sure that the username that the user enetered is a valid one 
    if(/^[a-zA-Z]/.test(username) && username.indexOf(' ')=== -1){ //im checking if it starts with letters or not
        //incase it is, then set the dataObj
        let dataObj = {"username": username, "text": "", private: ""} // so that it contains all message info and username
        //this emits a 'register' event to the server
        socket.emit('register', JSON.stringify(dataObj)) //with the user connection/registeration data
    } else{ //incase the username is not a valid one
        document.getElementById('clientName').value = '' //reset the clientname input field
        //this will send an alert to the user informing them
        alert("INVALID Username, Please try again!!") //that the username that they entered is not working
    }
    // Enable the message input field and send button
    document.getElementById('messageBox').removeAttribute('disabled'); //enable the message input field
    document.getElementById('send_Button').removeAttribute('disabled'); //enable the send button
}

function handleKeyDown(event) {
    const ENTER_KEY = 13 //keycode for enter key
    if (event.keyCode === ENTER_KEY) {
        //this makes sure that the 'clientName' input field
      if(document.getElementById('clientName').value !== "") //that it is not empty
        handleSendMessage() //it then calls the handleSendMessage func
      return false //this prevents the event from propogating further
    }
}

//adding the event listeners
document.addEventListener('DOMContentLoaded', function() {
    //we call this function after browser loades the web page
    //it adds listener to the buttons
    //NEW
    //it disables the message input field and send button initially
    document.getElementById('messageBox').setAttribute('disabled', '');
    document.getElementById('send_Button').setAttribute('disabled', '');
    //this is for the send Button, 
    document.getElementById('send_Button').addEventListener('click', handleSendMessage) //it calls the handleSendMessage function
    //this is for the connect Button, 
    document.getElementById('connectButton').addEventListener('click', handleConnectUsers) //it calls the handleConnectUsers function
    //this is for the clear Button, 
    document.getElementById('clearButton').addEventListener('click', handleClearMessage) //calls the handleClearMessage func
    //this adds the keyboard handler for the whole document 
    document.addEventListener('keydown', handleKeyDown) //not to the separate elements
  })