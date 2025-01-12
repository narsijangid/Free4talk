
    let isRecording = false; // Track if recording is in progress

    if (recognition) {
        document.addEventListener("keydown", (e) => {
            if (e.code === "Space" && !isRecording) {
                e.preventDefault();
                isRecording = true;
                recognition.start();
            }
        });

        document.addEventListener("keyup", (e) => {
            if (e.code === "Space" && isRecording) {
                e.preventDefault();
                isRecording = false;
                recognition.stop();
            }
        });

        recognition.onstart = () => {
            console.log("Voice recognition started");
        };

        recognition.onend = () => {
            console.log("Voice recognition ended");
        };
    }
