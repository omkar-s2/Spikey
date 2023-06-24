let recognition;
let isListening = false;
let chatHistory = [];
const outputElement = document.getElementById('output');
const MAX_CHAT_HISTORY = 100; // Maximum number of chat history entries to keep

function startSpeechRecognition() {
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.continuous = true;

  recognition.onresult = function(event) {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }

    const currentText = outputElement.value;

    outputElement.value = currentText + ' ' + finalTranscript;
    document.getElementById('live-caption').textContent = interimTranscript;

    // Append transcript to chat history only if it's a final transcript
    if (finalTranscript.trim()) {
      chatHistory.push(finalTranscript.trim());

      // Limit the size of chat history
      if (chatHistory.length > MAX_CHAT_HISTORY) {
        chatHistory.shift(); // Remove the oldest entry
      }
    }

    // Check if the final transcript contains the phrase "stop listening"
    if (finalTranscript.toLowerCase().includes('stop listening')) {
      stopSpeechRecognition();
    }
  };

  recognition.onerror = function(event) {
    outputElement.value = "Sorry, I couldn't understand. Please speak loudly!";
  };

  recognition.start();
  isListening = true;
}

// Function to stop speech recognition
function stopSpeechRecognition() {
  if (recognition && isListening) {
    recognition.stop();
    isListening = false;
    outputElement.value = "Thank you for using speech recognition!";
  }
}

// Function to display the chat history
function displayChatHistory() {
  outputElement.value = chatHistory.join('\n');
  outputElement.scrollTop = outputElement.scrollHeight;

  // Create and download a JSON file containing the chat history
  const jsonData = JSON.stringify(chatHistory, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'chat_history.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Clear button click event handler
document.querySelector('.clear-button').addEventListener('click', function() {
  outputElement.value = '';
  chatHistory = [];
});

// Start speech recognition when the "Start Speech Recognition" button is clicked
document.querySelector('.start-button').addEventListener('click', function() {
  if (!isListening) {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window || 'mozSpeechRecognition' in window || 'msSpeechRecognition' in window) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
          // Microphone access granted
          startSpeechRecognition();
        })
        .catch(function(error) {
          // Microphone access denied
          console.error('Error accessing the microphone:', error);
        });
    } else {
      console.error('Speech recognition is not supported in this browser.');
    }
  }
});

// Stop speech recognition when the "Stop Speech Recognition" button is clicked
document.querySelector('.stop-button').addEventListener('click', function() {
  stopSpeechRecognition();
});

// Display chat history when the "Chat History" button is clicked
const chatHistoryButton = document.querySelector('.chat-history-button');
if (chatHistoryButton) {
  chatHistoryButton.addEventListener('click', function() {
    displayChatHistory();
  });
}
