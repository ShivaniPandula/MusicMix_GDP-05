let chatbotToggler = document.querySelector(".chatbot-toggler");
let closeBtn = document.querySelector(".close-btn");
let chatbox = document.querySelector(".chatbox");
let chatInput = document.querySelector(".chat-input textarea");
let sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null;
let inputInitHeight = chatInput.scrollHeight;

let createChatLi = (message, className) => {
    let chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span ></span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
}

let handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    // Clear the input and reset its height
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Add outgoing message to chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    // Simulate chatbot thinking and add incoming message after delay
    setTimeout(() => {
        let incomingChatLi = createChatLi("Hi, I'm Admin, from Musicmix Admin Support...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        
        // Replace "Thinking..." with a response message
       // incomingChatLi.querySelector("p").textContent = "This is a response.";
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }, 600);
}

// Adjust textarea height on input
chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

// Handle Enter key for submitting the chat message
chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleChat();
    }
});

// Add event listeners for toggling and closing the chatbot
sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
