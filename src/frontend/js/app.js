const API_BASE =
    new URLSearchParams(window.location.search).get("api") ||
    "http://127.0.0.1:5000";

const chatEl = document.getElementById("chat");
const formEl = document.getElementById("chat-form");
const inputEl = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const badgeEl = document.getElementById("status-badge");


function getCurrentTime() {
    return new Date().toLocaleTimeString(
        "en-US",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function addMessage(text, type, meta = null) {
    const div = document.createElement("div");
    div.className = `msg msg-${type}`;

    const content = document.createElement("div");
    content.className = "msg-content";

    // Prevents HTML received from the user or backend from being rendered.
    content.textContent = text;

    const span = document.createElement("span");
    span.className = "msg-meta";

    span.textContent = meta
        ? `${getCurrentTime()} · ${meta}`
        : getCurrentTime();

    div.appendChild(content);
    div.appendChild(span);

    chatEl.appendChild(div);
    chatEl.scrollTop = chatEl.scrollHeight;

    return div;
}


function addTypingIndicator() {
    const div = document.createElement("div");

    div.className = "msg msg-bot";

    div.innerHTML = `
        <span class="digitando">
            <span></span>
            <span></span>
            <span></span>
        </span>
    `;

    chatEl.appendChild(div);
    chatEl.scrollTop = chatEl.scrollHeight;

    return div;
}


function setBadge(state, text) {
    badgeEl.className = `badge badge-${state}`;
    badgeEl.textContent = text;
}


function setLoading(loading) {
    inputEl.disabled = loading;
    sendBtn.disabled = loading;

    if (loading) {
        inputEl.placeholder = "Waiting for response...";
    } else {
        inputEl.placeholder = "Type your message...";
        inputEl.focus();
    }
}


async function sendMessage(text) {
    addMessage(text, "usuario");

    inputEl.value = "";
    setLoading(true);

    const typingIndicator = addTypingIndicator();

    try {
        // Sends the message to the Flask backend.
        const response = await fetch(
            `${API_BASE}/chat`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message: text
                }),

                // Keeps the Flask session between messages.
                credentials: "include"
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        typingIndicator.remove();

        addMessage(
            data.response,
            "bot",
            "Watson Assistant"
        );

        setBadge(
            "online",
            "Connected to Watson"
        );

    } catch (error) {
        typingIndicator.remove();

        addMessage(
            "Unable to communicate with the server. " +
            "Please check if the backend is running and try again.",
            "erro"
        );

        setBadge(
            "offline",
            "Backend unavailable"
        );

        console.error(
            "Backend communication error:",
            error
        );

    } finally {
        setLoading(false);
    }
}


async function checkBackend() {
    try {
        const response = await fetch(
            `${API_BASE}/`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        setBadge(
            "online",
            "Connected to Watson"
        );

    } catch (error) {
        setBadge(
            "offline",
            "Backend unavailable"
        );

        console.error(
            "Backend connection error:",
            error
        );
    }
}


formEl.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        const text = inputEl.value.trim();

        if (!text) {
            return;
        }

        await sendMessage(text);
    }
);


// Initial interface message.
addMessage(
    "Hello! I am the CardioIA virtual assistant.\n" +
    "I can help with an initial assessment of cardiovascular symptoms.\n" +
    "How can I help you today? In an emergency, call SAMU at 192.",
    "bot",
    "Initial message"
);


checkBackend();
inputEl.focus();