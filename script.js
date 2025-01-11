let avatarImg = document.querySelector("#avatar-img");

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDhDhiKFkaYAp-o0lGL4e4uJSYIJSh6paY"; // Replace with your API URL

let user = {
    message: null
};

let synth = window.speechSynthesis;
let currentUtterance = null;

// Voice recognition setup
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US";
recognition.interimResults = true;
recognition.continuous = true;

recognition.onstart = function() {
    console.log("Voice recognition activated. Start speaking...");
};

recognition.onerror = function(event) {
    console.log("Error occurred in recognition: " + event.error);
};

recognition.onresult = function(event) {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
    }
    if (event.results[0].isFinal) {
        handlechatResponse(transcript);
    }
};

recognition.start(); // Start listening as soon as the website loads

async function generateResponse() {
    let RequestOption = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "contents": [
                { "parts": [{ text: user.message }] }
            ]
        })
    };

    try {
        let response = await fetch(Api_Url, RequestOption);
        let data = await response.json();
        let apiResponse = data.candidates[0].content.parts[0].text.trim();
        voiceControl(apiResponse); // Call voice function
    } catch (error) {
        console.log(error);
        voiceControl("Sorry, something went wrong.");
    }
}

function handlechatResponse(userMessage) {
    user.message = userMessage;

    // Stop any ongoing speech and reset avatar image
    if (currentUtterance && synth.speaking) {
        synth.cancel();
        avatarImg.src = "/WhatsAppVideo2025-01-10at9.29.03PM-ezgif.com-video-to-gif-converter.gif"; // Reset avatar
    }

    // Change avatar to loading image after 2 seconds
    setTimeout(() => {
        avatarImg.src = "/aivideo.gif";
    }, 2000);

    generateResponse();
}

function filterAsteriskWords(text) {
    return text.split(" ").filter(word => !word.includes("*")).join(" ");
}

// Voice function to speak the chatbot's response
function voiceControl(responseText) {
    responseText = filterAsteriskWords(responseText); // Filter out words with *

    const maxChunkLength = 200;
    const chunks = splitTextIntoChunks(responseText, maxChunkLength);

    let currentChunkIndex = 0;
    let voices = [];

    // Update the response on the left side of the chat
    let responseContainer = document.getElementById("response-container");
    responseContainer.innerHTML = `<p>${responseText}</p>`;

    function loadVoices() {
        voices = synth.getVoices();
        const femaleHindiVoice = voices.find(voice => voice.name === "Google हिन्दी" || voice.name.toLowerCase().includes("female"));
        const femaleEnglishVoice = voices.find(voice => voice.name === "Google US English" || voice.name.toLowerCase().includes("female"));

        function speakNextChunk() {
            if (currentChunkIndex < chunks.length) {
                let utterance = new SpeechSynthesisUtterance(chunks[currentChunkIndex]);
                utterance.lang = "hi-IN";
                utterance.volume = 1;
                utterance.rate = 1;
                utterance.pitch = 1;

                utterance.onend = () => {
                    currentChunkIndex++;
                    speakNextChunk();
                };

                synth.speak(utterance);
                currentUtterance = utterance; // Keep track of the ongoing utterance
            } else {
                avatarImg.src = "/WhatsAppVideo2025-01-10at9.29.03PM-ezgif.com-video-to-gif-converter.gif"; // Reset avatar
            }
        }

        speakNextChunk();
    }

    if (synth.getVoices().length) {
        loadVoices();
    } else {
        synth.onvoiceschanged = loadVoices;
    }
}

function splitTextIntoChunks(text, maxLength) {
    const regex = new RegExp(`.{1,${maxLength}}(\s|$)`, 'g');
    return text.match(regex) || [text];
}