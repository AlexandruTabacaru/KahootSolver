async function runSolverOnCurrentQuestion(apiKey) {
    console.log("Running solver with API key:", apiKey);

    // Function to send a question to OpenAI and get an answer
    async function getAnswerFromChatGPT(question, options) {
        console.log("Fetching answer from ChatGPT. Question:", question, "Options:", options);

        const prompt = `Here is a question: "${question}". Choose the best answer from these options: ${options.join(', ')}.`;

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4",
                    messages: [
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.7
                })
            });

            console.log("API Response Status:", response.status);

            if (!response.ok) {
                const errorDetails = await response.text();
                console.error('Error response from API:', errorDetails);
                throw new Error(`Request failed with status ${response.status}: ${errorDetails}`);
            }

            const data = await response.json();
            console.log("API Response Data:", data);

            if (data.choices && data.choices.length > 0) {
                return data.choices[0].message.content.trim();
            } else {
                throw new Error("Invalid API response structure: No choices available");
            }
        } catch (error) {
            console.error('Error fetching answer from ChatGPT:', error);
            alert(`Error: ${error.message}`);
        }
    }

    // Scrape the Kahoot question and answer options
    console.log("Scraping Kahoot question and answer options...");
    const questionElement = document.querySelector('span[data-functional-selector="block-title"]');
    const optionsElements = document.querySelectorAll('div[data-functional-selector^="question-choice-text"]');

    let question = questionElement ? questionElement.innerText : null;
    let options = [];

    optionsElements.forEach(option => {
        const optionText = option.querySelector('p') ? option.querySelector('p').innerText : '';
        if (optionText) {
            options.push(optionText);
        }
    });

    if (question && options.length > 0) {
        console.log("Question found:", question);
        console.log("Options found:", options);

        try {
            const answer = await getAnswerFromChatGPT(question, options);
            alert(`Suggested answer: ${answer}`);
        } catch (error) {
            console.error('Error while fetching answer:', error);
        }
    } else {
        console.log("No question or options found on this page.");
        alert('No question found on this page.');
    }
}
