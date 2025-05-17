// Script pt Dashboard
function displayResults() {
    // DOM
    const sleep = parseFloat(document.getElementById('sleep').value) || 0;
    const water = parseFloat(document.getElementById('water').value) || 0;
    const calories = parseFloat(document.getElementById('calories').value) || 0;
    const steps = parseFloat(document.getElementById('steps').value) || 0;

    // display in modal
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
    if (value >= range.min && value <= range.max) {
        return 100;
    }

    if (value < range.min) {
        if (value < range.absoluteMin) return 0;
        if (value === range.absoluteMin) return 10;
        const progress = (value - range.absoluteMin) / (range.min - range.absoluteMin);
        return Math.round(10 + progress * 90);
    }

    if (value > range.max) {
        if (value > range.absoluteMax) return 0;
        if (value === range.absoluteMax) return 10;
        const progress = (range.absoluteMax - value) / (range.absoluteMax - range.max);
        return Math.round(10 + progress * 90);
    }

    return 0;
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
    const sleepScore = calculateMetricScore(sleep, { min: 6, max: 9, absoluteMin: 4, absoluteMax: 12 });
    const waterScore = calculateMetricScore(water, { min: 2, max: 4, absoluteMin: 1.5, absoluteMax: 6 });
    const caloriesScore = calculateMetricScore(calories, { min: 1200, max: 3000, absoluteMin: 800, absoluteMax: 5000 });
    const stepsScore = calculateMetricScore(steps, { min: 5000, max: 15000, absoluteMin: 2000, absoluteMax: 25000 });

    // Sleep Recommendations
    const sleepRec = document.getElementById('sleepRecommendation');
    if (sleep < 4) {
        sleepRec.innerHTML = `
            <h5 class="mb-3"><i class="fas fa-exclamation-triangle text-danger me-2"></i>Risc ridicat (${sleepScore}%) - Somn insuficient!</h5>
            <p class="mb-3">Dormi doar ${sleep} ore, ceea ce este mult sub nivelul recomandat de 7-9 ore și reprezintă un risc serios pentru sănătatea ta.</p>
            <div class="alert alert-danger mb-3">
                <h6 class="alert-heading mb-2"><i class="fas fa-exclamation-circle me-1"></i> Riscuri pentru sănătate:</h6>
                <ul class="mb-0">
                    <li>Sistem imunitar slăbit și susceptibilitate crescută la boli</li>
                    <li>Creșterea riscului de boli cardiovasculare și diabet</li>
                    <li>Deficiențe cognitive și de memorie</li>
                    <li>Dificultăți de concentrare și risc crescut de accidente</li>
                    <li>Probleme emoționale: anxietate, depresie și iritabilitate</li>
                </ul>
            </div>
            <div class="alert alert-success mb-0">
                <h6 class="alert-heading mb-2"><i class="fas fa-lightbulb me-1"></i> Recomandări:</h6>
                <ul class="mb-0">
                    <li>Stabilește un program regulat de somn, inclusiv în weekend</li>
                    <li>Creează un ritual de culcare relaxant (fără dispozitive electronice)</li>
                    <li>Optimizează mediul de dormit: temperatură ideală 18-20°C, liniște, întuneric</li>
                    <li>Evită cofeina și alcoolul cu 4-6 ore înainte de culcare</li>
                    <li>Consideră consultarea unui specialist în somn dacă ai probleme persistente</li>
                </ul>
            </div>
        `;
    } else if (sleep < 7) {
        sleepRec.innerHTML = `
            <h5 class="mb-3"><i class="fas fa-info-circle text-warning me-2"></i>Atenție (${sleepScore}%) - Somn sub nivelul optim</h5>
            <p class="mb-3">Dormi ${sleep} ore, sub intervalul recomandat de 7-9 ore. Deși nu este critic, acest nivel poate afecta calitatea vieții tale.</p>
            <div class="alert alert-warning mb-3">
                <h6 class="alert-heading mb-2"><i class="fas fa-exclamation-circle me-1"></i> Posibile efecte:</h6>
                <ul class="mb-0">
                    <li>Scăderea productivității și a capacității de concentrare</li>
                    <li>Dispoziție fluctuantă și iritabilitate</li>
                    <li>Metabolism afectat și potențiale pofte alimentare nesănătoase</li>
                    <li>Recuperare mai lentă după efort fizic</li>
                </ul>
            </div>
            <div class="alert alert-success mb-0">
                <h6 class="alert-heading mb-2"><i class="fas fa-lightbulb me-1"></i> Recomandări:</h6>
                <ul class="mb-0">
                    <li>Adaugă treptat 15-30 minute la timpul de somn în fiecare noapte</li>
                    <li>Menține un program consecvent de somn</li>
                    <li>Limitează expunerea la lumină albastră cu 1-2 ore înainte de culcare</li>
                    <li>Încearcă tehnici de relaxare: meditație, respirație profundă</li>
                    <li>Evită mesele grele și exercițiile intense înainte de culcare</li>
                </ul>
            </div>
        `;
    } else if (sleep > 9) {
        sleepRec.innerHTML = `
            <h5 class="mb-3"><i class="fas fa-info-circle text-warning me-2"></i>Atenție (${sleepScore}%) - Somn prelungit</h5>
            <p class="mb-3">Dormi ${sleep} ore, peste intervalul recomandat de 7-9 ore. Somnul prelungit poate fi un indicator al unor probleme de sănătate.</p>
            <div class="alert alert-warning mb-3">
                <h6 class="alert-heading mb-2"><i class="fas fa-exclamation-circle me-1"></i> Posibile cauze și riscuri:</h6>
                <ul class="mb-0">
                    <li>Poate indica probleme de sănătate precum depresia, apnee de somn sau boli cronice</li>
                    <li>Asociat cu un risc crescut de obezitate și probleme cardiovasculare</li>
                    <li>Poate duce la letargie și scăderea energiei în timpul zilei</li>
                    <li>Calitatea somnului poate fi compromisă, chiar dacă durata este lungă</li>
                </ul>
            </div>
            <div class="alert alert-success mb-0">
                <h6 class="alert-heading mb-2"><i class="fas fa-lightbulb me-1"></i> Recomandări:</h6>
                <ul class="mb-0">
                    <li>Verifică calitatea somnului și factorii de mediu</li>
                    <li>Menține un program regulat de somn și trezire</li>
                    <li>Consultă un medic pentru a exclude probleme medicale subiacente</li>
                    <li>Crește treptat activitatea fizică pe parcursul zilei</li>
                    <li>Încearcă să reduci treptat timpul de somn cu 15-30 minute</li>
                </ul>
            </div>
        `;
    } else {
        sleepRec.innerHTML = `
            <h5 class="mb-3"><i class="fas fa-check-circle text-success me-2"></i>Excelent (${sleepScore}%) - Somn optim</h5>
            <p class="mb-3">Dormi ${sleep} ore, ceea ce este perfect în intervalul recomandat de 7-9 ore. Continuă să menții acest obicei sănătos!</p>
            <div class="alert alert-success mb-3">
                <h6 class="alert-heading mb-2"><i class="fas fa-check-circle me-1"></i> Beneficii pentru sănătate:</h6>
                <ul class="mb-0">
                    <li>Funcție cognitivă îmbunătățită și productivitate crescută</li>
                    <li>Sistem imunitar fortificat și rezistență la boli</li>
                    <li>Stabilitate emoțională și reduce riscul de depresie</li>
                    <li>Metabolism sănătos și controlul greutății</li>
                    <li>Recuperare optimă a corpului și regenerare celulară</li>
                </ul>
            </div>
            <div class="alert alert-info mb-0">
                <h6 class="alert-heading mb-2"><i class="fas fa-lightbulb me-1"></i> Pentru a menține acest nivel:</h6>
                <ul class="mb-0">
                    <li>Continuă să respecți programul regulat de somn</li>
                    <li>Prioritizează somnul ca parte esențială a sănătății tale</li>
                    <li>Monitorizează calitatea somnului, nu doar cantitatea</li>
                    <li>Menține obiceiuri sănătoase: exerciții fizice regulate și alimentație echilibrată</li>
                </ul>
            </div>
        `;
    }

    // Water Recommendations
    const waterRec = document.getElementById('waterRecommendation');
    if (water < 1.5) {
        waterRec.innerHTML = `
            <h5 class="mb-3"><i class="fas fa-exclamation-triangle text-danger me-2"></i>Risc ridicat (${waterScore}%) - Hidratare insuficientă!</h5>
            <p class="mb-3">Consumi doar ${water} litri de apă zilnic, mult sub nivelul minim recomandat de 2 litri.</p>
            <div class="alert alert-danger mb-3">
                <h6 class="alert-heading mb-2"><i class="fas fa-exclamation-circle me-1"></i> Riscuri pentru sănătate:</h6>
                <ul class="mb-0">
                    <li>Deshidratare cronică și funcționare defectuoasă a organelor</li>
                    <li>Capacitate fizică și mentală redusă</li>
                    <li>Probleme digestive și constipație</li>
                    <li>Risc crescut de infecții urinare și calculi renali</li>
                    <li>Piele uscată și probleme dermatologice</li>
                </ul>
            </div>
            <div class="alert alert-success mb-0">
                <h6 class="alert-heading mb-2"><i class="fas fa-lightbulb me-1"></i> Recomandări:</h6>
                <ul class="mb-0">
                    <li>Crește treptat consumul de apă cu câte 250ml pe zi</li>
                    <li>Bea un pahar de apă imediat după trezire</li>
                    <li>Folosește o sticlă reutilizabilă și setează alarme pentru hidratare</li>
                    <li>Consumă alimente bogate în apă: fructe, legume, supe</li>
                    <li>Limitează consumul de băuturi diuretice (cafea, alcool)</li>
                </ul>
            </div>
        `;
    } else if (water < 2) {
        waterRec.innerHTML = `
            <h5 class="mb-3"><i class="fas fa-info-circle text-warning me-2"></i>Atenție (${waterScore}%) - Hidratare sub nivelul optim</h5>
            <p class="mb-3">Consumi ${water} litri de apă zilnic, ușor sub pragul recomandat de 2-4 litri.</p>
            <div class="alert alert-warning mb-3">
                <h6 class="alert-heading mb-2"><i class="fas fa-exclamation-circle me-1"></i> Posibile efecte:</h6>
                <ul class="mb-0">
                    <li>Scăderea nivelului de energie și a performanței</li>
                    <li>Dificultăți de concentrare și dureri de cap</li>
                    <li>Funcție digestivă și metabolism suboptimale</li>
                    <li>Toleranță redusă la efort fizic</li>
                </ul>
            </div>
            <div class="alert alert-success mb-0">
                <h6 class="alert-heading mb-2"><i class="fas fa-lightbulb me-1"></i> Recomandări:</h6>
                <ul class="mb-0">
                    <li>Adaugă încă 500ml de apă la consumul zilnic</li>
                    <li>Bea un pahar de apă înainte de fiecare masă</li>
                    <li>Utilizează aplicații de monitorizare a hidratării</li>
                    <li>Încorporează mai multe ceaiuri neîndulcite și infuzii</li>
                    <li>Reglează consumul de apă în funcție de activitatea fizică și condițiile meteorologice</li>
                </ul>
            </div>
        `;
    } else if (water > 4) {
        waterRec.innerHTML = `
            <h5 class="mb-3"><i class="fas fa-info-circle text-warning me-2"></i>Atenție (${waterScore}%) - Consum ridicat de apă</h5>
            <p class="mb-3">Consumi ${water} litri de apă zilnic, peste intervalul recomandat de 2-4 litri.</p>
            <div class="alert alert-warning mb-3">
                <h6 class="alert-heading mb-2"><i class="fas fa-exclamation-circle me-1"></i> Posibile riscuri:</h6>
                <ul class="mb-0">
                    <li>Hiponatremie (nivel scăzut de sodiu) în cazuri extreme</li>
                    <li>Eliminarea excesivă a electroliților și mineralelor</li>
                    <li>Presiune suplimentară asupra rinichilor</li>
                    <li>Întreruperi frecvente ale activităților zilnice pentru urinare</li>
                </ul>
            </div>
            <div class="alert alert-success mb-0">
                <h6 class="alert-heading mb-2"><i class="fas fa-lightbulb me-1"></i> Recomandări:</h6>
                <ul class="mb-0">
                    <li>Dacă nu ai indicații medicale speciale, reduce treptat consumul spre 3-4 litri pe zi</li>
                    <li>Asigură-te că incluzi surse de electroliți în alimentație</li>
                    <li>Monitorizează culoarea urinei (ar trebui să fie galben pal, nu complet incoloră)</li>
                    <li>Reglează consumul de apă în funcție de nivelul de activitate fizică și mediu</li>
                    <li>Consultă un medic dacă ai o sete persistentă neobișnuită</li>
                </ul>
            </div>
        `;
    } else {
        waterRec.innerHTML = `
            <h5 class="mb-3"><i class="fas fa-check-circle text-success me-2"></i>Excelent (${waterScore}%) - Hidratare optimă</h5>
            <p class="mb-3">Consumi ${water} litri de apă zilnic, perfect în intervalul recomandat de 2-4 litri.</p>
            <div class="alert alert-success mb-3">
                <h6 class="alert-heading mb-2"><i class="fas fa-check-circle me-1"></i> Beneficii pentru sănătate:</h6>
                <ul class="mb-0">
                    <li>Funcționare optimă a organelor și metabolismului</li>
                    <li>Capacitate cognitivă și nivel de energie îmbunătățite</li>
                    <li>Detoxifiere eficientă și susținerea funcției renale</li>
                    <li>Aspect sănătos al pielii și hidratare celulară</li>
                    <li>Reglare termică eficientă a corpului</li>
                </ul>
            </div>
            <div class="alert alert-info mb-0">
                <h6 class="alert-heading mb-2"><i class="fas fa-lightbulb me-1"></i> Pentru a menține acest nivel:</h6>
                <ul class="mb-0">
                    <li>Continuă rutina de hidratare pe parcursul zilei</li>
                    <li>Ajustează consumul în funcție de activitățile fizice și temperatură</li>
                    <li>Menține o varietate de surse de hidratare: apă, ceaiuri, supe</li>
                    <li>Monitorizează în continuare hidratarea prin observarea simptomelor și culorii urinei</li>
                </ul>
            </div>
        `;
    }

    // Calories Recommendations
    const caloriesRec = document.getElementById('caloriesRecommendation');
    if (calories < 1200) {
        caloriesRec.innerHTML = `
            <h5 class="mb-3"><i class="fas fa-exclamation-triangle text-danger me-2"></i>Risc ridicat (${caloriesScore}%) - Aport caloric insuficient!</h5>
            <p class="mb-3">Consumi doar ${calories} calorii zilnic, mult sub nivelul minim recomandat de 1200 calorii.</p>
            <div class="alert alert-danger mb-3">
                <h6 class="alert-heading mb-2"><i class="fas fa-exclamation-circle me-1"></i> Riscuri pentru sănătate:</h6>
                <ul class="mb-0">
                    <li>Deficit nutrițional sever și carențe vitaminice</li>
                    <li>Pierdere de masă musculară și densitate osoasă</li>
                    <li>Metabolism încetinit și adaptare la "regim de înfometare"</li>
                    <li>Funcții cognitive afectate și nivel scăzut de energie</li>
                    <li>Probleme hormonale și imunitare</li>
                </ul>
            </div>
            <div class="alert alert-success mb-0">
                <h6 class="alert-heading mb-2"><i class="fas fa-lightbulb me-1"></i> Recomandări:</h6>
                <ul class="mb-0">
                    <li>Crește treptat aportul caloric cu 100-200 calorii zilnic</li>
                    <li>Concentrează-te pe alimente dense nutrițional: proteine, grăsimi sănătoase</li>
                    <li>Consumă mai multe mese mici pe parcursul zilei</li>
                    <li>Consultă un nutriționist pentru un plan personalizat</li>
                    <li>Monitorizează composiția corporală, nu doar greutatea</li>
                </ul>
            </div>
        `;
    } else if (calories < 1800) {
        caloriesRec.innerHTML = `
            <h5 class="mb-3"><i class="fas fa-info-circle text-warning me-2"></i>Atenție (${caloriesScore}%) - Aport caloric moderat</h5>
            <p class="mb-3">Consumi ${calories} calorii zilnic, în partea inferioară a intervalului recomandat.</p>
            <div class="alert alert-warning mb-3">
                <h6 class="alert-heading mb-2"><i class="fas fa-exclamation-circle me-1"></i> Posibile efecte:</h6>
                <ul class="mb-0">
                    <li>Potențial deficit energetic pentru persoanele active</li>
                    <li>Risc de pierdere musculară dacă aportul proteic este inadecvat</li>
                    <li>Posibilă lipsă a unor micronutrienți importanți</li>
                    <li>Recuperare mai lentă după efort fizic</li>
                </ul>
            </div>
            <div class="alert alert-success mb-0">
                <h6 class="alert-heading mb-2"><i class="fas fa-lightbulb me-1"></i> Recomandări:</h6>
                <ul class="mb-0">
                    <li>Evaluează dacă acest nivel caloric susține nivelul tău de activitate</li>
                    <li>Asigură-te că incluzi suficiente proteine (min. 0.8g/kg greutate corporală)</li>
                    <li>Prioritizează alimentele integrale și nutrițional dense</li>
                    <li>Monitorizează nivelul de energie și performanța</li>
                    <li>Consideră suplimentarea cu multivitamine dacă dieta este restrictivă</li>
                </ul>
            </div>
        `;
    } else if (calories > 3000) {
        caloriesRec.innerHTML = `
            <h5 class="mb-3"><i class="fas fa-info-circle text-warning me-2"></i>Atenție (${caloriesScore}%) - Aport caloric ridicat</h5>
            <p class="mb-3">Consumi ${calories} calorii zilnic, peste nivelul recomandat.</p>
            <div class="alert alert-warning mb-3">
                <h6 class="alert-heading mb-2"><i class="fas fa-exclamation-circle me-1"></i> Posibile riscuri:</h6>
                <ul class="mb-0">
                    <li>Creștere în greutate și acumulare de grăsime corporală</li>
                    <li>Risc crescut de boli metabolice și cardiovasculare</li>
                    <li>Încărcare metabolică crescută și potențial inflamator</li>
                    <li>Disconfort digestiv și tulburări de somn</li>
                </ul>
            </div>
            <div class="alert alert-success mb-0">
                <h6 class="alert-heading mb-2"><i class="fas fa-lightbulb me-1"></i> Recomandări:</h6>
                <ul class="mb-0">
                    <li>Verifică dacă acest nivel caloric este justificat de activitatea ta (sportivi de performanță)</li>
                    <li>Concentrează-te pe calitatea caloriilor, nu doar pe cantitate</li>
                    <li>Distribuie aportul caloric uniform pe parcursul zilei</li>
                    <li>Mărește nivelul de activitate fizică pentru a echilibra balanța energetică</li>
                    <li>Reduce treptat aportul cu 100-200 calorii, dacă este necesar</li>
                </ul>
            </div>
        `;
    } else {
        caloriesRec.innerHTML = `
            <h5 class="mb-3"><i class="fas fa-check-circle text-success me-2"></i>Excelent (${caloriesScore}%) - Aport caloric optim</h5>
            <p class="mb-3">Consumi ${calories} calorii zilnic, un nivel echilibrat.</p>
            <div class="alert alert-success mb-3">
                <h6 class="alert-heading mb-2"><i class="fas fa-check-circle me-1"></i> Beneficii pentru sănătate:</h6>
                <ul class="mb-0">
                    <li>Susținerea funcțiilor metabolice optime</li>
                    <li>Energie constantă pe parcursul zilei</li>
                    <li>Menținerea masei musculare și a densității osoase</li>
                    <li>Funcție hormonală echilibrată</li>
                    <li>Controlul greutății pe termen lung</li>
                </ul>
            </div>
            <div class="alert alert-info mb-0">
                <h6 class="alert-heading mb-2"><i class="fas fa-lightbulb me-1"></i> Pentru a menține acest nivel:</h6>
                <ul class="mb-0">
                    <li>Continuă să monitorizezi aportul caloric și compoziția mesei</li>
                    <li>Ajustează în funcție de activitatea fizică și obiectivele personale</li>
                    <li>Menține diversitatea alimentară pentru aport complet de nutrienți</li>
                    <li>Echilibrează macronutrienții: proteine, carbohidrați și grăsimi sănătoase</li>
                </ul>
            </div>
        `;
    }

    // Steps Recommendations
    const stepsRec = document.getElementById('stepsRecommendation');
    if (steps < 3000) {
        stepsRec.innerHTML = `
            <h5 class="mb-3"><i class="fas fa-exclamation-triangle text-danger me-2"></i>Risc ridicat (${stepsScore}%) - Activitate fizică foarte scăzută!</h5>
            <p class="mb-3">Parcurgi doar ${steps} pași pe zi, mult sub nivelul minim recomandat de 5000 pași.</p>
            <div class="alert alert-danger mb-3">
                <h6 class="alert-heading mb-2"><i class="fas fa-exclamation-circle me-1"></i> Riscuri pentru sănătate:</h6>
                <ul class="mb-0">
                    <li>Risc crescut de boli cardiovasculare și diabet</li>
                    <li>Scăderea rezistenței musculare și a mobilității</li>
                    <li>Creșterea riscului de obezitate și probleme metabolice</li>
                    <li>Efecte negative asupra sănătății mentale și a stării generale</li>
                </ul>
            </div>
            <div class="alert alert-success mb-0">
                <h6 class="alert-heading mb-2"><i class="fas fa-lightbulb me-1"></i> Recomandări:</h6>
                <ul class="mb-0">
                    <li>Începe cu plimbări scurte de 5-10 minute, de 2-3 ori pe zi</li>
                    <li>Folosește orice oportunitate pentru a te mișca (ex: urcă scările, evită liftul)</li>
                    <li>Țintește gradual să ajungi la cel puțin 5000 pași pe zi</li>
                    <li>Încorporează exerciții de întindere și mobilitate</li>
                </ul>
            </div>
        `;
    } else if (steps < 5000) {
        stepsRec.innerHTML = `
            <h5 class="mb-3"><i class="fas fa-info-circle text-warning me-2"></i>Atenție (${stepsScore}%) - Activitate fizică sub optim</h5>
            <p class="mb-3">Parcurgi ${steps} pași pe zi, ușor sub pragul recomandat de 5000-10000 pași.</p>
            <div class="alert alert-warning mb-3">
                <h6 class="alert-heading mb-2"><i class="fas fa-exclamation-circle me-1"></i> Posibile efecte:</h6>
                <ul class="mb-0">
                    <li>Rezistență cardiovasculară și musculară limitată</li>
                    <li>Performanță fizică redusă și energie scăzută</li>
                    <li>Risc mai mare de apariție a afecțiunilor cronice</li>
                    <li>Mobilitate redusă în timp</li>
                </ul>
            </div>
            <div class="alert alert-success mb-0">
                <h6 class="alert-heading mb-2"><i class="fas fa-lightbulb me-1"></i> Recomandări:</h6>
                <ul class="mb-0">
                    <li>Adaugă plimbări de 15-20 minute zilnic</li>
                    <li>Fă pauze active la locul de muncă sau acasă</li>
                    <li>Monitorizează-ți progresul și crește treptat numărul pașilor</li>
                    <li>Combină mersul cu alte forme de activitate fizică (calisthenics, stretching)</li>
                </ul>
            </div>
        `;
    } else if (steps > 15000) {
        stepsRec.innerHTML = `
            <h5 class="mb-3"><i class="fas fa-info-circle text-warning me-2"></i>Atenție (${stepsScore}%) - Nivel ridicat de activitate</h5>
            <p class="mb-3">Parcurgi ${steps} pași pe zi, peste nivelul recomandat de 10000-15000 pași.</p>
            <div class="alert alert-warning mb-3">
                <h6 class="alert-heading mb-2"><i class="fas fa-exclamation-circle me-1"></i> Posibile riscuri:</h6>
                <ul class="mb-0">
                    <li>Suprasolicitare musculară și articulară</li>
                    <li>Oboseală excesivă și risc crescut de accidentări</li>
                    <li>Necesitatea unei recuperări adecvate și echilibrate</li>
                </ul>
            </div>
            <div class="alert alert-success mb-0">
                <h6 class="alert-heading mb-2"><i class="fas fa-lightbulb me-1"></i> Recomandări:</h6>
                <ul class="mb-0">
                    <li>Asigură-te că ai perioade suficiente de odihnă și recuperare</li>
                    <li>Include exerciții de întindere și mobilitate pentru a preveni accidentările</li>
                    <li>Monitorizează orice durere sau disconfort și adaptează intensitatea</li>
                    <li>Consultă un specialist dacă ai dureri persistente</li>
                </ul>
            </div>
        `;
    } else {
        stepsRec.innerHTML = `
            <h5 class="mb-3"><i class="fas fa-check-circle text-success me-2"></i>Excelent (${stepsScore}%) - Nivel optim de activitate fizică</h5>
            <p class="mb-3">Parcurgi ${steps} pași pe zi, în intervalul recomandat de 5000-15000 pași.</p>
            <div class="alert alert-success mb-3">
                <h6 class="alert-heading mb-2"><i class="fas fa-check-circle me-1"></i> Beneficii pentru sănătate:</h6>
                <ul class="mb-0">
                    <li>Susține sănătatea cardiovasculară și metabolică</li>
                    <li>Îmbunătățește forța și rezistența musculară</li>
                    <li>Reduce riscul de boli cronice</li>
                    <li>Crește nivelul de energie și bunăstare generală</li>
                    <li>Contribuie la menținerea greutății optime</li>
                </ul>
            </div>
            <div class="alert alert-info mb-0">
                <h6 class="alert-heading mb-2"><i class="fas fa-lightbulb me-1"></i> Pentru a menține acest nivel:</h6>
                <ul class="mb-0">
                    <li>Continuă rutina zilnică de mers pe jos și activitate fizică</li>
                    <li>Varietatea exercițiilor (calisthenics, cardio, mobilitate) ajută la echilibru</li>
                    <li>Monitorizează-ți progresul și ajustează obiectivele periodic</li>
                    <li>Ascultă-ți corpul și adaptează intensitatea când este nevoie</li>
                </ul>
            </div>
        `;
    }
}

// fct update metric score
function metricScore(sleepScore, waterScore, caloriesScore, stepsScore) {
    const updateBadge = (elementId, score, metricName) => {
        const badge = document.getElementById(elementId);

        let iconClass, progressClass, textColor;

        if (score >= 85) {
            badgeClass = 'success';
            iconClass = 'fa-check-circle';
            progressClass = 'bg-success';
            textColor = 'text-success';
        } else if (score >= 70) {
            badgeClass = 'primary';
            iconClass = 'fa-thumbs-up';
            progressClass = 'bg-primary';
            textColor = 'text-primary';
        } else if (score >= 50) {
            badgeClass = 'warning';
            iconClass = 'fa-info-circle';
            progressClass = 'bg-warning';
            textColor = 'text-warning';
        } else {
            badgeClass = 'danger';
            iconClass = 'fa-exclamation-triangle';
            progressClass = 'bg-danger';
            textColor = 'text-danger';
        }

        badge.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between mb-1">
                        <span class="${textColor} fw-semibold">${metricName}</span>
                        <span class="fw-bold ${textColor} ms-1"> ${score}%</span>
                    </div>
                    <div class="progress" style="height: 6px;">
                        <div class="progress-bar ${progressClass}"
                            role="progressbar"
                            style="width: ${score}%"
                            aria-valuenow="${score}"
                            aria-valuemin="0"
                            aria-valuemax="100">
                        </div>
                    </div>
                </div>
                <div class="ms-3">
                    <i class="fas ${iconClass} ${textColor} fa-lg"></i>
                </div>
            </div>
        `;

        badge.setAttribute('data-bs-toggle', 'tooltip');
        badge.setAttribute('data-bs-placement', 'top');
        badge.setAttribute('title', `${metricName}: Scor ${score}/100 - ${getScoreDescription(score)}`);
        new bootstrap.Tooltip(badge);
    };

    const getScoreDescription = (score) => {
        if (score >= 85) return 'Excelent';
        if (score >= 70) return 'Bun';
        if (score >= 50) return 'Acceptabil';
        return 'Necesită îmbunătățiri';
    };

    updateBadge('sleepScoreBadge', sleepScore, 'Somn ');
    updateBadge('waterScoreBadge', waterScore, 'Hidratare ');
    updateBadge('caloriesScoreBadge', caloriesScore, 'Calorii ');
    updateBadge('stepsScoreBadge', stepsScore, 'Activitate ');

    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}


