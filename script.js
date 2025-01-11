
        let prompt = document.querySelector("#prompt");
        let submitbtn = document.querySelector("#submit");
        let avatarImg = document.querySelector("#avatar-img");

        const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDhDhiKFkaYAp-o0lGL4e4uJSYIJSh6paY"; // Replace with your API URL

        let user = {
            message: null
        };

        let synth = window.speechSynthesis;
        let currentUtterance = null;

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
    return text.split(" ").filter(word => !word.includes("*")).join(" ");
}




        // Voice function to speak the chatbot's response
        function voiceControl(responseText) {
    responseText = filterAsteriskWords(responseText); // Filter out words with *

    const maxChunkLength = 200;
    const chunks = splitTextIntoChunks(responseText, maxChunkLength);

    let currentChunkIndex = 0;
    let voices = [];

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

        prompt.addEventListener("keydown", (e) => {
            if (e.key == "Enter") {
                handlechatResponse(prompt.value);
            }
        });

        submitbtn.addEventListener("click", () => {
            handlechatResponse(prompt.value);
        });
    