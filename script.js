// 보상 계산 함수
function calculateRankReward(n, bonus, minBonusDraws, fixedRankBonus) {
    if (fixedRankBonus) {
        return bonus;
    }
    if (n >= minBonusDraws[250]) {
        return 250;
    } else if (n >= minBonusDraws[200]) {
        return 200;
    } else if (n >= minBonusDraws[150]) {
        return 150;
    } else if (n >= minBonusDraws[120]) {
        return 120;
    } else if (n >= minBonusDraws[100]) {
        return 100;
    } else if (n >= minBonusDraws[50]) {
        return 50;
    }
    return 0;
}

// 특정 뽑기 횟수에 대한 보상 계산 함수
function calculateRound(n, bonus, minBonusDraws, fixedRankBonus, coinPurchase, dp) {
    const key = `${n}-${bonus}`;
    if (dp[key] !== undefined) {
        return dp[key];
    }

    if (minBonusDraws[bonus] > n || bonus === 0) {
        dp[key] = 0;
        return 0;
    }

    let applicableBonus = calculateRankReward(n, bonus, minBonusDraws, fixedRankBonus);
    dp[key] = (n * 0.1588) + (Math.floor(n / 50) * 25) + (coinPurchase ? Math.floor(n / 4) : 0) + applicableBonus;
    return dp[key];
}

// 최적의 뽑기 계산 함수
function calculateOptimalDraws(targetReward, bonus1, bonus2, bonus3, coinPurchase, fixedRankBonus, dp) {
    const maxDraws = targetReward * 2;
    const minBonusDraws = {
        250: 600,
        200: 500,
        150: 400,
        120: 250,
        100: 200,
        50: 100,
        40: 100,
        30: 100,
        0: 0
    };

    let optimalResult = {
        n1: 0,
        n2: 0,
        n3: 0,
        reward: 0,
        totalDraws: Number.MAX_SAFE_INTEGER
    };

    // 탐색 범위를 줄이기 위한 조정
    for (let n1 = 0; n1 <= maxDraws; n1++) {
        let reward1 = calculateRound(n1, bonus1, minBonusDraws, fixedRankBonus, coinPurchase, dp);
        if (reward1 === 0 && n1 > 0) continue;

        for (let n2 = 0; n2 <= maxDraws - n1; n2++) {
            let reward2 = calculateRound(n2, bonus2, minBonusDraws, fixedRankBonus, coinPurchase, dp);
            if (reward2 === 0 && n2 > 0) continue;

            for (let n3 = 0; n3 <= maxDraws - n1 - n2; n3++) {
                let reward3 = calculateRound(n3, bonus3, minBonusDraws, fixedRankBonus, coinPurchase, dp);
                if (reward3 === 0 && n3 > 0) continue;

                let totalReward = reward1 + reward2 + reward3;
                let totalDraws = n1 + n2 + n3;

                if (totalReward >= targetReward && totalDraws < optimalResult.totalDraws) {
                    optimalResult = { n1, n2, n3, reward: totalReward, totalDraws };
                }

                if (totalReward >= targetReward) break; // 목표를 넘으면 탐색 중단
            }
        }
    }

    return optimalResult;
}

// 보상 결과를 출력하는 함수
function displayResult(round, draws, reward, bonus, coinPurchase, elementId, fixedRankBonus, minBonusDraws) {
    document.getElementById(elementId).innerHTML = '';
    if (draws > 0 || reward > 0) {
        let realBonus = calculateRankReward(draws, bonus, minBonusDraws, fixedRankBonus);
        let rankBonusInCollect = (!fixedRankBonus && bonus !== realBonus) ? "<span class='rank-adjustment'>(랭크보상이 조정됨)</span>" : "";

        document.getElementById(elementId).innerHTML = `
            <div class="result-card">
                <h3>${round}회차 기대치</h3>
                <ul>
                    <li><strong>최소뽑기 횟수:</strong> <span class="result-value">${draws}</span></li>
                    <li><strong>조각뽑기(15.88%):</strong> <span class="result-value">${(draws * 0.1588).toFixed(2)}</span></li>
                    <li><strong>50뽑기당 보상:</strong> <span class="result-value">${Math.floor(draws / 50) * 25}</span></li>
                    <li><strong>코인 구입 보상:</strong> <span class="result-value">${coinPurchase ? Math.floor(draws / 4) : 0}</span></li>
                    <li><strong>랭크 보상 ${rankBonusInCollect}:</strong> <span class="result-value">${realBonus}</span></li>
                    <li><strong>총 보상:</strong> <span class="result-value">${reward.toFixed(2)}</span></li>
                </ul>
            </div>
        `;
    } else if (bonus == 0) {
        document.getElementById(elementId).innerHTML = `
        <div class="result-card">
            <h3 style="color: #a22020;margin: 0;">${round}회차 미참여</h3>
        </div>
        `;
    } else if (bonus > 0) {
        document.getElementById(elementId).innerHTML = `
        <div class="result-card">
            <h3 style="color: #a22020;margin: 0;">${round}회차 무시됨(비효율)</h3>
        </div>
        `;
    }
}

// 입력값으로 최적의 뽑기 결과를 계산하고 결과를 화면에 출력하는 함수
function calculateAndDisplayResults() {
    const targetReward = parseFloat(document.getElementById("targetReward").value);
    const bonus1 = parseFloat(document.getElementById("bonus1").value);
    const bonus2 = parseFloat(document.getElementById("bonus2").value);
    const bonus3 = parseFloat(document.getElementById("bonus3").value);
    const coinPurchase = document.getElementById("coinPurchase").checked;
    const fixedRankBonus = document.getElementById("fixedRankBonus").checked;

    const minBonusDraws = {
        250: 600,
        200: 500,
        150: 400,
        120: 250,
        100: 200,
        50: 100,
        40: 100,
        30: 100,
        0: 0
    };

    // DP 캐시 초기화
    const dp = {};

    // 버튼 비활성화 및 메시지 표시
    const calculateButton = document.querySelector("button");
    calculateButton.disabled = true;
    calculateButton.textContent = "계산 중...";
    document.getElementById("resultsContainer").style.display = "block";

    document.getElementById("result-round1").innerHTML = "";
    document.getElementById("result-round2").innerHTML = "";
    document.getElementById("result-round3").innerHTML = "";
    document.getElementById("total-result").innerHTML = "계산 중입니다. 잠시만 기다려주세요...";


    // 0.5초 지연 후 최적 뽑기 계산 실행
    setTimeout(() => {
        // 최적 뽑기 계산
        const optimalResult = calculateOptimalDraws(targetReward, bonus1, bonus2, bonus3, coinPurchase, fixedRankBonus, dp);

        // 각 회차에 대한 결과 출력
        displayResult(1, optimalResult.n1, calculateRound(optimalResult.n1, bonus1, minBonusDraws, fixedRankBonus, coinPurchase, dp), bonus1, coinPurchase, "result-round1", fixedRankBonus, minBonusDraws);
        displayResult(2, optimalResult.n2, calculateRound(optimalResult.n2, bonus2, minBonusDraws, fixedRankBonus, coinPurchase, dp), bonus2, coinPurchase, "result-round2", fixedRankBonus, minBonusDraws);
        displayResult(3, optimalResult.n3, calculateRound(optimalResult.n3, bonus3, minBonusDraws, fixedRankBonus, coinPurchase, dp), bonus3, coinPurchase, "result-round3", fixedRankBonus, minBonusDraws);

        // 총 결과 출력
        document.getElementById("total-result").innerHTML = `
            <div><strong>총 조각수:</strong> ${optimalResult.reward}</div>
            <div><strong>총 뽑기 횟수:</strong> ${optimalResult.totalDraws}</div>
        `;

        // 버튼 활성화 및 메시지 제거
        calculateButton.disabled = false;
        calculateButton.textContent = "계산";
    }, 500); // 0.5초 지연
}
