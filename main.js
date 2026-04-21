// main.js - Logic for Extraversion Quiz

document.addEventListener('DOMContentLoaded', function() {
  const path = window.location.pathname;
  if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
    initIndex();
  } else if (path.includes('question.html')) {
    initQuestion();
  } else if (path.includes('results.html')) {
    initResults();
  }
});

function initIndex() {
  const slider = document.getElementById('self-slider');
  const valueDisplay = document.getElementById('self-value');
  const startBtn = document.getElementById('start-btn');

  // Update value display
  slider.addEventListener('input', function() {
    valueDisplay.textContent = slider.value;
  });

  // Start quiz
  startBtn.addEventListener('click', function() {
    sessionStorage.setItem('selfScore', slider.value);
    sessionStorage.removeItem('answers'); // Clear any previous
    window.location.href = 'question.html?q=0';
  });
}

async function initQuestion() {
  // Check guard
  if (!sessionStorage.getItem('selfScore')) {
    window.location.href = 'index.html';
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const qId = parseInt(urlParams.get('q'));
  if (isNaN(qId)) {
    window.location.href = 'index.html';
    return;
  }

  // Load questions
  let questions;
  try {
    const response = await fetch('questions.json');
    questions = await response.json();
  } catch (error) {
    console.error('Error loading questions:', error);
    return;
  }

  if (qId >= questions.length) {
    window.location.href = 'results.html';
    return;
  }

  const question = questions[qId];
  document.getElementById('question-text').textContent = question.question;
  document.getElementById('label-min').textContent = question.labelMin;
  document.getElementById('label-max').textContent = question.labelMax;

  // Progress
  const previousProgress = (qId / questions.length) * 100;
  const currentProgress = ((qId + 1) / questions.length) * 100;
  const fill = document.getElementById('progress-fill');
  fill.style.transition = 'none';
  fill.style.width = previousProgress + '%';
  // Force reflow
  fill.offsetHeight;
  fill.style.transition = 'width 0.4s ease';
  fill.style.width = currentProgress + '%';

  const slider = document.getElementById('question-slider');
  const valueDisplay = document.getElementById('question-value');
  const nextBtn = document.getElementById('next-btn');

  // Update value display
  slider.addEventListener('input', function() {
    valueDisplay.textContent = slider.value;
  });

  // Next
  nextBtn.addEventListener('click', function() {
    let answers = sessionStorage.getItem('answers');
    answers = answers ? JSON.parse(answers) : [];
    answers[qId] = parseInt(slider.value);
    sessionStorage.setItem('answers', JSON.stringify(answers));

    const nextQ = qId + 1;
    if (nextQ >= questions.length) {
      window.location.href = 'results.html';
    } else {
      window.location.href = 'question.html?q=' + nextQ;
    }
  });
}

function initResults() {
  // Guards
  const selfScore = sessionStorage.getItem('selfScore');
  const answersStr = sessionStorage.getItem('answers');
  if (!selfScore || !answersStr) {
    window.location.href = 'index.html';
    return;
  }

  const answers = JSON.parse(answersStr);
  if (answers.length === 0) {
    window.location.href = 'index.html';
    return;
  }

  // Load questions for coefficients
  fetch('questions.json')
    .then(response => response.json())
    .then(questions => {
      let totalWeighted = 0;
      let totalCoeff = 0;
      answers.forEach((answer, index) => {
        const coeff = questions[index].coefficient;
        totalWeighted += answer * coeff;
        totalCoeff += coeff;
      });
      const finalScore = totalWeighted / totalCoeff;

      // Display
      document.getElementById('final-score').textContent = finalScore.toFixed(1);
      document.getElementById('self-score').textContent = parseFloat(selfScore).toFixed(1);
      document.getElementById('calc-score').textContent = finalScore.toFixed(1);

      // Label
      let label;
      if (finalScore <= 3) label = "Nettement introverti(e)";
      else if (finalScore <= 4.5) label = "Plutôt introverti(e)";
      else if (finalScore <= 5.5) label = "Ambiverti(e)";
      else if (finalScore <= 7) label = "Plutôt extraverti(e)";
      else label = "Nettement extraverti(e)";
      document.getElementById('result-label').textContent = label;

      // Comparison
      const diff = finalScore - parseFloat(selfScore);
      let message;
      if (Math.abs(diff) <= 1) message = "Vous vous connaissez bien.";
      else if (diff > 1) message = "Plus extraverti(e) que vous ne le pensiez.";
      else message = "Plus introverti(e) que vous ne le pensiez.";
      document.getElementById('comparison-message').textContent = message;

      // Restart
      document.getElementById('restart-btn').addEventListener('click', function() {
        sessionStorage.clear();
        window.location.href = 'index.html';
      });
    })
    .catch(error => console.error('Error loading questions:', error));
}
