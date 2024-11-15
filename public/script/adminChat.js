let socket = io(); // Establish the socket connection

console.log(window.localStorage.getItem('name') , !window.localStorage.getItem('name'))
var username = window.localStorage.getItem('name'),
    to,
    chatStatus = document.getElementById('status'),
    isActive = true,
    chatusername = document.getElementById('chat-username');
const connectBtn = document.getElementById('connectBtn')
connectBtn.addEventListener('click', async()=>{
    socket.emit('connectAdmin', username);
})
if(!window.localStorage.getItem('name')){
      if(username){
        let confirmed = true //confirm("Are you sure?")
        if(confirmed){
            console.log("Something fishyy")
            window.localStorage.setItem('name', username.trim())
            socket.emit('new user', username.trim(), isActive);
          //  document.body.classList.toggle("show-admin-chatbot");
        }
    }
} else {
  //  document.body.classList.toggle("show-admin-chatbot");
  
    if(to){
        console.log("Else part -> ")
        socket.emit('new user', username.trim(), isActive, "user" );
    } else {
        socket.emit('new user', username.trim(), isActive, "user" );
    }
    
}


let adminCloseBtn = document.querySelector(".close-btn");
let adminChatbox = document.querySelector(".chatbox");
let adminChatInput = document.querySelector(".chat-input textarea");
let adminSendChatBtn = document.querySelector(".chat-input span");


let adminUserMessage = null;
let admininputInitHeight = adminChatInput.scrollHeight;

// Handle typing events
adminChatInput.addEventListener('input', () => {
  if (adminChatInput.value === '') {
   // socket.emit('stop typing',username,to);
  } else {
   // socket.emit('typing', username,to);
  }
});

let admincreateChatLi = (message, className) => {
    let chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span></span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;

}

let adminhandleChat = () => {
    adminUserMessage = adminChatInput.value.trim();
    if(!adminUserMessage) return;
    adminChatInput.value = "";
    adminChatInput.style.height = `${admininputInitHeight}px`;
    adminChatbox.appendChild(admincreateChatLi(adminUserMessage, "outgoing"));
    adminChatbox.scrollTo(0, adminChatbox.scrollHeight);
   // let to = window.localStorage.getItem('to')
    let username = window.localStorage.getItem('name')
    let body = {
        adminUserMessage : adminUserMessage,
        username: username,
        to: to
    }
    socket.emit('outgoing', adminUserMessage,username,to);
    
   /* setTimeout(() => {
        let incomingChatLi = admincreateChatLi("Thinking...", "incoming");
        adminChatbox.appendChild(incomingChatLi);
        adminChatbox.scrollTo(0, adminChatbox.scrollHeight);
    }, 600); */
}

adminChatInput.addEventListener("input", () => {
    adminChatInput.style.height = `${admininputInitHeight}px`;
    adminChatInput.style.height = `${adminChatInput.scrollHeight}px`;
});

adminChatInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        adminhandleChat();
    }
});

socket.on('incoming', (msg, admin) => {
    console.log('message: ' + msg+ "From ", admin);
    if(admin){
        to = admin
        window.localStorage.setItem('to',to.trim())
    }
    
    let incomingChatLi = admincreateChatLi(msg.trim(), "incoming");
    //chatStatus.innerText = ""
    adminChatbox.appendChild(incomingChatLi);
    adminChatbox.scrollTo(0, adminChatbox.scrollHeight);
});

socket.on('adminConnected', (msg, admin) => {
    console.log('connection message: ' + msg+ "From ", admin);
    to = admin
    window.localStorage.setItem('to',to.trim())
    connectBtn.style.display = "none";
    document.getElementById('disconnectBtn').style.display = 'inline-block';
    let incomingChatLi = admincreateChatLi(msg.trim(), "incoming");
    //chatStatus.innerText = ""
    adminChatbox.appendChild(incomingChatLi);
    adminChatbox.scrollTo(0, adminChatbox.scrollHeight);
});



socket.on('user not found', (msg) => {
    alert("username you have entered is not found, please re-enter username")
    var to = prompt("Enter admin username to chat")
    window.localStorage.setItem('to',to.trim())
    socket.emit('new to user', to.trim());
    chatusername.innerText = to.toUpperCase()
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

socket.on('stop typing', (msg) => {
    chatStatus.innerText = ""
})

socket.on('clear', (msg) => {
    window.localStorage.clear();
})

adminSendChatBtn.addEventListener("click", adminhandleChat);
adminCloseBtn.addEventListener("click", () => {
    document.body.classList.remove("show-admin-chatbot");
    document.getElementById("admin-btn").style.display = "none";
});

