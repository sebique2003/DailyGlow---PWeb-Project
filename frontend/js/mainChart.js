// Script pt Dashboard
function displayResults() {
    // DOM
    const sleep = parseFloat(document.getElementById('sleep').value) || 0;
    const water = parseFloat(document.getElementById('water').value) || 0;
    const calories = parseFloat(document.getElementById('calories').value) || 0;
    const steps = parseFloat(document.getElementById('steps').value) || 0;

    // display  in modal
    document.getElementById('display-sleep').textContent = sleep;
    document.getElementById('display-water').textContent = water;
    document.getElementById('display-calories').textContent = calories;
    document.getElementById('display-steps').textContent = steps;

    const scores = calculateHealthScore(sleep, water, calories, steps);

    generateRec(sleep, water, calories, steps);
    metricScore(scores.sleep, scores.water, scores.calories, scores.steps);
    generateChart(sleep, water, calories, steps);
}

// generate btn
document.getElementById('generateBtn').addEventListener('click', function () {
    const form = document.getElementById('healthForm');
    const inputs = form.querySelectorAll('input[type="number"]');
    let isValid = true;
    const invalidInputs = [];

    inputs.forEach(input => {
        const value = parseFloat(input.value);
        input.classList.remove('is-invalid');
        input.setCustomValidity('');

        let customError = '';

        if (!input.value.trim()) {
            customError = 'Acest câmp este obligatoriu';
        } else if (value <= 0) {
            customError = 'Introdu o valoare mai mare decât 0';
        } else if (input.id === 'sleep' && (value <= 1 || value >= 24)) {
            customError = 'Introdu între 1 și 24 ore';
        } else if (input.id === 'water' && (value <= 0.1 || value >= 15)) {
            customError = 'Introdu între 0.1 și 15 litri';
        } else if (input.id === 'calories' && (value <= 100 || value >= 10000)) {
            customError = 'Introdu între 100 și 10.000 calorii';
        } else if (input.id === 'steps' && (value <= 100 || value >= 30000)) {
            customError = 'Introdu între 100 și 30.000 pași';
        }

        if (customError) {
            input.setCustomValidity(customError);
            input.classList.add('is-invalid');
            input.reportValidity();
            isValid = false;
            invalidInputs.push(input);
        }
    });

    form.classList.add('was-validated');
    const messageElement = document.getElementById('message');

    if (isValid) {
        displayResults();
        const resultsModal = new bootstrap.Modal(document.getElementById('resultsModal'));
        resultsModal.show();
    } else {
        messageElement.textContent = 'Te rugăm să completezi toate câmpurile corect!';
        messageElement.className = 'text-danger text-center mt-3';

        setTimeout(() => {
            messageElement.textContent = '';
            messageElement.className = '';
            form.classList.remove('was-validated');

            invalidInputs.forEach(input => {
                input.classList.remove('is-invalid');
                input.setCustomValidity('');
            });
        }, 6000);
    }
});

// reset modal
document.getElementById('resultsModal').addEventListener('hidden.bs.modal', function () {
    const form = document.getElementById('healthForm');
    const inputs = form.querySelectorAll('input[type="number"]');

    form.classList.remove('was-validated');
    inputs.forEach(input => {
        input.classList.remove('is-invalid');
        input.classList.remove('is-valid');
        input.setCustomValidity('');
    });
});

// initialize metrics
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.metric-option').forEach(option => {
        option.addEventListener('click', function (e) {
            e.preventDefault();
            const metric = this.getAttribute('data-metric');

            document.querySelectorAll('.metric-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');

            const sleep = parseFloat(document.getElementById('display-sleep').textContent) || 0;
            const water = parseFloat(document.getElementById('display-water').textContent) || 0;
            const calories = parseFloat(document.getElementById('display-calories').textContent) || 0;
            const steps = parseFloat(document.getElementById('display-steps').textContent) || 0;

            generateChart(sleep, water, calories, steps, metric);
        });
    });
});

// fct health score
function calculateHealthScore(sleep, water, calories, steps) {
    const optimalRanges = {
        sleep: { min: 6, max: 9, absoluteMin: 4, absoluteMax: 12 },
        water: { min: 2, max: 4, absoluteMin: 1.5, absoluteMax: 6 },
        calories: { min: 1200, max: 3000, absoluteMin: 800, absoluteMax: 5000 },
        steps: { min: 5000, max: 15000, absoluteMin: 2000, absoluteMax: 25000 }
    };

    const sleepScore = calculateMetricScore(sleep, optimalRanges.sleep);
    const waterScore = calculateMetricScore(water, optimalRanges.water);
    const caloriesScore = calculateMetricScore(calories, optimalRanges.calories);
    const stepsScore = calculateMetricScore(steps, optimalRanges.steps);

    const overallScore = Math.round(
        (sleepScore * 0.3) +
        (waterScore * 0.2) +
        (caloriesScore * 0.2) +
        (stepsScore * 0.3)
    );

    // update health score UI
    updateHealthScoreUI(overallScore);

    return {
        overall: overallScore,
        sleep: sleepScore,
        water: waterScore,
        calories: caloriesScore,
        steps: stepsScore
    };
}

function calculateMetricScore(value, range) {
    if (value <= 0) return 0;

    if (value < range.min) {
        if (value <= range.absoluteMin) return 0;
        return Math.round(((value - range.absoluteMin) / (range.min - range.absoluteMin)) * 100);
    }

    if (value <= range.max) {
        return 100;
    }

    if (value >= range.absoluteMax) return 0;
    return Math.round(((range.absoluteMax - value) / (range.absoluteMax - range.max)) * 100);
}

// HS UI
function updateHealthScoreUI(score) {
    const healthScoreElement = document.getElementById('healthScore');
    const healthScoreBar = document.getElementById('healthScoreBar');
    const healthScoreText = document.getElementById('healthScoreText');

    healthScoreElement.textContent = `${score}/100`;
    healthScoreBar.style.width = `${score}%`;
    healthScoreBar.setAttribute('aria-valuenow', score);

    if (score >= 85) {
        healthScoreText.innerHTML = '<i class="fas fa-check-circle text-success me-1"></i> Excelent! Rutina ta este foarte sănătoasă. Menține-o!';
        healthScoreBar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-success';
        healthScoreElement.className = 'badge bg-success fs-5';
    } else if (score >= 70) {
        healthScoreText.innerHTML = '<i class="fas fa-thumbs-up text-primary me-1"></i> Bun! Câteva ajustări minore te pot aduce la nivel optim.';
        healthScoreBar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-primary';
        healthScoreElement.className = 'badge bg-primary fs-5';
    } else if (score >= 50) {
        healthScoreText.innerHTML = '<i class="fas fa-info-circle text-warning me-1"></i> Mediu. Recomandăm îmbunătățiri în mai multe domenii.';
        healthScoreBar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-warning';
        healthScoreElement.className = 'badge bg-warning fs-5';
    } else {
        healthScoreText.innerHTML = '<i class="fas fa-exclamation-triangle text-danger me-1"></i> Necesită atenție urgentă. Consultă recomandările noastre.';
        healthScoreBar.className = 'progress-bar progress-bar-striped progress-bar-animated bg-danger';
        healthScoreElement.className = 'badge bg-danger fs-5';
    }
}

let userChart = null;

// fct init chart
function normalize(value, min, max) {
    const percentage = ((value - min) / (max - min)) * 100;
    return Math.min(Math.max(percentage, 0), 100);
}

function generateChart(sleep, water, calories, steps, selectedMetric = 'all') {
    const ctx = document.getElementById('healthChart').getContext('2d');

    if (userChart) {
        userChart.destroy();
    }

    let optimalRanges = {
        sleep: { min: 6, max: 9, absoluteMin: 4, absoluteMax: 12, unit: 'ore', label: 'Somn' },
        water: { min: 2, max: 4, absoluteMin: 1.5, absoluteMax: 6, unit: 'litri', label: 'Apă' },
        calories: { min: 1200, max: 3000, absoluteMin: 800, absoluteMax: 5000, unit: 'calorii', label: 'Calorii' },
        steps: { min: 5000, max: 15000, absoluteMin: 2000, absoluteMax: 25000, unit: 'pași', label: 'Pași' }
    };

    // obtinem val reala
    const getRealValue = (key) => {
    const value = {
        sleep: sleep,
        water: water,
        calories: calories,
        steps: steps
    }[key];
    const range = optimalRanges[key];
    return Math.max(Math.min(value, range.absoluteMax), range.absoluteMin);
};

    let labels = [];
    let userData = [];
    let minData = [];
    let maxData = [];
    let selectedKeys = [];

    if (selectedMetric === 'all') {
        selectedKeys = ['sleep', 'water', 'calories', 'steps'];
    } else {
        selectedKeys = [selectedMetric];
    }

    for (const key of selectedKeys) {
        const range = optimalRanges[key];
        const realValue = getRealValue(key);

        labels.push(range.label);
        userData.push(normalize(realValue, range.absoluteMin, range.absoluteMax));
        minData.push(normalize(range.min, range.absoluteMin, range.absoluteMax));
        maxData.push(normalize(range.max, range.absoluteMin, range.absoluteMax));
    }

    const backgroundColors = [
        'rgba(54, 162, 235, 0.7)',   // somn
        'rgba(255, 206, 86, 0.7)',   // apa
        'rgba(75, 192, 192, 0.7)',   // calorii
        'rgba(153, 102, 255, 0.7)'   // pasi
    ];
    const borderColors = [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)'
    ];

    const datasets = [
        {
            label: 'Valoare',
            data: userData,
            backgroundColor: backgroundColors.slice(0, selectedKeys.length),
            borderColor: borderColors.slice(0, selectedKeys.length),
            borderWidth: 2
        },
        {
            label: 'Min',
            data: minData,
            type: 'line',
            fill: false,
            backgroundColor: 'rgba(0, 200, 83, 0.7)',
            borderColor: 'rgba(0, 200, 83, 1)',
            borderWidth: 2,
            tension: 0.3
        },
        {
            label: 'Max',
            data: maxData,
            type: 'line',
            fill: false,
            backgroundColor: 'rgba(255, 64, 129, 0.7)',
            borderColor: 'rgba(255, 64, 129, 1)',
            borderWidth: 2,
            tension: 0.3
        }
    ];

    userChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Procent față de intervalul extins'
                    },
                    ticks: {
                        callback: (value) => `${value}%`
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.dataset.label || '';
                            const key = selectedKeys[context.dataIndex];
                            const range = optimalRanges[key];
                            const realValue = eval(key);

                            if (context.datasetIndex === 0) {
                                const percentage = calculateMetricScore(
                                    realValue,
                                    {
                                        min: range.min,
                                        max: range.max,
                                        absoluteMin: range.absoluteMin,
                                        absoluteMax: range.absoluteMax
                                    }
                                );
                                return `${label}: ${realValue} ${range.unit} (${percentage}% din interval optim)`;
                            } else {
                                const original = context.dataset.label === 'Min'
                                    ? range.min
                                    : range.max;
                                return `${label}: ${original} ${range.unit}`;
                            }
                        }
                    }
                }
            }
        },
        legend: {
            position: 'top'
        },
        title: {
            display: true,
            text: 'Comparație cu intervalele recomandate',
            font: {
                size: 16
            }
        },
        annotation: {
            annotations:
                selectedMetric !== 'all'
                    ? {
                        minLine: {
                            type: 'line',
                            yMin: minData[0],
                            yMax: minData[0],
                            borderColor: 'rgba(0, 200, 83, 1)',
                            borderWidth: 2,
                            borderDash: [4, 4],
                            label: {
                                display: true,
                                content: 'Min',
                                color: 'rgba(0, 200, 83, 1)',
                                font: {
                                    size: 10,
                                    weight: 'bold'
                                },
                                backgroundColor: 'transparent',
                                position: 'start'
                            }
                        },
                        maxLine: {
                            type: 'line',
                            yMin: maxData[0],
                            yMax: maxData[0],
                            borderColor: 'rgba(255, 64, 129, 1)',
                            borderWidth: 2,
                            borderDash: [4, 4],
                            label: {
                                display: true,
                                content: 'Max',
                                color: 'rgba(255, 64, 129, 1)',
                                font: {
                                    size: 10,
                                    weight: 'bold'
                                },
                                backgroundColor: 'transparent',
                                position: 'end'
                            }
                        }
                    }
                    : {}
        }
    })
}

// recommendations
function generateRec(sleep, water, calories, steps) {
    // sleep rec
    const sleepRec = document.getElementById('sleepRecommendation');
    const sleepPercentage = calculateMetricScore(sleep, {
        min: 6, max: 9, absoluteMin: 4, absoluteMax: 12
    });

    if (sleep < 4) {
        sleepRec.innerHTML = `
            <strong>Somn critic de puțin (${sleep} ore, ${sleepPercentage}% din recomandat):</strong>
            <div class="health-risk">
                <p>⚠️ <strong>Riscuri grave:</strong> Scădere cu 40% a funcției cognitive, creștere de 3x a riscului de accident vascular, sistem imunitar compromis</p>
            </div>
            <p><strong>Soluții urgente:</strong></p>
            <ul>
                <li><strong>Ritual de culcare:</strong> 1h fără ecrane - lumină roșie, meditație 10 min, ceai de mușețel</li>
                <li><strong>Optimizare mediul:</strong> Temperatură 18°C, dopuri urechi dacă e zgomot, blackout curtains</li>
                <li><strong>Suplimente:</strong> Magneziu glicinat 400mg seara (după consult medic)</li>
                <li><strong>Alarme biologice:</strong> Expunere la lumină solară imediat după trezire</li>
            </ul>
            <div class="pro-tip">
                <p>💡 <strong>Expert tip:</strong> Folosește metoda "4-7-8" (inhalează 4s, ține 7s, exhalează 8s) pentru adormire rapidă</p>
            </div>
        `;
    } else if (sleep < 7) {
        sleepRec.innerHTML = `
            <strong>Somn insuficient (${sleep} ore, ${sleepPercentage}% din recomandat):</strong>
            <div class="health-risk">
                <p>⚠️ <strong>Efecte:</strong> Creștere hormon ghrelin (foame), scădere metabolism cu 15-20%, reducere rezistență la stres</p>
            </div>
            <p><strong>Strategii de îmbunătățire:</strong></p>
            <ul>
                <li><strong>Algoritm progresiv:</strong> Adaugă 15 min/săptămână până la 7.5-8h</li>
                <li><strong>Tehnologie:</strong> Filtre blue light (f.lux sau Night Shift) după ora 18</li>
                <li><strong>Alimentație:</strong> Proteine la cină (triptofan precursor melatonină)</li>
                <li><strong>Recuperare:</strong> Power naps de 20 min după-amiază (doar până la 15:00)</li>
            </ul>
        `;
    } else if (sleep > 9) {
        sleepRec.innerHTML = `
            <strong>Somn excesiv (${sleep} ore, ${sleepPercentage}% din recomandat):</strong>
            <div class="health-risk">
                <p>⚠️ <strong>Asociații medicale:</strong> Risc crescut de depresie (37%), inflamații sistemice, probleme cardiovasculare</p>
            </div>
            <p><strong>Acțiuni corective:</strong></p>
            <ul>
                <li><strong>Testare:</strong> Analize sânge pentru feritină, vitamina D și TSH</li>
                <li><strong>Stimulare circadiană:</strong> Lumină intensă 10.000 lux primul 1h după trezire</li>
                <li><strong>Exercițiu:</strong> Antrenament HIIT dimineața pentru energie</li>
                <li><strong>Monitorizare:</strong> Trackuit somn (Oura/Whoop) pentru detectare apnee</li>
            </ul>
        `;
    } else {
        sleepRec.innerHTML = `
            <strong>Somn optim (${sleep} ore, ${sleepPercentage}% din recomandat):</strong>
            <div class="health-benefit">
                <p>✅ <strong>Beneficii:</strong> Regenerare celulară maximă, consolidare memorie, echilibru hormonal perfect</p>
            </div>
            <p><strong>Strategii de menținere:</strong></p>
            <ul>
                <li><strong>Consistență:</strong> +/- 30 min față de program zilnic (inclusiv weekend)</li>
                <li><strong>Calitate:</strong> 20-25% somn profund (monitorizare cu wearables)</li>
                <li><strong>Biohacking:</strong> Temperatură ambientală ciclică (scădere 2°C între 2-4 AM)</li>
                <li><strong>Perfecționare:</strong> Testează cicluri de 90 min (5 sau 6 cicluri/noapte)</li>
            </ul>
        `;
    }

    // water rec - Partea 2/4
    const waterRec = document.getElementById('waterRecommendation');
    const waterPercentage = calculateMetricScore(water, {
        min: 2, max: 4, absoluteMin: 1.5, absoluteMax: 6
    });

    if (water < 1) {
        waterRec.innerHTML = `
            <strong>Hidratare critică (${water} litri, ${waterPercentage}% din recomandat):</strong>
            <div class="health-risk">
                <p>⚠️ <strong>Urgență:</strong> Funcții renale compromise, tensiune scăzută, confuzie mentală</p>
            </div>
            <p><strong>Protocol de rehidratare:</strong></p>
            <ul>
                <li><strong>Urgență:</strong> 500ml apă cu electroliți în următoarele 30 min</li>
                <li><strong>Algoritm:</strong> 150ml/15 min timp de 4 ore</li>
                <li><strong>Monitorizare:</strong> Urină mai des la 1h (dacă nu, consult medic)</li>
                <li><strong>Alimente:</strong> Supă de pui, pepene galben, castraveți</li>
            </ul>
        `;
    } else if (water < 2) {
        waterRec.innerHTML = `
            <strong>Hidratare insuficientă (${water} litri, ${waterPercentage}% din recomandat):</strong>
            <div class="health-risk">
                <p>⚠️ <strong>Efecte:</strong> Oboseală musculară crescută, dureri de cap, piele deshidratată</p>
            </div>
            <p><strong>Strategii inteligente:</strong></p>
            <ul>
                <li><strong>Sistem 1-1-1:</strong> 1 pahar la trezire, 1 înainte de fiecare masă, 1 la culcare</li>
                <li><strong>Infuzii:</strong> Apă cu lămâie/mentă/castraveți pentru gust</li>
                <li><strong>Tech:</strong> Aplicații hidratare (Waterllama) cu notificări personalizate</li>
                <li><strong>Biofeedback:</strong> Test pielă pe dosul mâinii (dacă rămâne pliată >1s, e deshidratare)</li>
            </ul>
        `;
    } else if (water > 4) {
        waterRec.innerHTML = `
            <strong>Hidratare excesivă (${water} litri, ${waterPercentage}% din recomandat):</strong>
            <div class="health-risk">
                <p>⚠️ <strong>Pericol:</strong> Hiponatremie (scădere sodiu), edem cerebral, insuficiență cardiacă</p>
            </div>
            <p><strong>Corecții necesare:</strong></p>
            <ul>
                <li><strong>Calcul:</strong> 30ml/kg greutate + 500ml/oră exercițiu intens</li>
                <li><strong>Electroliți:</strong> 1-2g sare Himalaya/litru la consum >3L/zi</li>
                <li><strong>Monitorizare:</strong> Culoare urine - galben pal (nu transparent)</li>
                <li><strong>Program:</strong> Nu bea >1L/oră (risc intoxicație apă)</li>
            </ul>
        `;
    } else {
        waterRec.innerHTML = `
            <strong>Hidratare optimă (${water} litri, ${waterPercentage}% din recomandat):</strong>
            <div class="health-benefit">
                <p>✅ <strong>Beneficii:</strong> Funcție renală perfectă, piele elastică, detoxifiere eficientă</p>
            </div>
            <p><strong>Optimizări avansate:</strong></p>
            <ul>
                <li><strong>Timing:</strong> 500ml dimineața la stomacul gol pentru detox</li>
                <li><strong>Calitate:</strong> Filtre osmoză inversă + remineralizare</li>
                <li><strong>Performanță:</strong> 200-250ml la 20°C înainte de antrenament</li>
                <li><strong>Biohacking:</strong> Apă structurată (frozen-thawed) pentru absorbție crescută</li>
            </ul>
        `;
    }

    // calories rec - Partea 3/4
    const caloriesRec = document.getElementById('caloriesRecommendation');
    const caloriesPercentage = calculateMetricScore(calories, {
        min: 1200, max: 3000, absoluteMin: 800, absoluteMax: 5000
    });

    if (calories < 1200) {
        caloriesRec.innerHTML = `
            <strong>Subnutriție (${calories} calorii, ${caloriesPercentage}% din recomandat):</strong>
            <div class="health-risk">
                <p>⚠️ <strong>Stare de criză:</strong> Piatra metabolică, pierdere mușchi, tulburări hormonale grave</p>
            </div>
            <p><strong>Plan de acțiune:</strong></p>
            <ul>
                <li><strong>Urgență:</strong> Creștere progresivă cu 100-200kcal/zi</li>
                <li><strong>Alimente:</strong> Avocado, nuci, unt de arahide (densitate calorică)</li>
                <li><strong>Suplimente:</strong> Vitamine liposolubile (A,D,E,K) sub supraveghere</li>
                <li><strong>Medical:</strong> Analize TSH, T3, T4, cortisol, estrogen/testosteron</li>
            </ul>
        `;
    } else if (calories < 1800) {
        caloriesRec.innerHTML = `
            <strong>Sub necesarul caloric (${calories} calorii, ${caloriesPercentage}% din recomandat):</strong>
            <div class="health-risk">
                <p>⚠️ <strong>Efecte:</strong> Oboseală cronică, scădere imunitate, cicluri menstruale neregulate</p>
            </div>
            <p><strong>Strategii de creștere:</strong></p>
            <ul>
                <li><strong>Snacksuri:</strong> Mix nuci (30g), hummus cu morcov, smoothie cu unt de migdale</li>
                <li><strong>Timing:</strong> 6 mese mici/zi în loc de 3 mari</li>
                <li><strong>Băuturi:</strong> Lapte de cocos, shake-uri proteice</li>
                <li><strong>Gătit:</strong> Adăugare uleiuri sănătoase (măsline, cocos) la preparate</li>
            </ul>
        `;
    } else if (calories > 3000) {
        caloriesRec.innerHTML = `
            <strong>Exces caloric (${calories} calorii, ${caloriesPercentage}% din recomandat):</strong>
            <div class="health-risk">
                <p>⚠️ <strong>Riscuri:</strong> Rezistență la insulină, grăsime viscerală, inflamație sistemică</p>
            </div>
            <p><strong>Plan de corecție:</strong></p>
            <ul>
                <li><strong>Reducere:</strong> Deficit 300-500kcal/zi pentru 0.5kg/săptămână</li>
                <li><strong>Înlocuiri:</strong> Legume în loc de paste, fructe în loc de dulciuri</li>
                <li><strong>Mindful eating:</strong> Mastica 20-30x/lovitură, pauze între feluri</li>
                <li><strong>Monitorizare:</strong> Jurnal alimentar + măsurători corporale săptămânale</li>
            </ul>
        `;
    } else {
        caloriesRec.innerHTML = `
            <strong>Balanță calorică optimă (${calories} calorii, ${caloriesPercentage}% din recomandat):</strong>
            <div class="health-benefit">
                <p>✅ <strong>Beneficii:</strong> Greutate stabilă, energie constantă, funcții hormonale optime</p>
            </div>
            <p><strong>Optimizări nutriționale:</strong></p>
            <ul>
                <li><strong>Macro:</strong> 40% carbohidrați complecși, 30% proteine, 30% grăsimi sănătoase</li>
                <li><strong>Micro:</strong> 800g legume/fructe zilnic pentru fibre și fitonutrienți</li>
                <li><strong>Timing:</strong> 80% calorii în primele 12h ale zilei (circadian eating)</li>
                <li><strong>Flexibilitate:</strong> 1 masă "cheat" pe săptămână pentru sustenabilitate</li>
            </ul>
        `;
    }

    // steps rec - Partea 4/4
    const stepsRec = document.getElementById('stepsRecommendation');
    const stepsPercentage = calculateMetricScore(steps, {
        min: 5000, max: 15000, absoluteMin: 2000, absoluteMax: 25000
    });

    if (steps < 3000) {
        stepsRec.innerHTML = `
            <strong>Sedentarism (${steps} pași, ${stepsPercentage}% din recomandat):</strong>
            <div class="health-risk">
                <p>⚠️ <strong>Echivalent:</strong> Risc similar cu fumatul 1 pachet/zi, atrofie musculară progresivă</p>
            </div>
            <p><strong>Reabilitare progresivă:</strong></p>
            <ul>
                <li><strong>Start mic:</strong> +5% pași/zi (ex: de la 2000 la 2100)</li>
                <li><strong>Rutină:</strong> Plimbare 10 min după fiecare masă principală</li>
                <li><strong>Workplace:</strong> Birou în picioare 15 min/oră, scaun ergonomic</li>
                <li><strong>Tech:</strong> Alarmă la fiecare 50 min pentru stretch breaks</li>
            </ul>
        `;
    } else if (steps < 6000) {
        stepsRec.innerHTML = `
            <strong>Activitate moderată (${steps} pași, ${stepsPercentage}% din recomandat):</strong>
            <div class="health-risk">
                <p>⚠️ <strong>Efecte:</strong> Scădere metabolism cu 10-15%, risc crescut de diabet tip 2</p>
            </div>
            <p><strong>Strategii de creștere:</strong></p>
            <ul>
                <li><strong>Obiective SMART:</strong> +500 pași/săptămână până la 8000/zi</li>
                <li><strong>Social:</strong> Walk-and-talk meetings, plimbări în natură cu prietenii</li>
                <li><strong>Gamification:</strong> Competiții pe aplicații (Strava, Pacer)</li>
                <li><strong>Diversificare:</strong> Adaugă 2 zile/săptămână cu exerciții de rezistență</li>
            </ul>
        `;
    } else if (steps > 15000) {
        stepsRec.innerHTML = `
            <strong>Activitate foarte ridicată (${steps} pași, ${stepsPercentage}% din recomandat):</strong>
            <div class="health-risk">
                <p>⚠️ <strong>Riscuri:</strong> Uzură articulară, risc de rabdomioliză, oboseală adrenală</p>
            </div>
            <p><strong>Management inteligent:</strong></p>
            <ul>
                <li><strong>Recuperare:</strong> 1 zi/săptămână cu <5000 pași pentru reparare tisulară</li>
                <li><strong>Încălțăminte:</strong> Schimbă perechile la fiecare 800km</li>
                <li><strong>Suplimentare:</strong> Glucozamină + MSM pentru articulații</li>
                <li><strong>Monitorizare:</strong> Analize CPK și markeri inflamatori la 3 luni</li>
            </ul>
        `;
    } else {
        stepsRec.innerHTML = `
            <strong>Activitate optimă (${steps} pași, ${stepsPercentage}% din recomandat):</strong>
            <div class="health-benefit">
                <p>✅ <strong>Beneficii:</strong> Sănătate cardiovasculară excelentă, longevitate crescută, echilibru hormonal</p>
            </div>
            <p><strong>Optimizări avansate:</strong></p>
            <ul>
                <li><strong>Variație:</strong> 3 zile pași normali + 2 zile HIIT + 2 zile greutăți</li>
                <li><strong>Terapie:</strong> Mers desculț pe iarbă/nisip 20 min/zi (grounding)</li>
                <li><strong>Postură:</strong> Corectare mers (talon->degete, pelvis neutru, umeri relaxați)</li>
                <li><strong>Biohacking:</strong> Mers invers 5 min/zi pentru stimulare neuromusculară</li>
            </ul>
        `;
    }
}

// fct update metric score
function metricScore(sleepScore, waterScore, caloriesScore, stepsScore) {
    const updateBadge = (elementId, score, metricName) => {
        const badge = document.getElementById(elementId);
        badge.textContent = `${score}%`;

        let iconClass = '';
        let badgeClass = '';

        if (score >= 85) {
            badgeClass = 'success';
            iconClass = 'fa-check-circle';
        } else if (score >= 70) {
            badgeClass = 'primary';
            iconClass = 'fa-thumbs-up';
        } else if (score >= 50) {
            badgeClass = 'warning';
            iconClass = 'fa-info-circle';
        } else {
            badgeClass = 'danger';
            iconClass = 'fa-exclamation-triangle';
        }

        badge.className = `badge bg-${badgeClass} ms-2`;
        badge.innerHTML = `<i class="fas ${iconClass} me-1"></i> ${score}%`;
        badge.setAttribute('data-bs-toggle', 'tooltip');
        badge.setAttribute('data-bs-placement', 'top');
        badge.setAttribute('title', `Scorul tău pentru ${metricName}: ${score}/100`);
        new bootstrap.Tooltip(badge);
    };

    updateBadge('sleepScoreBadge', sleepScore, 'somn');
    updateBadge('waterScoreBadge', waterScore, 'apă');
    updateBadge('caloriesScoreBadge', caloriesScore, 'calorii');
    updateBadge('stepsScoreBadge', stepsScore, 'pași');
}


