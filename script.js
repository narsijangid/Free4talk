let prompt = document.querySelector("#prompt");
let submitbtn = document.querySelector("#submit");
let voiceInputBtn = document.querySelector("#voice-input");
let avatarImg = document.querySelector("#avatar-img");

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBIPqgV2uz9uepY-RmiGcUb50AYIWkk0ns"; // Replace with your API URL

let user = {
    message: null
};

let synth = window.speechSynthesis;
let currentUtterance = null;
let recognition = null;
if (window.SpeechRecognition || window.webkitSpeechRecognition) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        let transcript = event.results[0][0].transcript;
        handlechatResponse(transcript);
    };
}

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
    prompt.value = "";

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
    return text.split(" ").map(word => word.includes("*") ? "ध्यान से सुन" : word).join(" ");
}
function filterAsteriskWords(text) {
    return text.split(" ").map(word => word.includes("sex") ? "मादरचोद इंग्लिश सीखने आया है या बकचोदी करने आया है तू। सुधर जाओ एस्मे ही भलाई है । साले Motherfucker" : word).join(" ");
}

function filterAsteriskWords(text) {
    return text.split(" ").map(word => word.includes("Google") ? "Free4talk Company" : word).join(" ");
}


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
        const femaleHindiVoice = voices.find(voice => voice.name === "Google हिंदी" || voice.name.toLowerCase().includes("female"));
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

prompt.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
        handlechatResponse(prompt.value);
    }
});

submitbtn.addEventListener("click", () => {
    handlechatResponse(prompt.value);
});

voiceInputBtn.addEventListener("mousedown", () => {
    if (recognition) {
        recognition.start();
    }
});

voiceInputBtn.addEventListener("mouseup", () => {
    if (recognition) {
        recognition.stop();
    }
});

voiceBtn.addEventListener("mouseup", () => {
    if (recognition && isRecording) {
        recognition.stop();
    }
});

// Spacebar for voice input (PC)
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !isRecording) {
        e.preventDefault();
        if (recognition) {
            isRecording = true;
            recognition.start();
        }
    }
});

document.addEventListener("keyup", (e) => {
    if (e.code === "Space" && isRecording) {
        e.preventDefault();
        if (recognition) {
            recognition.stop();
        }
    }
});

// Send button click
submitBtn.addEventListener("click", () => {
    handleChatResponse(prompt.value);
});

// Enter key to send message
prompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        handleChatResponse(prompt.value);
    }

});
