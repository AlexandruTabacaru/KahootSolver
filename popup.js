// Load the saved API key when the popup opens
document.addEventListener('DOMContentLoaded', function() {
    console.log("Popup loaded.");
    chrome.storage.sync.get('apiKey', function(data) {
        if (data.apiKey) {
            document.getElementById('apiKey').value = data.apiKey;
            console.log("API key loaded:", data.apiKey);
        } else {
            console.log("No API key found.");
        }
    });
});

// Save the API key to Chrome storage when the "Save API Key" button is clicked
document.getElementById('saveApiKey').addEventListener('click', function() {
    const apiKey = document.getElementById('apiKey').value;
    chrome.storage.sync.set({ apiKey: apiKey }, function() {
        document.getElementById('statusMessage').textContent = 'API key saved!';
        console.log("API key saved:", apiKey);
    });
});

// Run the solver on the current Kahoot question when the "Run Solver" button is clicked
document.getElementById('runSolver').addEventListener('click', function() {
    console.log("Run Solver button clicked.");
    chrome.storage.sync.get('apiKey', function(data) {
        if (!data.apiKey) {
            document.getElementById('statusMessage').textContent = 'Please enter and save an API key first.';
            console.log("No API key found. Please save one.");
            return;
        }

        // Inject the content script to scrape and process the question
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            console.log("Injecting content script into the active tab.");
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['contentScript.js']
            }, function() {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: function(apiKey) {
                        runSolverOnCurrentQuestion(apiKey);  // Pass API key from popup
                    },
                    args: [data.apiKey]
                });
            });
        });
    });
});
