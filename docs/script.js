const inputTextElem = document.getElementById('inputText');
const generateButton = document.getElementById('generateButton');
const frequencyOutputElem = document.getElementById('frequencyOutput');

const errorMessageElem = document.getElementById('errorMessage');

const frequencySection = document.getElementById('frequencySection');

generateButton.addEventListener('click', () => {
    const text = inputTextElem.value;
    errorMessageElem.textContent = '';
    errorMessageElem.classList.add('hidden'); 

    [frequencySection].forEach(s => s.classList.add('hidden'));

    if (!text) {
        errorMessageElem.textContent = 'Por favor, insira um texto para análise.';
        errorMessageElem.classList.remove('hidden'); 
        return;
    }

    try {
        const frequencies = calculateFrequencies(text);
        if (Object.keys(frequencies).length === 0) {
            errorMessageElem.textContent = 'O texto não contém caracteres para processar.';
            errorMessageElem.classList.remove('hidden');
            return;
        }
        displayFrequencies(frequencies);
        frequencySection.classList.remove('hidden');
    } catch (error) {
        console.error("Erro no processamento Huffman:", error);
        errorMessageElem.textContent = `Ocorreu um erro inesperado: ${error.message}. Tente novamente ou verifique o console.`;
        errorMessageElem.classList.remove('hidden');
    }
});

const calculateFrequencies = (text) => {
    const frequencies = {};
    for (const char of text) {
        frequencies[char] = (frequencies[char] || 0) + 1;
    }
    return frequencies;
}

const displayFrequencies = (frequencies) => {
    let freqText = '';
    for (const char in frequencies) {
        const displayChar = char === ' ' ? "'␣'" : (char === '\n' ? "'\\n'" : char) ;
        freqText += `${displayChar.padEnd(5)}: ${frequencies[char]}\n`;
    }
    frequencyOutputElem.textContent = freqText.trim();
}

