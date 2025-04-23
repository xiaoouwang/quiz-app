// Import Firebase configuration, with environment variable support
let firebaseConfig;

if (typeof process !== 'undefined' && process.env.FIREBASE_API_KEY) {
  // Use environment variables if available
  firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
  };
  initializeFirebase();
} else {
  // Try to import from local file first
  import('./firebase-config.js')
    .then(module => {
      firebaseConfig = module.firebaseConfig;
      initializeFirebase();
    })
    .catch(error => {
      console.error("Could not load firebase-config.js", error);
      console.error("No Firebase configuration available");
    });
}

function initializeFirebase() {
  // Initialize Firebase with the config
  // Your existing Firebase initialization code here
}

// DOM Elements
const themeContainer = document.getElementById('theme-container');
const quizList = document.getElementById('quiz-list');
const quizDetails = document.getElementById('quiz-details');
const quizTitle = document.getElementById('quiz-title');
const quizDescription = document.getElementById('quiz-description');
const backButton = document.getElementById('back-button');
const questionCounter = document.getElementById('question-counter');
const scoreCounter = document.getElementById('score-counter');
const expression = document.getElementById('expression');
const optionsContainer = document.getElementById('options-container');
const nextQuestionButton = document.getElementById('next-question');
const endQuizButton = document.getElementById('end-quiz');
const quizResults = document.getElementById('quiz-results');
const finalScore = document.getElementById('final-score').querySelector('span');
const finalScoreNumber = document.getElementById('final-score-number');
const totalQuestions = document.getElementById('total-questions');
const retakeQuizButton = document.getElementById('retake-quiz');
const appTitle = document.querySelector('.app-title');
const themeTags = document.querySelector('.theme-tags');

// Global variables
let currentQuizData = null;
let currentQuizQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedOption = null;
let hasAnswered = false;
let quizzesMetadata = [];
let currentAnswerDetails = null; // To track the current answer details element
let currentFilter = 'all';      // Track current category filter
let currentThemeFilter = 'all'; // Track current theme filter
let correctSound = null;        // Sound for correct answers
let incorrectSound = null;      // Sound for incorrect answers
let soundEnabled = true;        // Flag to enable/disable sounds

// Category icons mapping
const categoryIcons = {
    'francais': 'fa-flag',
    'villes_france': 'fa-city',
    'english': 'fa-coffee',
    'spanish': 'fa-sun',
    'italian': 'fa-pizza-slice',
    'german': 'fa-beer'
};

// Category display names
const categoryNames = {
    'francais': 'French',
    'villes_france': 'French Cities',
    'english': 'English',
    'spanish': 'Spanish',
    'italian': 'Italian',
    'german': 'German'
};

// Check if we're running from a file:// URL instead of a server
const isLocalFile = window.location.protocol === 'file:';

// Helper function to show warning if needed
function showLocalFileWarning() {
    if (isLocalFile) {
        const warning = document.createElement('div');
        warning.className = 'warning';
        warning.innerHTML = `
            <p><strong>Note:</strong> This app works best when served through a web server due to browser security restrictions on local files.</p>
            <p>If you see this message or have trouble loading quizzes, please use one of these options:</p>
            <ul>
                <li>Use a simple local server like Python's <code>python -m http.server</code></li>
                <li>Use VS Code's Live Server extension</li>
                <li>Upload files to a web hosting service</li>
            </ul>
        `;
        document.querySelector('header').appendChild(warning);
    }
}

// Fetch quiz metadata
async function fetchQuizMetadata() {
    try {
        // First try the standard fetch method (works on servers)
        const response = await fetch('data/quiz_metadata.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching quiz metadata:', error);

        // If we're running from a local file, provide fallback metadata
        if (isLocalFile) {
            return [
                {
                    "id": 1,
                    "filename": "quiz_chunk_1_updated.json",
                    "title": "French Expressions Quiz 1",
                    "category": "francais",
                    "description": "Test your knowledge of familiar French expressions",
                    "theme_color": "#6c5ce7"
                },
                {
                    "id": 2,
                    "filename": "quiz_chunk_2_updated.json",
                    "title": "French Expressions Quiz 2",
                    "category": "francais",
                    "description": "Continue learning more familiar French expressions",
                    "theme_color": "#6c5ce7"
                },
                {
                    "id": 3,
                    "filename": "quiz_chunk_3_updated.json",
                    "title": "French Expressions Quiz 3",
                    "category": "francais",
                    "description": "Expand your knowledge of French slang and idioms",
                    "theme_color": "#6c5ce7"
                },
                {
                    "id": 4,
                    "filename": "quiz_chunk_4_updated.json",
                    "title": "French Expressions Quiz 4",
                    "category": "francais",
                    "description": "Master more advanced French expressions",
                    "theme_color": "#6c5ce7"
                },
                {
                    "id": 5,
                    "filename": "quiz_chunk_5_updated.json",
                    "title": "French Expressions Quiz 5",
                    "category": "francais",
                    "description": "Challenge yourself with harder French slang",
                    "theme_color": "#6c5ce7"
                },
                {
                    "id": 6,
                    "filename": "quiz_chunk_6_updated.json",
                    "title": "French Expressions Quiz 6",
                    "category": "francais",
                    "description": "Test your expertise with complex French idioms",
                    "theme_color": "#6c5ce7"
                },
                {
                    "id": 7,
                    "filename": "quiz_chunk_6_updated.json",
                    "title": "French Cities Quiz",
                    "category": "villes_france",
                    "description": "Test your knowledge of major French cities",
                    "theme_color": "#e84393"
                }
            ];
        }

        themeContainer.innerHTML = '<p class="error">Failed to load quizzes. Please try again later or consider using a web server.</p>';
        return [];
    }
}

// Fetch quiz data
async function fetchQuizData(filename) {
    try {
        const response = await fetch(`data/${filename}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching quiz data:', error);
        if (isLocalFile) {
            // Show an error message specifically for local file access
            themeContainer.innerHTML = `
                <p class="error">Unable to load quiz data due to browser security restrictions when opening local files.</p>
                <p>Please use a web server to serve these files instead of opening directly from your file system.</p>
                <p>Options include:</p>
                <ul>
                    <li>Python: <code>python -m http.server</code></li>
                    <li>VS Code: Live Server extension</li>
                </ul>
            `;
        }
        return [];
    }
}

// Get all unique categories from quizzes
function getUniqueCategories(quizzes) {
    const categories = new Set();
    quizzes.forEach(quiz => {
        categories.add(quiz.category);
    });
    return Array.from(categories);
}

// Create category filter buttons
function createCategoryFilters(categories) {
    // Clear existing buttons except 'All Categories'
    const allButton = themeTags.querySelector('.theme-tag-btn[data-theme="all"]');
    themeTags.innerHTML = '';
    themeTags.appendChild(allButton);

    // Add a button for each unique category
    categories.forEach(category => {
        const categoryButton = document.createElement('button');
        categoryButton.className = `theme-tag-btn tag-${category}`;
        categoryButton.setAttribute('data-theme', category);

        // Get category icon and display name
        const iconClass = categoryIcons[category] || 'fa-bookmark';
        const displayName = categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ');

        categoryButton.innerHTML = `<i class="fas ${iconClass}"></i> ${displayName}`;

        // Add click event listener
        categoryButton.addEventListener('click', () => filterQuizzesByCategory(category));

        themeTags.appendChild(categoryButton);
    });
}

// Filter quizzes by category
function filterQuizzesByCategory(category) {
    // Update current filter
    currentFilter = category;

    // Update active button
    const themeButtons = document.querySelectorAll('.theme-tag-btn');
    themeButtons.forEach(button => {
        if (button.getAttribute('data-theme') === category) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    // Get all theme sections
    const themeSections = document.querySelectorAll('.theme-section');

    // Show/hide theme sections based on filter
    themeSections.forEach(section => {
        const sectionCategory = section.getAttribute('data-theme');

        if (category === 'all' || sectionCategory === category) {
            // Show this section
            section.classList.remove('fade-out');
            section.style.display = 'flex';
        } else {
            // Hide this section with animation
            section.classList.add('fade-out');
            setTimeout(() => {
                section.style.display = 'none';
            }, 300); // Match animation duration
        }
    });

    // Also apply theme filter if one is active
    if (currentThemeFilter !== 'all') {
        filterQuizzesByTheme(currentThemeFilter);
    } else {
        // Update filter indicator if no theme filter is active
        updateFilterIndicator();
    }
}

// Filter quizzes by theme
async function filterQuizzesByTheme(theme) {
    // Update current theme filter
    currentThemeFilter = theme;

    // Fetch all quiz data to get their themes
    const allQuizCards = document.querySelectorAll('.card');

    for (const card of allQuizCards) {
        const quizId = parseInt(card.dataset.id);
        const quiz = quizzesMetadata.find(q => q.id === quizId);

        if (!quiz) continue;

        try {
            // Determine whether to show or hide this card based on theme
            if (theme === 'all') {
                // If category filter is also 'all' or matches the quiz category, show the card
                if (currentFilter === 'all' || quiz.category === currentFilter) {
                    card.style.display = '';
                }
            } else {
                // First hide all cards
                card.style.display = 'none';

                // Then check if we need to show this one
                const questions = await fetchQuizData(quiz.filename);
                if (questions && questions.length > 0 && questions[0].theme === theme) {
                    // Also check if it matches the category filter
                    if (currentFilter === 'all' || quiz.category === currentFilter) {
                        card.style.display = '';
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching quiz data for theme filtering:', error);
        }
    }

    // Also highlight active theme filter
    document.querySelectorAll('.quiz-theme-badge').forEach(badge => {
        if (badge.dataset.theme === theme) {
            badge.classList.add('active');
        } else {
            badge.classList.remove('active');
        }
    });

    // Update filter indicator
    updateFilterIndicator();
}

// Group quizzes by category
function groupQuizzesByCategory(quizzes) {
    const categories = {};

    quizzes.forEach(quiz => {
        if (!categories[quiz.category]) {
            categories[quiz.category] = [];
        }

        categories[quiz.category].push(quiz);
    });

    return categories;
}

// Display categories and quizzes
async function displayCategoriesAndQuizzes(quizzes) {
    themeContainer.innerHTML = '';

    // Get all unique categories and create filter buttons
    const uniqueCategories = getUniqueCategories(quizzes);
    createCategoryFilters(uniqueCategories);

    // Group quizzes by category
    const categoryGroups = groupQuizzesByCategory(quizzes);

    // Create a section for each category
    for (const category of Object.keys(categoryGroups)) {
        const themeSection = document.createElement('div');
        themeSection.className = 'theme-section';
        themeSection.setAttribute('data-theme', category);

        // If filter is active and this is not the selected category, hide it
        if (currentFilter !== 'all' && category !== currentFilter) {
            themeSection.style.display = 'none';
        }

        // Create category header
        const themeHeader = document.createElement('div');
        themeHeader.className = `theme-header theme-${category}`;
        themeHeader.setAttribute('data-theme', category);

        // Get category icon or use default
        const iconClass = categoryIcons[category] || 'fa-bookmark';
        // Get category display name or use category key with first letter capitalized
        const displayName = categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ');

        themeHeader.innerHTML = `
            <i class="fas ${iconClass}"></i>
            <h3>${displayName} Quizzes</h3>
        `;

        themeSection.appendChild(themeHeader);

        // Create card container for quizzes in this category
        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-container';

        // Add quiz cards to container
        for (const quiz of categoryGroups[category]) {
            // Create the quiz card asynchronously
            const card = await createQuizCard(quiz);
            cardContainer.appendChild(card);
        }

        themeSection.appendChild(cardContainer);
        themeContainer.appendChild(themeSection);
    }
}

// Create a quiz card
async function createQuizCard(quiz) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = quiz.id;
    card.dataset.filename = quiz.filename;

    // Get category icon or use default
    const categoryIconClass = categoryIcons[quiz.category] || 'fa-bookmark';

    // Create corner accent using the theme color if specified
    if (quiz.theme_color) {
        const style = document.createElement('style');
        style.textContent = `
            .card[data-id="${quiz.id}"]::after {
                border-color: transparent ${quiz.theme_color} transparent transparent;
            }
        `;
        document.head.appendChild(style);
    }

    // Fetch the quiz data to get its theme and count number of questions
    let quizTheme = "";
    let themeIconClass = "fa-bookmark"; // Default icon
    let questionCount = 0;

    try {
        const questions = await fetchQuizData(quiz.filename);
        if (questions && questions.length > 0) {
            questionCount = questions.length;

            if (questions[0].theme) {
                quizTheme = questions[0].theme;
                // You can define icons for specific quiz themes here
                if (quizTheme === "francais_familier") {
                    themeIconClass = "fa-comment";
                } else if (quizTheme === "Nice") {
                    themeIconClass = "fa-umbrella-beach";
                }
            }
        }
    } catch (error) {
        console.error('Error fetching quiz data for theme badge:', error);
    }

    const themeBadge = quizTheme ?
        `<span class="quiz-theme-badge" data-theme="${quizTheme}"><i class="fas ${themeIconClass}"></i> ${quizTheme}</span>` : '';

    const questionBadge = questionCount > 0 ?
        `<span class="quiz-question-badge"><i class="fas fa-question-circle"></i> ${questionCount} Questions</span>` : '';

    card.innerHTML = `
        <div class="card-header">
            <h3>${quiz.title}</h3>
            <div class="badge-container">
                ${themeBadge}
                ${questionBadge}
            </div>
        </div>
        <div class="card-body">
            <p>${quiz.description}</p>
            <span class="theme-tag tag-${quiz.category}"><i class="fas ${categoryIconClass}"></i> ${categoryNames[quiz.category] || quiz.category}</span>
        </div>
    `;

    // Add click event listener to the card
    card.addEventListener('click', () => {
        // Force reload the quiz by first clearing the current quiz data
        currentQuizData = null;
        // Update URL with the quiz ID
        window.location.hash = `quiz/${quiz.id}`;
    });

    // Add click event listener to theme badge
    const themeBadgeElement = card.querySelector('.quiz-theme-badge');
    if (themeBadgeElement) {
        themeBadgeElement.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click event
            filterQuizzesByTheme(quizTheme);
        });
    }

    return card;
}

// Load a quiz by ID
async function loadQuizById(quizId) {
    const quiz = quizzesMetadata.find(q => q.id === parseInt(quizId));

    if (!quiz) {
        // If quiz not found, redirect to home
        window.location.hash = '';
        return;
    }

    await loadQuiz(quiz);
}

// Load a quiz
async function loadQuiz(quiz) {
    currentQuizData = quiz;
    currentQuestionIndex = 0;
    score = 0;

    // Set quiz title and description
    quizTitle.textContent = quiz.title;
    quizDescription.textContent = quiz.description;

    // Show loading while fetching questions
    quizDetails.classList.remove('hidden');
    quizList.classList.add('hidden');

    // Apply theme color to quiz header if specified
    if (quiz.theme_color) {
        document.documentElement.style.setProperty('--primary-color', quiz.theme_color);

        // Derive a lighter shade for the primary light color
        const hexToRgb = hex => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return [r, g, b];
        };

        const rgb = hexToRgb(quiz.theme_color);
        const lighterColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.6)`;
        document.documentElement.style.setProperty('--primary-light', lighterColor);

        // Also set RGB values for use in CSS variables
        document.documentElement.style.setProperty('--primary-rgb', `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`);
    }

    // Fetch quiz questions
    currentQuizQuestions = await fetchQuizData(quiz.filename);

    // Start the quiz if we have questions
    if (currentQuizQuestions.length > 0) {
        // Check if there's a question index in the URL
        const hashParts = window.location.hash.split('/');
        if (hashParts.length > 2 && hashParts[2] !== '') {
            const questionIdx = parseInt(hashParts[2]);
            if (!isNaN(questionIdx) && questionIdx >= 0 && questionIdx < currentQuizQuestions.length) {
                currentQuestionIndex = questionIdx;
            }
        }

        showQuestion();

        // Update score and question counter
        scoreCounter.innerHTML = `<i class="fas fa-star"></i> Score: ${score}`;
        questionCounter.innerHTML = `<i class="fas fa-question-circle"></i> Question: ${currentQuestionIndex + 1}/${currentQuizQuestions.length}`;

        // Focus on the question container
        const questionContainer = document.getElementById('question-container');
        if (questionContainer) {
            // Make sure the element is focusable
            questionContainer.setAttribute('tabindex', '-1');
            // Set focus after a short delay to ensure DOM is ready
            setTimeout(() => {
                questionContainer.focus();
            }, 100);
        }
    } else {
        // Show error if no questions loaded
        document.getElementById('question-container').innerHTML = '<p class="error">Unable to load quiz questions. Please try using a web server.</p>';
    }
}

// Show a question
function showQuestion() {
    // Reset state
    nextQuestionButton.classList.add('hidden');
    quizResults.classList.add('hidden');

    // Remove any existing answer details from previous question
    if (currentAnswerDetails) {
        currentAnswerDetails.remove();
        currentAnswerDetails = null;
    }

    hasAnswered = false;
    selectedOption = null;

    // Make sure the question container is visible
    document.getElementById('question-container').classList.remove('hidden');

    const question = currentQuizQuestions[currentQuestionIndex];

    // Set question content
    expression.textContent = question.expression;

    // Adjust font size based on category - smaller for villes_france category
    if (currentQuizData && currentQuizData.category === 'villes_france') {
        expression.classList.add('long-expression');
    } else {
        expression.classList.remove('long-expression');
    }

    // Create options
    optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = option;
        optionElement.dataset.index = index;

        optionElement.addEventListener('click', () => selectOption(optionElement, index, question.answer_index));
        optionsContainer.appendChild(optionElement);
    });

    // Update the URL to include the question index
    if (currentQuizData) {
        window.location.hash = `quiz/${currentQuizData.id}/${currentQuestionIndex}`;
    }

    // Focus on the question container
    const questionContainer = document.getElementById('question-container');
    if (questionContainer) {
        questionContainer.setAttribute('tabindex', '-1');
        // Set focus after a short delay to ensure DOM is ready
        setTimeout(() => {
            questionContainer.focus();
        }, 50);
    }
}

// Create answer details element
function createAnswerDetails(question) {
    // Create new answer details element
    const detailsEl = document.createElement('div');
    detailsEl.className = 'answer-details';

    detailsEl.innerHTML = `
        <div class="answer-content">
            <div class="translation-section">
                <p class="original-text">${question.expression || 'Expression not available'}</p>
                <p class="translation-text">${question.expression_cn || 'Translation not available'}</p>
            </div>
            ${question.exemple ? `
            <div class="examples-section">
                <p class="example-text">${question.exemple || ''}</p>
                <p class="translation-text">${question.exemple_cn || 'Translation not available'}</p>
            </div>
            ` : ''}
        </div>
    `;

    // Start with the details hidden
    detailsEl.style.opacity = '0';
    detailsEl.style.transform = 'translateY(10px)';
    detailsEl.style.transition = 'all 0.3s ease';

    return detailsEl;
}

// Show answer details under the selected option
function showAnswerDetails(optionElement, question) {
    // Remove any existing answer details
    if (currentAnswerDetails) {
        currentAnswerDetails.remove();
    }

    // Create new answer details
    const detailsEl = createAnswerDetails(question);

    // Check if selected option is correct and add appropriate class
    const isCorrect = optionElement.classList.contains('correct');
    const answerContent = detailsEl.querySelector('.answer-content');
    if (answerContent) {
        if (isCorrect) {
            answerContent.classList.add('answer-correct');
            // Add success icon for correct answer
            const resultIcon = document.createElement('div');
            resultIcon.className = 'result-icon correct-icon';
            resultIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
            answerContent.insertBefore(resultIcon, answerContent.firstChild);
        } else {
            answerContent.classList.add('answer-incorrect');
            // Add error icon for incorrect answer
            const resultIcon = document.createElement('div');
            resultIcon.className = 'result-icon incorrect-icon';
            resultIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
            answerContent.insertBefore(resultIcon, answerContent.firstChild);
        }
    }

    // Insert after the selected option
    optionElement.insertAdjacentElement('afterend', detailsEl);

    // Add buttons to the answer details
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'answer-buttons-container';
    buttonContainer.innerHTML = `
        <button id="end-quiz" class="btn btn-secondary"><i class="fas fa-stop-circle"></i></button>
        <button id="next-question" class="btn"><i class="fas fa-forward"></i></button>
    `;
    detailsEl.appendChild(buttonContainer);

    // Attach event listeners to the buttons
    buttonContainer.querySelector('#end-quiz').addEventListener('click', endQuiz);
    buttonContainer.querySelector('#next-question').addEventListener('click', nextQuestion);

    // Use setTimeout to create a slight delay before showing (for animation)
    setTimeout(() => {
        detailsEl.style.opacity = '1';
        detailsEl.style.transform = 'translateY(0)';
    }, 50);

    // Store reference to current details element
    currentAnswerDetails = detailsEl;

    // Make the answer details focusable
    detailsEl.setAttribute('tabindex', '0');

    // Scroll the answer details into view for mobile users
    detailsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Focus on the answer detail card with a slight delay to ensure scrolling completes first
    setTimeout(() => {
        detailsEl.focus({ preventScroll: true });

        // No need for custom outline management since we're handling it in CSS now
    }, 300);
}

// Initialize sounds
function initSounds() {
  // Set up simple HTML5 audio elements directly in the DOM for better browser support
  const soundContainer = document.createElement('div');
  soundContainer.style.display = 'none';
  soundContainer.innerHTML = `
    <audio id="correct-sound" preload="auto">
      <source src="./sounds/right.wav" type="audio/wav">
      <source src="https://www.soundjay.com/button/sounds/button-14.mp3" type="audio/mpeg">
    </audio>
    <audio id="incorrect-sound" preload="auto">
      <source src="./sounds/wrong.wav" type="audio/wav">
      <source src="https://www.soundjay.com/button/sounds/button-10.mp3" type="audio/mpeg">
    </audio>
  `;
  document.body.appendChild(soundContainer);

  // Override the Audio objects with direct references to the DOM elements
  correctSound = document.getElementById('correct-sound');
  incorrectSound = document.getElementById('incorrect-sound');

  // Add error handling for each audio element
  correctSound.addEventListener('error', (e) => {
    console.error('Error loading correct sound:', e);
    // Try to create a fallback if the audio tag fails
    const fallbackSound = new Audio();
    fallbackSound.src = './sounds/right.wav';
    correctSound = fallbackSound;
  });

  incorrectSound.addEventListener('error', (e) => {
    console.error('Error loading incorrect sound:', e);
    // Try to create a fallback if the audio tag fails
    const fallbackSound = new Audio();
    fallbackSound.src = './sounds/wrong.wav';
    incorrectSound = fallbackSound;
  });

  // Check if sound files exist
  fetch('./sounds/right.wav')
    .then(response => {
      if (!response.ok) {
        console.warn('right.wav not found, will use fallback');
      } else {
        console.log('right.wav loaded successfully');
      }
    })
    .catch(err => {
      console.error('Error checking for right.wav:', err);
    });

  fetch('./sounds/wrong.wav')
    .then(response => {
      if (!response.ok) {
        console.warn('wrong.wav not found, will use fallback');
      } else {
        console.log('wrong.wav loaded successfully');
      }
    })
    .catch(err => {
      console.error('Error checking for wrong.wav:', err);
    });

  // Add sound toggle button to the header
  const headerContent = document.querySelector('.header-content');
  if (headerContent) {
    const soundToggle = document.createElement('button');
    soundToggle.className = 'sound-toggle';
    soundToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
    soundToggle.title = 'Toggle Sound';

    soundToggle.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundToggle.innerHTML = soundEnabled ?
        '<i class="fas fa-volume-up"></i>' :
        '<i class="fas fa-volume-mute"></i>';

      // Attempt to play a test sound when enabling
      if (soundEnabled) {
        // Use a direct click-triggered play for the test
        const testPlay = () => {
          correctSound.volume = 0.2; // Lower volume for test
          correctSound.play()
            .then(() => {
              correctSound.volume = 1.0; // Reset volume after test
              console.log("Sound test success");
              if (typeof window.showToast === 'function') {
                window.showToast('Sound enabled', 'success');
              }
            })
            .catch(e => {
              console.error("Sound test failed:", e);
              if (typeof window.showToast === 'function') {
                window.showToast('Sound enabled, but autoplay blocked. Click anywhere to unlock audio.', 'info');
              }
            });
        };

        // Use setTimeout to separate the click event from the play attempt
        setTimeout(testPlay, 50);
      } else {
        if (typeof window.showToast === 'function') {
          window.showToast('Sound muted', 'info');
        }
      }
    });

    // Insert before the auth container
    const authContainer = headerContent.querySelector('.auth-container');
    if (authContainer) {
      headerContent.insertBefore(soundToggle, authContainer);
    } else {
      headerContent.appendChild(soundToggle);
    }
  }

  // Initialize with a user interaction to unlock audio
  const unlockAudio = () => {
    // Create and play a silent audio context
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      const silence = audioCtx.createBuffer(1, 1, 22050);
      const source = audioCtx.createBufferSource();
      source.buffer = silence;
      source.connect(audioCtx.destination);
      source.start(0);

      // Also try to play and immediately pause our sounds
      correctSound.play().then(() => {
        correctSound.pause();
        correctSound.currentTime = 0;
      }).catch(e => console.log("Audio unlock failed:", e));

      incorrectSound.play().then(() => {
        incorrectSound.pause();
        incorrectSound.currentTime = 0;
      }).catch(e => console.log("Audio unlock failed:", e));

      // Remove the listeners after first interaction
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    } catch (e) {
      console.error("Audio context unlock failed:", e);
    }
  };

  // Add listeners to unlock audio
  document.addEventListener('click', unlockAudio, {once: true});
  document.addEventListener('touchstart', unlockAudio, {once: true});
}

// Play sound based on answer correctness
function playSound(isCorrect) {
  if (!soundEnabled) return;

  try {
    // Get direct references to the audio elements to ensure they're current
    const correctAudio = document.getElementById('correct-sound');
    const incorrectAudio = document.getElementById('incorrect-sound');

    if (!correctAudio || !incorrectAudio) {
      console.error("Sound elements not found");
      return;
    }

    // Stop any currently playing sounds
    correctAudio.pause();
    correctAudio.currentTime = 0;
    incorrectAudio.pause();
    incorrectAudio.currentTime = 0;

    // Play the appropriate sound with user-triggered method
    const playNow = () => {
      if (isCorrect) {
        correctAudio.play().catch(e => console.error("Failed to play correct sound:", e));
      } else {
        incorrectAudio.play().catch(e => console.error("Failed to play incorrect sound:", e));
      }
    };

    // Use setTimeout to slightly delay play and separate from the user interaction
    setTimeout(playNow, 50);
  } catch (error) {
    console.error('Error playing sound:', error);
  }
}

// Select an option
function selectOption(optionElement, selectedIndex, correctIndex) {
    if (hasAnswered) return;

    hasAnswered = true;
    selectedOption = optionElement;

    // Get current question
    const currentQuestion = currentQuizQuestions[currentQuestionIndex];

    // Remove previous selections
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected', 'correct', 'incorrect');
    });

    // Mark selected option
    optionElement.classList.add('selected');

    // Check if answer is correct
    const isCorrect = selectedIndex === correctIndex;

    if (isCorrect) {
        optionElement.classList.add('correct');
        score++;
        scoreCounter.innerHTML = `<i class="fas fa-star"></i> Score: ${score}`;
        playSound(true); // Play correct sound
    } else {
        optionElement.classList.add('incorrect');

        // Show correct answer
        document.querySelectorAll('.option')[correctIndex].classList.add('correct');
        playSound(false); // Play incorrect sound

        // Store the failed question in Firestore if user is logged in
        if (typeof window.addFailedQuestion === 'function') {
            // Get the selected option text
            const selectedOptionText = currentQuestion.options[selectedIndex];

            // Add the selected option to the question data
            const questionData = {
                ...currentQuestion,
                selectedOption: selectedOptionText
            };

            // Save the failed question
            window.addFailedQuestion(questionData);
        }
    }

    // Ensure the selected option is visible
    optionElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Show answer details under the selected option
    showAnswerDetails(optionElement, currentQuizQuestions[currentQuestionIndex]);

    // Show next button
    nextQuestionButton.classList.remove('hidden');
}

// Go to next question
function nextQuestion() {
    currentQuestionIndex++;

    if (currentQuestionIndex < currentQuizQuestions.length) {
        // Show next question
        showQuestion();
        // Update question counter
        questionCounter.innerHTML = `<i class="fas fa-question-circle"></i> Question: ${currentQuestionIndex + 1}/${currentQuizQuestions.length}`;
        // Focus will be handled by showQuestion
    } else {
        // Show quiz results
        showResults();

        // Focus on the quiz results section
        const quizResults = document.getElementById('quiz-results');
        if (quizResults) {
            quizResults.setAttribute('tabindex', '-1');
            setTimeout(() => {
                quizResults.focus();
            }, 50);
        }
    }
}

// End the quiz early
function endQuiz() {
    // Confirm that the user wants to end the quiz
    const confirmed = confirm("Are you sure you want to end the quiz?");

    if (confirmed) {
        showResults();
    }
}

// Show quiz results
function showResults() {
    // Hide question container
    document.getElementById('question-container').classList.add('hidden');
    nextQuestionButton.classList.remove('hidden');
    nextQuestionButton.classList.add('hidden');

    // Remove any existing answer details
    if (currentAnswerDetails) {
        currentAnswerDetails.remove();
        currentAnswerDetails = null;
    }

    // Show results
    const resultsContainer = document.getElementById('quiz-results');
    resultsContainer.classList.remove('hidden');
    finalScore.textContent = `${score}/${currentQuizQuestions.length}`;
    finalScoreNumber.textContent = score;
    totalQuestions.textContent = currentQuizQuestions.length;

    // Add "Back to Homepage" button if it doesn't exist
    const buttonsContainer = document.querySelector('#quiz-results .buttons-container');
    if (buttonsContainer) {
        // Check if the Go Back button already exists
        let goBackButton = document.getElementById('go-back-button');

        // If it doesn't exist, create it
        if (!goBackButton) {
            goBackButton = document.createElement('button');
            goBackButton.id = 'go-back-button';
            goBackButton.className = 'btn btn-secondary';
            goBackButton.innerHTML = '<i class="fas fa-home"></i> Homepage';

            // Add event listener
            goBackButton.addEventListener('click', goBackToQuizList);

            // Add to container
            buttonsContainer.appendChild(goBackButton);
        }
    }

    // Update URL to show results
    if (currentQuizData) {
        window.location.hash = `quiz/${currentQuizData.id}/results`;
    }

    // Make results container focusable and focus on it
    resultsContainer.setAttribute('tabindex', '-1');
    setTimeout(() => {
        resultsContainer.focus();
    }, 50);
}

// Retake quiz
function retakeQuiz() {
    // Reset quiz
    currentQuestionIndex = 0;
    score = 0;
    scoreCounter.innerHTML = `<i class="fas fa-star"></i> Score: 0`;
    questionCounter.innerHTML = `<i class="fas fa-question-circle"></i> Question: 1/${currentQuizQuestions.length}`;

    // Show first question
    document.getElementById('question-container').classList.remove('hidden');
    quizResults.classList.add('hidden');
    showQuestion();
}

// Go back to quiz list
function goBackToQuizList() {
    quizList.classList.remove('hidden');
    quizDetails.classList.add('hidden');

    // Restore default colors
    document.documentElement.style.removeProperty('--primary-color');
    document.documentElement.style.removeProperty('--primary-light');

    // Update URL
    window.location.hash = '';
}

// Go to homepage
function goToHomepage() {
    window.location.hash = '';
}

// Handle URL routing
function handleRouting() {
    const hash = window.location.hash.substring(1); // Remove the # character

    if (!hash || hash === '') {
        // Show the quiz list
        quizList.classList.remove('hidden');
        quizDetails.classList.add('hidden');

        // Restore default colors
        document.documentElement.style.removeProperty('--primary-color');
        document.documentElement.style.removeProperty('--primary-light');
        return;
    }

    const parts = hash.split('/');

    if (parts[0] === 'quiz' && parts.length > 1) {
        const quizId = parts[1];

        // If we're already on the correct quiz, just update the question
        if (currentQuizData && currentQuizData.id === parseInt(quizId)) {
            if (parts.length > 2) {
                if (parts[2] === 'results') {
                    showResults();
                } else {
                    const questionIdx = parseInt(parts[2]);
                    if (!isNaN(questionIdx) && questionIdx >= 0 && questionIdx < currentQuizQuestions.length) {
                        currentQuestionIndex = questionIdx;
                        showQuestion();
                        questionCounter.innerHTML = `<i class="fas fa-question-circle"></i> Question: ${currentQuestionIndex + 1}/${currentQuizQuestions.length}`;
                    }
                }
            }
        } else {
            // Load the quiz if it's different from the current one
            loadQuizById(quizId);
        }
    }
}

// Set up category filter event listeners
function setupCategoryFilters() {
    // Set up the All Categories button
    const allButton = document.querySelector('.theme-tag-btn[data-theme="all"]');
    if (allButton) {
        allButton.addEventListener('click', () => {
            filterQuizzesByCategory('all');
            // Also reset theme filter
            currentThemeFilter = 'all';
            document.querySelectorAll('.quiz-theme-badge').forEach(badge => {
                badge.classList.remove('active');
            });
            // Update filter indicator
            updateFilterIndicator();
        });
    }

    // Set up Clear Filters button
    const clearFiltersButton = document.getElementById('clear-filters');
    if (clearFiltersButton) {
        clearFiltersButton.addEventListener('click', () => {
            // Reset both category and theme filters
            currentFilter = 'all';
            currentThemeFilter = 'all';

            // Update UI to reflect reset filters
            document.querySelectorAll('.theme-tag-btn').forEach(button => {
                if (button.getAttribute('data-theme') === 'all') {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });

            document.querySelectorAll('.quiz-theme-badge').forEach(badge => {
                badge.classList.remove('active');
            });

            // Show all theme sections
            document.querySelectorAll('.theme-section').forEach(section => {
                section.classList.remove('fade-out');
                section.style.display = 'flex';
            });

            // Show all cards that were hidden
            document.querySelectorAll('.card').forEach(card => {
                card.style.display = '';
            });

            // Update filter indicator
            updateFilterIndicator();
        });
    }
}

// Update filter indicator
function updateFilterIndicator() {
    const clearFiltersButton = document.getElementById('clear-filters');
    if (clearFiltersButton) {
        if (currentFilter !== 'all' || currentThemeFilter !== 'all') {
            clearFiltersButton.classList.add('active');
            const activeFilters = (currentFilter !== 'all' ? 1 : 0) + (currentThemeFilter !== 'all' ? 1 : 0);
            clearFiltersButton.innerHTML = `<i class="fas fa-times-circle"></i> Clear Filters (${activeFilters})`;
        } else {
            clearFiltersButton.classList.remove('active');
            clearFiltersButton.innerHTML = `<i class="fas fa-times-circle"></i> Clear All Filters`;
        }
    }
}

// Event listeners
backButton.addEventListener('click', goBackToQuizList);
nextQuestionButton.addEventListener('click', nextQuestion);
endQuizButton.addEventListener('click', endQuiz);
retakeQuizButton.addEventListener('click', retakeQuiz);
appTitle.addEventListener('click', goToHomepage);
window.addEventListener('hashchange', handleRouting);

// Function to handle Firebase initialization failures
function handleFirebaseInitFailure() {
  const errorMessage = `
    <div class="error-message" style="text-align: center; padding: 2rem; margin: 2rem auto; max-width: 600px; background: #fff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      <h3 style="color: #e74c3c;"><i class="fas fa-exclamation-triangle"></i> Firebase Configuration Error</h3>
      <p>Unable to load Firebase configuration. This might be due to:</p>
      <ul style="text-align: left; margin: 1rem 0; padding-left: 2rem;">
        <li>Network connectivity issues</li>
        <li>Missing Firebase configuration</li>
        <li>Browser security restrictions</li>
      </ul>
      <p>You can still browse the app, but some features may not work.</p>
      <button onclick="location.reload()" style="padding: 0.5rem 1rem; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 1rem;">Retry</button>
    </div>
  `;

  // Show error message in the theme container
  const container = document.getElementById('theme-container');
  if (container) {
    container.innerHTML = errorMessage;
  }
}

// Initialize application with error handling for Firebase
async function initApp() {
    showLocalFileWarning();
    setupCategoryFilters();
    initSounds(); // Initialize sounds
    setupAccessibility(); // Setup keyboard/mouse detection

    try {
        quizzesMetadata = await fetchQuizMetadata();
        await displayCategoriesAndQuizzes(quizzesMetadata);
    } catch (error) {
        console.error("Failed to initialize app:", error);
        handleFirebaseInitFailure();
    }

    // Handle initial routing
    handleRouting();
}

// Set up accessibility features for keyboard vs mouse navigation
function setupAccessibility() {
  // Add class to body when using mouse
  document.body.addEventListener('mousedown', function() {
    document.body.classList.add('using-mouse');
  });

  // Remove class when using keyboard
  document.body.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      document.body.classList.remove('using-mouse');
    }
  });

  // Eliminate all purple focus rings on touch devices
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    // Add a style element that completely disables all focus outlines
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-tap-highlight-color: transparent !important;
        outline: none !important;
        box-shadow: none !important;
      }

      *:focus, *:active {
        outline: none !important;
        box-shadow: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Add loadCustomQuiz function for failed questions quiz
function loadCustomQuiz(quiz) {
    // Store quiz data
    currentQuizData = quiz;
    currentQuizQuestions = quiz.questions;
    currentQuestionIndex = 0;
    score = 0;

    // Set quiz details
    quizTitle.textContent = quiz.title;
    quizDescription.textContent = quiz.description;

    // Update colors
    if (quiz.theme_color) {
        document.documentElement.style.setProperty('--primary-color', quiz.theme_color);
        // Generate a lighter version of the theme color
        const lighterColor = getLighterColor(quiz.theme_color, 20);
        document.documentElement.style.setProperty('--primary-light', lighterColor);
    }

    // Reset counters
    scoreCounter.innerHTML = `<i class="fas fa-star"></i> Score: 0`;
    questionCounter.innerHTML = `<i class="fas fa-question-circle"></i> Question: 1/${currentQuizQuestions.length}`;

    // Hide quiz list, show quiz details
    quizList.style.display = 'none';
    quizDetails.classList.remove('hidden');
    document.getElementById('question-container').classList.remove('hidden');
    quizResults.classList.add('hidden');

    // Set focus to quiz details
    quizDetails.setAttribute('tabindex', '-1');
    setTimeout(() => {
        quizDetails.focus();
    }, 100);

    // Show first question
    showQuestion();
}

// Utility function to lighten a hex color
function getLighterColor(hex, percent) {
    // Parse hex to RGB
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    // Make lighter by the percent
    r = Math.min(255, Math.floor(r * (1 + percent / 100)));
    g = Math.min(255, Math.floor(g * (1 + percent / 100)));
    b = Math.min(255, Math.floor(b * (1 + percent / 100)));

    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Make loadCustomQuiz available globally for the failed questions feature
window.loadCustomQuiz = loadCustomQuiz;