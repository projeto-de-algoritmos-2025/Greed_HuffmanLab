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
const treeSection = document.getElementById('treeSection');
const codesSection = document.getElementById('codesSection');
const compressedSection = document.getElementById('compressedSection');
const asciiSection = document.getElementById('asciiSection');   

let nodeIdCounter = 0; 

generateButton.addEventListener('click', () => {
    
    nodeIdCounter = 0; 
    const text = inputTextElem.value;
    errorMessageElem.textContent = '';
    errorMessageElem.classList.add('hidden'); 

    [frequencySection, asciiSection, codesSection, compressedSection, treeSection].forEach(s => s.classList.add('hidden'));

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

        const huffmanTree = buildHuffmanTree(frequencies);
        const huffmanCodes = generateHuffmanCodes(huffmanTree);
        displayCodes(huffmanCodes);
        codesSection.classList.remove('hidden');
        
        displayTreeWithVisJS(huffmanTree); 
        treeSection.classList.remove('hidden');
        
        const asciiInfo = textToAsciiBinary(text);
        displayAsciiSequence(asciiInfo.binaryString, asciiInfo.bitCount);
        asciiSection.classList.remove('hidden');

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
        binaryString += binaryChar;
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

let visNetworkInstance = null; 

const displayTreeWithVisJS = (rootNode) => {
    const nodes = [];
    const edges = [];
    const processedNodeIds = new Set(); 

    function traverseTree(node, parentId = null, edgeLabel = '') {
        if (!node || processedNodeIds.has(node.id)) return;
        processedNodeIds.add(node.id);

        let label, shape, colorObj, fontColor;

        if (node.char !== null) { 
            const displayChar = node.char === ' ' ? "'␣'" : (node.char === '\n' ? "'\\n'" : node.char);
            label = `${displayChar}\n(${node.freq})`;
            shape = 'box'; 
            colorObj = { background: '#50fa7b', border: '#282a36', hover: { background: '#8be9fd', border: '#282a36'} }; 
            fontColor = '#282a36'; 
        } else { 
            label = `(${node.freq})`;
            shape = 'circle';
            colorObj = { background: '#ffb86c', border: '#282a36', hover: { background: '#ff79c6', border: '#282a36'} }; 
            fontColor = '#282a36'; 
        }
        nodes.push({ 
            id: node.id, 
            label: label, 
            shape: shape, 
            color: colorObj, 
            font: {size: 13, color: fontColor, face: 'monospace' } 
        });

        if (parentId !== null && parentId !== node.id) { 
            edges.push({ 
                from: parentId, 
                to: node.id, 
                label: edgeLabel, 
                arrows: {to: {enabled: true, scaleFactor: 0.7, type: 'arrow'}}, 
                color: { color: '#bd93f9', hover: '#ff79c6', highlight: '#ff79c6' }, 
                font: {align: 'middle', size: 11, color: '#f8f8f2', strokeWidth: 2, strokeColor: '#282a36', face: 'monospace'} 
            });
        }

        if (node.left) traverseTree(node.left, node.id, '0');
        if (node.right) traverseTree(node.right, node.id, '1');
    }
    
    if (rootNode) {
        if (rootNode.char === null && rootNode.left && rootNode.left.char !== null && !rootNode.right) {
            const parentNode = rootNode;
            const childNode = rootNode.left;
            
            if (!processedNodeIds.has(parentNode.id)) {
                    nodes.push({ id: parentNode.id, label: `(${parentNode.freq})`, shape: 'circle', color: { background: '#ffb86c', border: '#282a36' }, font: {size: 13, color: '#282a36', face: 'monospace'}});
                    processedNodeIds.add(parentNode.id);
            }
            if (!processedNodeIds.has(childNode.id)) {
                const displayChar = childNode.char === ' ' ? "'␣'" : (childNode.char === '\n' ? "'\\n'" : childNode.char);
                nodes.push({id: childNode.id, label: `${displayChar}\n(${childNode.freq})`, shape: 'box', color: { background: '#50fa7b', border: '#282a36' }, font: {size: 13, color: '#282a36', face: 'monospace'}});
                processedNodeIds.add(childNode.id);
            }
            if (parentNode.id !== childNode.id) { 
                    edges.push({from: parentNode.id, to: childNode.id, label: '0', arrows: {to: {enabled: true, scaleFactor: 0.7}}, color: { color: '#bd93f9' }, font: {align: 'middle', size:11, color: '#f8f8f2', strokeWidth: 2, strokeColor: '#282a36', face: 'monospace'}});
            }
        } else {
            traverseTree(rootNode);
        }
    }

    const container = document.getElementById('treeOutput');
    const data = {
        nodes: new vis.DataSet(nodes),
        edges: new vis.DataSet(edges),
    };
    const options = {
        layout: {
            hierarchical: {
                enabled: true,
                levelSeparation: 100, 
                nodeSpacing: 100,    
                treeSpacing: 150,    
                direction: 'UD',     
                sortMethod: 'directed', 
                shakeTowards: 'roots' 
            },
        },
        physics: { enabled: false }, 
        nodes: {
            borderWidth: 2,
            borderWidthSelected: 3,
            shadow: { enabled: true, size: 3, x:2, y:2, color: 'rgba(0,0,0,0.3)'} 
        },
        edges: {
            width: 1.5, 
            smooth: { 
                enabled: true,
                type: "cubicBezier", 
                forceDirection: "vertical", 
                roundness: 0.4
            },
            hoverWidth: factor => factor * 1.5, 
        },
        interaction: {
            dragNodes: true, 
            zoomView: true,  
            dragView: true,
            hover: true, 
            tooltipDelay: 200
        }
    };
    
    if (visNetworkInstance) {
        visNetworkInstance.destroy();
    }

    if (nodes.length > 0) { 
        visNetworkInstance = new vis.Network(container, data, options);
    } else if (rootNode && inputTextElem.value.length > 0) { 
            container.innerHTML = '<p class="text-sm text-center p-4 text-slate-400">O grafo para esta entrada é muito simples ou não pôde ser gerado (ex: um único caractere repetido muitas vezes, resultando em um grafo trivial).</p>';
    } else { 
        container.innerHTML = '<p class="text-sm text-center p-4 text-slate-400">Árvore não pôde ser gerada (ex: texto vazio).</p>';
    }
}

