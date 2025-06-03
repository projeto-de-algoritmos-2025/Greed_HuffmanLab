const compressedOutputElem = document.getElementById('compressedOutput');
const compressionStatsElem = document.getElementById('compressionStats');
const asciiOutputElem = document.getElementById('asciiOutput');
const asciiBitsCountElem = document.getElementById('asciiBitsCount');
const codesOutputElem = document.getElementById('codesOutput');

const inputTextElem = document.getElementById('inputText');
const generateButton = document.getElementById('generateButton');
const frequencyOutputElem = document.getElementById('frequencyOutput');

const errorMessageElem = document.getElementById('errorMessage');

const frequencySection = document.getElementById('frequencySection');

let nodeIdCounter = 0; 

generateButton.addEventListener('click', () => {
    
    nodeIdCounter = 0; 
    const text = inputTextElem.value;
    errorMessageElem.textContent = '';
    errorMessageElem.classList.add('hidden'); 

    [frequencySection, asciiSection, codesSection, compressedSection].forEach(s => s.classList.add('hidden'));

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

        const huffmanTree = buildHuffmanTree(frequencies);
        const huffmanCodes = generateHuffmanCodes(huffmanTree);
        displayCodes(huffmanCodes);
        codesSection.classList.remove('hidden');

        const encodedText = encodeTextWithHuffman(text, huffmanCodes);
        displayCompressedText(encodedText, asciiInfo.bitCount, Object.keys(frequencies).length);
        compressedSection.classList.remove('hidden');

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

class HuffmanNode {
    constructor(char, freq, left = null, right = null) {
        this.char = char;
        this.freq = freq;
        this.left = left;
        this.right = right;
        this.id = nodeIdCounter++; 
    }
}

const buildHuffmanTree = (frequencies) => {
    const priorityQueue = [];
    for (const char in frequencies) {
        priorityQueue.push(new HuffmanNode(char, frequencies[char]));
    }

    if (priorityQueue.length === 0) return null;
    if (priorityQueue.length === 1) {
        const singleNode = priorityQueue[0];
        const parentForSingle = new HuffmanNode(null, singleNode.freq); 
        parentForSingle.left = singleNode; 
        return parentForSingle;
    }

    while (priorityQueue.length > 1) {
        priorityQueue.sort((a, b) => { 
            if (a.freq !== b.freq) {
                return a.freq - b.freq;
            }
            
            const charA = a.char !== null ? String(a.char) : String.fromCharCode(255); 
            const charB = b.char !== null ? String(b.char) : String.fromCharCode(255);
            return charA.localeCompare(charB);
        });
        const left = priorityQueue.shift();
        const right = priorityQueue.shift();
        const parentFreq = left.freq + right.freq;
        const parentNode = new HuffmanNode(null, parentFreq, left, right);
        priorityQueue.push(parentNode);
    }
    return priorityQueue[0];
}

const generateHuffmanCodes = (tree, currentCode = '', codes = {}) => {
    if (!tree) return codes;

    if (tree.char !== null) { 
        codes[tree.char] = currentCode || '0'; 
        return codes;
    }
    
    if (tree.left) {
        generateHuffmanCodes(tree.left, currentCode + '0', codes);
    }
    if (tree.right) {
        generateHuffmanCodes(tree.right, currentCode + '1', codes);
    }
    return codes;
}

const displayCodes = (codes) => {
    let codesText = '';
    if (Object.keys(codes).length === 0) {
        codesText = "Nenhum código gerado.";
    } else {
        for (const char in codes) {
            const displayChar = char === ' ' ? "'␣'" : (char === '\n' ? "'\\n'" : char);
            codesText += `${displayChar.padEnd(5)}: ${codes[char]}\n`;
        }
    }
    codesOutputElem.textContent = codesText.trim();
}

const encodeTextWithHuffman = (text, codes) => {
    let encoded = '';
    for (const char of text) {
        if (codes[char] !== undefined) {
            encoded += codes[char];
        } else {
            console.warn(`Caractere '${char}' não encontrado nos códigos de Huffman. Será ignorado na compressão.`);
        }
    }
    return encoded;
}

const displayCompressedText = (encodedText, originalTotalBits, numUniqueChars) => {
    const currentInputText = inputTextElem.value; 
    compressedOutputElem.textContent = encodedText || "N/A"; 
    const compressedBits = encodedText.length;
    
    let statsText = `Original (ASCII): ${originalTotalBits} bits.\n`;
    statsText += `Comprimido (Huffman): ${compressedBits} bits.\n`;

    if (originalTotalBits > 0) { 
        if (compressedBits < originalTotalBits) {
            const savedBits = originalTotalBits - compressedBits;
            const compressionRatio = (compressedBits / originalTotalBits);
            const percentageSaved = (1 - compressionRatio) * 100;
            statsText += `Economia: ${savedBits} bits (${percentageSaved.toFixed(2)}% de redução).\n`;
            statsText += `Taxa de Compressão: ${(compressionRatio*100).toFixed(2)}% do tamanho original.`;
        } else if (compressedBits > originalTotalBits) {
                const extraBits = compressedBits - originalTotalBits;
                statsText += `Resultado: Aumento de ${extraBits} bits. Huffman não foi eficiente aqui.`;
        } else { 
            statsText += `Resultado: Sem alteração no tamanho.`;
        }
    }
    compressionStatsElem.textContent = statsText;
}

