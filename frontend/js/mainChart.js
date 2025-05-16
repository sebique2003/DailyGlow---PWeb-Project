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

    const sleepRec = document.getElementById('sleepRecommendation');
    const sleepPercentage = calculateMetricScore(sleep, {
        min: 6, max: 9, absoluteMin: 4, absoluteMax: 12
    });

    if (sleep < 4) {
        sleepRec.textContent = `
            #
        `;
    } else if (sleep < 7) {
        sleepRec.textContent = `
            #
        `;
    } else if (sleep > 9) {
        sleepRec.textContent = `
            #
        `;
    } else {
        sleepRec.textContent = `
            #
        `;
    }

    const waterRec = document.getElementById('waterRecommendation');
    const waterPercentage = calculateMetricScore(water, {
        min: 2, max: 4, absoluteMin: 1.5, absoluteMax: 6
    });

    if (water < 1) {
        waterRec.textContent = `
            #
        `;
    } else if (water < 2) {
        waterRec.textContent = `
            #
        `;
    } else if (water > 4) {
        waterRec.textContent = `
            #
        `;
    } else {
        waterRec.textContent = `
            #
        `;
    }

    const caloriesRec = document.getElementById('caloriesRecommendation');
    const caloriesPercentage = calculateMetricScore(calories, {
        min: 1200, max: 3000, absoluteMin: 800, absoluteMax: 5000
    });

    if (calories < 1200) {
        caloriesRec.textContent = `
            #
        `;
    } else if (calories < 1800) {
        caloriesRec.textContent = `
            #
        `;
    } else if (calories > 3000) {
        caloriesRec.textContent = `
            #
        `;
    } else {
        caloriesRec.textContent = `
            #
        `;
    }

    const stepsRec = document.getElementById('stepsRecommendation');
    const stepsPercentage = calculateMetricScore(steps, {
        min: 5000, max: 15000, absoluteMin: 2000, absoluteMax: 25000
    });

    if (steps < 3000) {
        stepsRec.textContent = `
            #
        `;
    } else if (steps < 6000) {
        stepsRec.textContent = `
            #
        `;
    } else if (steps > 15000) {
        stepsRec.textContent = `
            #
        `;
    } else {
        stepsRec.textContent = `
            #
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


