
interface AtCoderProblem {
    name: string;
    url: string;
}

interface Solution {
    name: string;
    rarity: "C" | "R" | "SR" | "UR" | "LR";
    rarityJP: string;
    color: string; // This will be the CSS variable string like 'var(--rarity-c)'
    weight: number;
    description?: string;
    atcoderProblems?: AtCoderProblem[];
}

let solutions: Solution[] = [];
let totalWeight = 0;
let pulledCardsHistory: Solution[] = [];
const MAX_HISTORY_SIZE = 50;

async function loadSolutions(): Promise<void> {
    try {
        const response = await fetch('solutions.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        solutions = await response.json();
        totalWeight = solutions.reduce((sum, s) => sum + s.weight, 0);
    } catch (error) {
        console.error("Failed to load solutions:", error);
        solutions = []; 
    }
}

function addSolutionToHistory(solution: Solution): void {
    pulledCardsHistory.unshift(solution);
    if (pulledCardsHistory.length > MAX_HISTORY_SIZE) {
        pulledCardsHistory.pop(); 
    }
}

function selectSolution(): Solution {
    if (solutions.length === 0) {
        throw new Error("Solutions not loaded yet or empty.");
    }
    let randomWeight = Math.random() * totalWeight;
    for (const solution of solutions) {
        if (randomWeight < solution.weight) {
            return solution;
        }
        randomWeight -= solution.weight;
    }
    return solutions[solutions.length - 1]; // Fallback
}

function createSolutionCardElement(solution: Solution): HTMLElement {
    const card = document.createElement('div');
    card.classList.add('result-card', `rarity-${solution.rarity.toLowerCase()}`);
    card.style.setProperty('--rarity-color', solution.color);

    const cardHeader = document.createElement('div');
    cardHeader.classList.add('card-header');

    const rarityTagIndicator = document.createElement('div');
    rarityTagIndicator.classList.add('rarity-tag-indicator');
    rarityTagIndicator.textContent = solution.rarity;
    // Rarity specific tag styling is primarily handled by CSS via .rarity-X .rarity-tag-indicator

    const rarityTextElement = document.createElement('p');
    rarityTextElement.classList.add('solution-rarity-text');
    rarityTextElement.textContent = solution.rarityJP;
    
    cardHeader.appendChild(rarityTagIndicator);
    cardHeader.appendChild(rarityTextElement);


    const nameElement = document.createElement('h2');
    nameElement.classList.add('solution-name');
    nameElement.textContent = solution.name;
    if (solution.rarity === "LR") {
        nameElement.classList.add('lr-name-effect');
    }
    
    card.appendChild(cardHeader); // Add header first
    card.appendChild(nameElement);
    // Removed rarityTextElement from here as it's now in header

    if (solution.description) {
        const descriptionElement = document.createElement('p');
        descriptionElement.classList.add('solution-description');
        descriptionElement.textContent = solution.description;
        card.appendChild(descriptionElement);
    }

    if (solution.atcoderProblems && solution.atcoderProblems.length > 0) {
        const problemsTitle = document.createElement('h3');
        problemsTitle.classList.add('atcoder-problems-title');
        problemsTitle.textContent = '関連するAtCoder問題';
        card.appendChild(problemsTitle);

        const problemsList = document.createElement('ul');
        problemsList.classList.add('atcoder-problems-list');
        solution.atcoderProblems.forEach(problem => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = problem.url;
            link.textContent = problem.name;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            listItem.appendChild(link);
            problemsList.appendChild(listItem);
        });
        card.appendChild(problemsList);
    }
    return card;
}

function displaySingleSolution(solution: Solution, resultArea: HTMLElement) {
    const cardElement = createSolutionCardElement(solution);
    resultArea.appendChild(cardElement);
}

function createMiniCardElement(solution: Solution): HTMLElement {
    const miniCard = document.createElement('div');
    miniCard.classList.add('mini-result-card', `rarity-${solution.rarity.toLowerCase()}`);
    miniCard.style.setProperty('--rarity-color', solution.color);
    miniCard.setAttribute('role', 'listitem');
    miniCard.setAttribute('aria-label', `${solution.name} (${solution.rarityJP})`);

    const rarityTagIndicator = document.createElement('div');
    rarityTagIndicator.classList.add('rarity-tag-indicator');
    rarityTagIndicator.textContent = solution.rarity;
    miniCard.appendChild(rarityTagIndicator);


    const nameElement = document.createElement('h3'); 
    nameElement.classList.add('mini-solution-name');
    nameElement.textContent = solution.name;
    if (solution.rarity === "LR") {
        nameElement.classList.add('lr-name-effect');
    }
    miniCard.appendChild(nameElement);

    const rarityTextElement = document.createElement('p');
    rarityTextElement.classList.add('mini-solution-rarity-text');
    rarityTextElement.textContent = solution.rarityJP;
    miniCard.appendChild(rarityTextElement);
    
    return miniCard;
}

document.addEventListener('DOMContentLoaded', async () => {
    const pullButton = document.getElementById('pull-gacha-button') as HTMLButtonElement;
    // pullFourButton is removed
    const resultArea = document.getElementById('gacha-result-area') as HTMLElement;
    const placeholder = document.getElementById('gacha-placeholder') as HTMLElement;

    const viewHistoryButton = document.getElementById('view-history-button') as HTMLButtonElement;
    const historyModal = document.getElementById('history-modal') as HTMLElement;
    const historyContent = document.getElementById('history-content') as HTMLElement;
    const closeHistoryButton = document.getElementById('close-history-button') as HTMLButtonElement;

    // Check for essential elements
    if (!pullButton || !resultArea || !placeholder || 
        !viewHistoryButton || !historyModal || !historyContent || !closeHistoryButton) {
        console.error('Required DOM elements not found. Check IDs.');
        if(placeholder) placeholder.innerHTML = `<p class="error-message">アプリの初期化に失敗しました。重要な要素が見つかりません。</p>`;
        else console.error("Placeholder element itself is missing.");
        return;
    }
    
    resultArea.style.display = 'none';
    placeholder.style.display = 'flex'; 
    placeholder.innerHTML = `<p>データ準備中...</p><div class="loading-spinner"></div>`;
    pullButton.disabled = true; // Disable initially
    viewHistoryButton.disabled = true;


    await loadSolutions();

    if (solutions.length > 0 && totalWeight > 0) {
        resultArea.style.display = 'none';
        placeholder.style.display = 'flex';
        placeholder.innerHTML = `<p>下のボタンを押して<br/>解法を召喚しよう！</p>`;
        pullButton.disabled = false;
        viewHistoryButton.disabled = false;
    } else {
        resultArea.style.display = 'none';
        placeholder.style.display = 'flex';
        placeholder.innerHTML = `<p class="error-message">解法データの読み込みに失敗しました。<br/>ページを再読み込みしてください。</p>`;
        pullButton.disabled = true;
        viewHistoryButton.disabled = true;
        return; 
    }

    pullButton.addEventListener('click', async () => {
        pullButton.disabled = true;
        viewHistoryButton.disabled = true;

        placeholder.style.display = 'none';
        resultArea.innerHTML = ''; 
        resultArea.style.display = 'flex'; // For centering single card
        
        try {
            const chosenSolution = selectSolution();
            addSolutionToHistory(chosenSolution);
            displaySingleSolution(chosenSolution, resultArea);
        } catch (error) {
            console.error("Error selecting solution:", error);
            resultArea.style.display = 'none';
            placeholder.style.display = 'flex';
            placeholder.innerHTML = `<p class="error-message">エラーが発生しました。</p>`;
        }
        
        pullButton.disabled = false;
        viewHistoryButton.disabled = false;
    });

    // pullFourButton event listener is removed

    viewHistoryButton.addEventListener('click', () => {
        historyContent.innerHTML = ''; 
        if (pulledCardsHistory.length === 0) {
            const noHistoryMessage = document.createElement('p');
            noHistoryMessage.textContent = '召喚履歴はまだありません。';
            historyContent.appendChild(noHistoryMessage);
        } else {
            const gridContainer = document.createElement('div');
            gridContainer.classList.add('results-grid'); 
            gridContainer.setAttribute('role', 'list');
            pulledCardsHistory.forEach(solution => {
                gridContainer.appendChild(createMiniCardElement(solution));
            });
            historyContent.appendChild(gridContainer);
        }
        historyModal.classList.remove('hidden');
        closeHistoryButton.focus();
    });

    closeHistoryButton.addEventListener('click', () => {
        historyModal.classList.add('hidden');
        viewHistoryButton.focus(); 
    });

    historyModal.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            historyModal.classList.add('hidden');
            viewHistoryButton.focus();
        }
    });

    historyModal.addEventListener('click', (event) => {
        if (event.target === historyModal) {
            historyModal.classList.add('hidden');
            viewHistoryButton.focus();
        }
    });
});
