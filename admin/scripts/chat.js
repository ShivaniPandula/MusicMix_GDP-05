const socket = io(); // Establish the socket connection
const adminName = window.sessionStorage.getItem('name')
console.log(adminName , !adminName)
var to;
var username = adminName,
    chatStatus = document.getElementById('status'),
    isActive = true,
    user = document.getElementById('chat-username');
if(!adminName){
username = adminName //prompt("Enter username to chat")
      if(username){
        const confirmed = true //confirm("Are you sure?")
        if(confirmed){
            window.sessionStorage.setItem('admin', username.trim())
            socket.emit('new user', username.trim(), isActive, "admin");
            document.body.classList.toggle("show-chatbot");
        }
    } 
} else {
    //document.body.classList.toggle("show-chatbot");
    if(username){
        socket.emit('new user', username.trim(), isActive,"admin");
    } else {
        socket.emit('new user', username.trim(), isActive,"admin");
    }
    
}

const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");


let userMessage = null;
const inputInitHeight = chatInput.scrollHeight;

// Handle typing events
chatInput.addEventListener('input', () => {
  if (chatInput.value === '') {
   // socket.emit('stop typing',username,to);
  } else {
   // socket.emit('typing', username,to);
  }
});

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p><span"></span>` : `<span style="line-height: 0 !important;"></span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").innerHTML = message;
    return chatLi;

}

const handleChat = async () => {
    userMessage = chatInput.value.trim();
    if(!userMessage) return;
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
    const username = adminName
    if(to){
        socket.emit('admin-outgoing', userMessage,username,to);
    }
    

    
    
   /* setTimeout(() => {
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }, 600); */
}

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

socket.on('incoming', (msg, username) => {
    console.log('message: ' + msg);
    const incomingChatLi = createChatLi(msg.trim(), "incoming");
    //chatStatus.innerText = ""
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    user.innerText = username.toUpperCase();
});

socket.on('user not found', (msg) => {
    alert("Username you have entered is not found, please re-enter username")
    var to = prompt("Enter your friends username to chat")
    window.sessionStorage.setItem('to',to.trim())
    socket.emit('new to user', to.trim());
    user.innerText = to.toUpperCase()
})

socket.on('typing', (msg) => {
    chatStatus.innerText = "Typing..."
})

socket.on('isUserActive', (bol) => {
    if(bol){
        chatStatus.innerText = "Active"
    } else {
        chatStatus.innerText = "Offline"
    }
})

socket.on('newClient', (msg)=> {
  if(msg){
        user.innerText = msg.toUpperCase()
        to = msg.trim()
        window.sessionStorage.setItem('to',msg.trim());
        socket.emit('connectClient', adminName, msg);
  }
})

socket.on('stop typing', (msg) => {
    chatStatus.innerText = ""
})


sendChatBtn.addEventListener("click", handleChat);

