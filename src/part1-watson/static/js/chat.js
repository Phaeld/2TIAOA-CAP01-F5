const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const chatMessages = document.getElementById("chat-messages");
const sendButton = document.getElementById("send-button");
const chatBackground = document.getElementById("chat-background");


/*
Return the current local time in HH:MM format.
*/
function getCurrentTime() {
    return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}


/*
Hide the decorative background after the conversation starts.
*/
function hideChatBackground() {
    if (chatBackground) {
        chatBackground.style.display = "none";
    }
}


/*
Create a message and append it to the conversation.
*/
function addMessage(text, sender) {

    hideChatBackground();


    const row = document.createElement("article");

    row.classList.add(
        "message-row",
        sender === "user" ? "user-row" : "assistant-row"
    );


    /*
    Display the assistant avatar only on assistant messages.
    */
    if (sender === "assistant") {

        const avatar = document.createElement("div");

        avatar.classList.add("message-avatar");

        avatar.textContent = "+";

        row.appendChild(avatar);
    }


    const wrapper = document.createElement("div");

    wrapper.classList.add("message-wrapper");


    const message = document.createElement("div");

    message.classList.add(
        "message",
        sender === "user"
            ? "user-message"
            : "assistant-message"
    );


    /*
    textContent is intentionally used instead of innerHTML to prevent
    user-controlled HTML from being rendered in the interface.
    */
    message.textContent = text;


    const time = document.createElement("span");

    time.classList.add("message-time");

    time.textContent = getCurrentTime();


    wrapper.appendChild(message);
    wrapper.appendChild(time);

    row.appendChild(wrapper);

    chatMessages.appendChild(row);


    /*
    Always keep the newest message visible.
    */
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


/*
Enable or disable the input controls while waiting for Watson.
*/
function setLoading(isLoading) {

    messageInput.disabled = isLoading;
    sendButton.disabled = isLoading;

    if (isLoading) {
        messageInput.placeholder = "CardioAssistant is responding...";
    } else {
        messageInput.placeholder = "Type your message...";
        messageInput.focus();
    }
}


/*
Send the user message to the Flask backend.
*/
async function sendMessage(message) {

    setLoading(true);


    try {

        const response = await fetch("/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message
            })
        });


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "The assistant could not process the message."
            );
        }


        addMessage(
            data.response,
            "assistant"
        );

    } catch (error) {

        console.error(
            "Chat request failed:",
            error
        );


        addMessage(
            "I could not communicate with the assistant. Please try again.",
            "assistant"
        );

    } finally {

        setLoading(false);
    }
}


/*
Handle message submission.
*/
chatForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const message =
            messageInput.value.trim();


        if (!message) {
            return;
        }


        addMessage(
            message,
            "user"
        );


        messageInput.value = "";


        await sendMessage(message);
    }
);


messageInput.focus();