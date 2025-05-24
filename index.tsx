interface Solution {
    name: string;
    rarity: "C" | "R" | "SR" | "UR" | "LR";
    rarityJP: string;
    color: string;
    weight: number;
    description?: string;
}

const solutions: Solution[] = [
    // Common (コモン)
    { name: "全探索", rarity: "C", rarityJP: "コモン", color: "var(--rarity-c)", weight: 50, description: "すべての可能性を試す基本的な手法。"},
    { name: "貪欲法 (Greedy)", rarity: "C", rarityJP: "コモン", color: "var(--rarity-c)", weight: 50, description: "その場での最善手を選び続ける戦略。"},
    { name: "シミュレーション", rarity: "C", rarityJP: "コモン", color: "var(--rarity-c)", weight: 50, description: "問題の指示通りに処理を追う。"},
    { name: "ソート", rarity: "C", rarityJP: "コモン", color: "var(--rarity-c)", weight: 40, description: "データを特定の順序に並び替える。"},
    { name: "二分探索", rarity: "C", rarityJP: "コモン", color: "var(--rarity-c)", weight: 40, description: "ソート済み配列から効率的に要素を検索。"},

    // Rare (レア)
    { name: "しゃくとり法", rarity: "R", rarityJP: "レア", color: "var(--rarity-r)", weight: 30, description: "2つのポインタで範囲を効率的に走査。"},
    { name: "累積和", rarity: "R", rarityJP: "レア", color: "var(--rarity-r)", weight: 30, description: "区間和を高速に求める前処理。"},
    { name: "いもす法 (imos)", rarity: "R", rarityJP: "レア", color: "var(--rarity-r)", weight: 25, description: "区間への加算を効率的に処理。"},
    { name: "動的計画法 (DP)", rarity: "R", rarityJP: "レア", color: "var(--rarity-r)", weight: 30, description: "部分問題の結果を再利用して最適解を導く。"},
    { name: "Union-Find木", rarity: "R", rarityJP: "レア", color: "var(--rarity-r)", weight: 25, description: "グループ分けを効率的に管理するデータ構造。"},
    { name: "幅優先探索 (BFS)", rarity: "R", rarityJP: "レア", color: "var(--rarity-r)", weight: 25, description: "グラフを層ごとに探索。最短経路問題に。"},
    { name: "深さ優先探索 (DFS)", rarity: "R", rarityJP: "レア", color: "var(--rarity-r)", weight: 25, description: "グラフを深く探索。連結性判定などに。"},

    // Super Rare (スーパーレア)
    { name: "ダイクストラ法", rarity: "SR", rarityJP: "スーパーレア", color: "var(--rarity-sr)", weight: 15, description: "単一始点の非負重み付きグラフ最短経路。"},
    { name: "ワーシャルフロイド法", rarity: "SR", rarityJP: "スーパーレア", color: "var(--rarity-sr)", weight: 15, description: "全点対最短経路を求めるアルゴリズム。"},
    { name: "最小全域木 (MST)", rarity: "SR", rarityJP: "スーパーレア", color: "var(--rarity-sr)", weight: 15, description: "グラフの全頂点を連結する最小コストの辺集合。"},
    { name: "トポロジカルソート", rarity: "SR", rarityJP: "スーパーレア", color: "var(--rarity-sr)", weight: 12, description: "有向非巡回グラフの頂点を順序付け。"},
    { name: "桁DP", rarity: "SR", rarityJP: "スーパーレア", color: "var(--rarity-sr)", weight: 12, description: "数値の桁ごとに状態を持つDP。"},

    // Ultra Rare (ウルトラレア)
    { name: "セグメント木", rarity: "UR", rarityJP: "ウルトラレア", color: "var(--rarity-ur)", weight: 7, description: "区間クエリを対数時間で処理する強力なデータ構造。"},
    { name: "BIT / Fenwick木", rarity: "UR", rarityJP: "ウルトラレア", color: "var(--rarity-ur)", weight: 7, description: "点更新と区間和を対数時間で処理。"},
    { name: "ローリングハッシュ", rarity: "UR", rarityJP: "ウルトラレア", color: "var(--rarity-ur)", weight: 6, description: "文字列の一致判定を高速に行う。"},
    { name: "強連結成分分解 (SCC)", rarity: "UR", rarityJP: "ウルトラレア", color: "var(--rarity-ur)", weight: 5, description: "有向グラフを相互到達可能な部分グラフに分解。"},

    // Legendary Rare (レジェンダリーレア)
    { name: "HL分解", rarity: "LR", rarityJP: "レジェンダリー", color: "var(--rarity-lr)", weight: 2, description: "木上のパスに対するクエリを効率化。"},
    { name: "高度なフロー", rarity: "LR", rarityJP: "レジェンダリー", color: "var(--rarity-lr)", weight: 2, description: "ネットワークフローの応用問題 (Min-Cost Max-Flowなど)。"},
    { name: "形式的冪級数 (FPS)", rarity: "LR", rarityJP: "レジェンダリー", color: "var(--rarity-lr)", weight: 1, description: "母関数を用いた数え上げ問題の強力な武器。"},
    { name: "畳み込み (Convolution)", rarity: "LR", rarityJP: "レジェンダリー", color: "var(--rarity-lr)", weight: 2, description: "NTT/FFTを用いた多項式乗算。DP高速化にも。"},
    { name: "セグ木上のDP", rarity: "LR", rarityJP: "レジェンダリー", color: "var(--rarity-lr)", weight: 1, description: "データ構造を駆使した複雑なDPの最適化 (遅延セグ木応用など)。"}
];

const totalWeight = solutions.reduce((sum, s) => sum + s.weight, 0);

function selectSolution(): Solution {
    let randomWeight = Math.random() * totalWeight;
    for (const solution of solutions) {
        if (randomWeight < solution.weight) {
            return solution;
        }
        randomWeight -= solution.weight;
    }
    // Fallback, should ideally not be reached if weights are correct
    return solutions[solutions.length - 1];
}

function displaySolution(solution: Solution, resultArea: HTMLElement) {
    resultArea.innerHTML = ''; // Clear previous result or placeholder

    const card = document.createElement('div');
    card.classList.add('result-card', `rarity-${solution.rarity}`);
    // card.style.borderColor = solution.color; // Using CSS class for border-left

    const rarityBanner = document.createElement('div');
    rarityBanner.classList.add('rarity-banner');
    rarityBanner.textContent = solution.rarity;
    // Rarity banner color is handled by CSS class: .rarity-X .rarity-banner

    const nameElement = document.createElement('h2');
    nameElement.classList.add('solution-name');
    nameElement.textContent = solution.name;

    const rarityTextElement = document.createElement('p');
    rarityTextElement.classList.add('solution-rarity-text');
    rarityTextElement.textContent = `[${solution.rarityJP}]`;
    // Rarity text color is handled by CSS class: .rarity-X .solution-rarity-text

    card.appendChild(rarityBanner);
    card.appendChild(nameElement);
    card.appendChild(rarityTextElement);

    if (solution.description) {
        const descriptionElement = document.createElement('p');
        descriptionElement.classList.add('solution-description');
        descriptionElement.textContent = solution.description;
        card.appendChild(descriptionElement);
    }

    resultArea.appendChild(card);
}


document.addEventListener('DOMContentLoaded', () => {
    const pullButton = document.getElementById('pull-gacha-button') as HTMLButtonElement;
    const resultArea = document.getElementById('gacha-result-area') as HTMLElement;
    const animationArea = document.getElementById('gacha-animation-area') as HTMLElement;

    if (!pullButton || !resultArea || !animationArea) {
        console.error('Required DOM elements not found.');
        return;
    }

    pullButton.addEventListener('click', async () => {
        pullButton.disabled = true;
        resultArea.style.opacity = '0'; // Fade out previous result
        animationArea.classList.remove('hidden');

        // Simulate animation time
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000)); // 2-3 seconds

        const chosenSolution = selectSolution();
        
        animationArea.classList.add('hidden');
        resultArea.style.opacity = '1'; // Fade in new result
        displaySolution(chosenSolution, resultArea);
        
        pullButton.disabled = false;
    });
});
