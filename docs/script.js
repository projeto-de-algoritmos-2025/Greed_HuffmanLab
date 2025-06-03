const asciiOutputElem = document.getElementById('asciiOutput');
const asciiBitsCountElem = document.getElementById('asciiBitsCount');


const inputTextElem = document.getElementById('inputText');
const generateButton = document.getElementById('generateButton');
const frequencyOutputElem = document.getElementById('frequencyOutput');

const errorMessageElem = document.getElementById('errorMessage');

const frequencySection = document.getElementById('frequencySection');

generateButton.addEventListener('click', () => {
    const text = inputTextElem.value;
    errorMessageElem.textContent = '';
    errorMessageElem.classList.add('hidden'); 

    [frequencySection, asciiSection].forEach(s => s.classList.add('hidden'));

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

        const asciiInfo = textToAsciiBinary(text);
        displayAsciiSequence(asciiInfo.binaryString, asciiInfo.bitCount);
        asciiSection.classList.remove('hidden');

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

const textToAsciiBinary = (text) => {
    let binaryString = '';
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        const binaryChar = charCode.toString(2).padStart(8, '0');
        binaryString += binaryChar + (i < text.length - 1 ? ' ' : '');
    }
    return { binaryString: binaryString, bitCount: text.length * 8 };
}

const displayAsciiSequence = (binaryString, bitCount) => {
    asciiOutputElem.textContent = binaryString;
    const charCount = bitCount > 0 ? bitCount / 8 : 0;
    asciiBitsCountElem.textContent = `Total de Bits (ASCII Padrão): ${bitCount} bits (${charCount} caracteres).`;
}

