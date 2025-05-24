
interface AtCoderProblem {
    name: string;
    url: string;
}

// Interface for data read directly from solutions.json
interface SolutionDataFromJSON {
    name: string;
    rarity: "C" | "R" | "SR" | "UR" | "LR";
    description?: string;
    atcoderProblems?: AtCoderProblem[];
}

// Interface for the Solution object used throughout the application
interface Solution extends SolutionDataFromJSON {
    rarityJP: string;
    color: string; // This will be the CSS variable string like 'var(--rarity-c)'
    weight: number;
}

const rarityToInfoMap: Record<SolutionDataFromJSON["rarity"], { jp: string; colorVar: string; weight: number }> = {
    "C":  { jp: "コモン",       colorVar: "var(--rarity-c)",  weight: 50 },
    "R":  { jp: "レア",         colorVar: "var(--rarity-r)",  weight: 30 },
    "SR": { jp: "スーパーレア", colorVar: "var(--rarity-sr)", weight: 15 },
    "UR": { jp: "ウルトラレア", colorVar: "var(--rarity-ur)", weight: 7  },
    "LR": { jp: "レジェンダリー",colorVar: "var(--rarity-lr)", weight: 2  },
};

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
        const solutionsData: SolutionDataFromJSON[] = await response.json();
        
        solutions = solutionsData.map(data => {
            const info = rarityToInfoMap[data.rarity];
            if (!info) {
                // This case should ideally not happen if rarities in JSON are always valid
                // But as a fallback, assign 'C' rarity info
                console.warn(`Unknown rarity "${data.rarity}" for solution "${data.name}". Defaulting to Common.`);
                const defaultInfo = rarityToInfoMap["C"];
                 return {
                    ...data,
                    rarityJP: defaultInfo.jp,
                    color: defaultInfo.colorVar,
                    weight: defaultInfo.weight,
                };
            }
            return {
                ...data,
                rarityJP: info.jp,
                color: info.colorVar,
                weight: info.weight,
            };
        });

        totalWeight = solutions.reduce((sum, s) => sum + s.weight, 0);

    } catch (error) {
        console.error("Failed to load solutions:", error);
        solutions = []; 
        totalWeight = 0; // Ensure totalWeight is 0 if loading fails
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
        // This could happen if loadSolutions failed or solutions.json is empty
        // Return a default "error" solution or handle appropriately
        console.error("No solutions available to select from.");
        // Fallback to a dummy solution to prevent crashing, ideally UI should show an error.
        const fallbackInfo = rarityToInfoMap["C"];
        return {
            name: "エラー",
            rarity: "C",
            description: "解法の読み込みに失敗しました。",
            rarityJP: fallbackInfo.jp,
            color: fallbackInfo.colorVar,
            weight: fallbackInfo.weight,
        };
    }
    let randomWeight = Math.random() * totalWeight;
    for (const solution of solutions) {
        if (randomWeight < solution.weight) {
            return solution;
        }
        randomWeight -= solution.weight;
    }
    // Fallback, should ideally not be reached if totalWeight is correct
    return solutions[solutions.length - 1]; 
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
    
    card.appendChild(cardHeader); 
    card.appendChild(nameElement);

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
    const resultArea = document.getElementById('gacha-result-area') as HTMLElement;
    const placeholder = document.getElementById('gacha-placeholder') as HTMLElement;

    const viewHistoryButton = document.getElementById('view-history-button') as HTMLButtonElement;
    const historyModal = document.getElementById('history-modal') as HTMLElement;
    const historyContent = document.getElementById('history-content') as HTMLElement;
    const closeHistoryButton = document.getElementById('close-history-button') as HTMLButtonElement;

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
    pullButton.disabled = true; 
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
        resultArea.style.display = 'flex'; 
        
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
