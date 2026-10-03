const passwordScreen = document.getElementById("password-screen");
const appScreen = document.getElementById("app-screen");

const passwordForm = document.getElementById("password-form");
const passwordInput = document.getElementById("password-input");
const passwordError = document.getElementById("password-error");

const startScreen = document.getElementById("start-screen");
const questionPreviewScreen = document.getElementById("question-preview-screen");
const startButton = document.getElementById("start-button");
const previewButton = document.getElementById("preview-button");
const previewBackButton = document.getElementById("preview-back-button");
const questionsContainer = document.getElementById("questions-container");

const quizScreen = document.getElementById("quiz-screen");
const quizQuestionNumber = document.getElementById("quiz-question-number");
const quizQuestionText = document.getElementById("quiz-question-text");
const quizQuestionImage = document.getElementById("quiz-question-image");
const quizAnswers = document.getElementById("quiz-answers");
const imageQuizTestButton = document.getElementById("image-quiz-test-button");


/* =====================================
   SYSTEM EKRANÓW
   ===================================== */

const screens = {
    start: startScreen,
    questionPreview: questionPreviewScreen
};

function navigateTo(screenName, save = true) {
    const targetScreen = screens[screenName];

    if (!targetScreen) {
        console.error(`Nie znaleziono ekranu: "${screenName}"`);
        return;
    }

    Object.values(screens).forEach(screen => {
        screen.classList.add("hidden");
    });

    targetScreen.classList.remove("hidden");

    if (save) {
        saveCurrentScreen(screenName);
    }
}


/* =====================================
   PODGLĄD PYTAŃ
   ===================================== */

async function showQuestionPreview() {
    questionsContainer.innerHTML = `
        <p class="loading-message">Wczytywanie pytań...</p>
    `;

    try {
        const questions = await loadQuestions("questions/level1.txt");
        questionsContainer.innerHTML = "";

        questions.forEach((question, index) => {
            const questionElement = createQuestionPreview(question, index);
            questionsContainer.appendChild(questionElement);
        });

        console.log("Wczytane pytania:", questions);
    } catch (error) {
        console.error(error);

        questionsContainer.innerHTML = `
            <div class="parser-error">
                <h2>Błąd wczytywania pytań</h2>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function createQuestionPreview(question, index) {
    const card = document.createElement("article");
    card.className = "question-card";

    const header = document.createElement("div");
    header.className = "question-card-header";

    const number = document.createElement("span");
    number.className = "question-number";
    number.textContent = `PYTANIE ${index + 1}`;

    const id = document.createElement("span");
    id.className = "question-id";
    id.textContent = question.id;

    header.appendChild(number);
    header.appendChild(id);

    const questionText = document.createElement("h2");
    questionText.className = "question-text";
    questionText.textContent = question.question;

    card.appendChild(header);
    card.appendChild(questionText);

    if (question.questionImage) {
        const image = document.createElement("img");
        image.className = "question-image";
        image.src = question.questionImage;
        image.alt = "Obrazek pytania";
        card.appendChild(image);
    }

    const answers = document.createElement("div");
    answers.className = "question-answers";

    if (question.type === "image") {
        answers.classList.add("image-answers");
    }

    question.answers.forEach(answer => {
        const button = document.createElement("button");
        button.className = "answer-button";

        if (answer.image) {
            const image = document.createElement("img");
            image.className = "answer-image";
            image.src = answer.image;
            image.alt = `Odpowiedź ${answer.letter}`;
            button.appendChild(image);
        }

        const letter = document.createElement("span");
        letter.className = "answer-letter";
        letter.textContent = answer.letter;
        button.appendChild(letter);

        if (answer.text) {
            const text = document.createElement("span");
            text.className = "answer-text";
            text.textContent = answer.text;
            button.appendChild(text);
        }

        button.addEventListener("click", () => {
            checkPreviewAnswer(question, answer.letter, answers);
        });

        answers.appendChild(button);
    });

    card.appendChild(answers);

    return card;
}

function checkPreviewAnswer(question, selectedAnswer, answersContainer) {
    const buttons = answersContainer.querySelectorAll(".answer-button");

    buttons.forEach(button => {
        const letter = button.querySelector(".answer-letter").textContent;

        button.classList.remove("correct", "incorrect");

        if (letter === question.correctAnswer) {
            button.classList.add("correct");

            // Wymuszenie ponownego uruchomienia animacji.
            requestAnimationFrame(() => {
                button.classList.remove("correct");
                void button.offsetWidth;
                button.classList.add("correct");
            });
        }

        if (letter === selectedAnswer && selectedAnswer !== question.correctAnswer) {
            button.classList.add("incorrect");

            requestAnimationFrame(() => {
                button.classList.remove("incorrect");
                void button.offsetWidth;
                button.classList.add("incorrect");
            });
        }
    });
}


/* =====================================
   PANEL HASŁA
   ===================================== */

function showApp() {
    passwordScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");

    const progress = getProgress();
    navigateTo(progress.currentScreen, false);
}

function showPasswordScreen() {
    appScreen.classList.add("hidden");
    passwordScreen.classList.remove("hidden");
    passwordInput.focus();
}

passwordForm.addEventListener("submit", async event => {
    event.preventDefault();

    const password = passwordInput.value;
    passwordError.style.display = "none";

    const correct = await checkPassword(password);

    if (correct) {
        authenticate();
        showApp();
    } else {
        passwordError.style.display = "block";
        passwordInput.value = "";
        passwordInput.focus();
    }
});


/* =====================================
   START
   ===================================== */

startButton.addEventListener("click", () => {
    console.log("Przycisk START działa.");
});


/* =====================================
   NAWIGACJA PODGLĄDU
   ===================================== */

previewButton.addEventListener("click", async () => {
    navigateTo("questionPreview");
    await showQuestionPreview();
});

previewBackButton.addEventListener("click", () => {
    navigateTo("start");
});


/* =====================================
   TEST QUIZU OBRAZKOWEGO
   ===================================== */

imageQuizTestButton.addEventListener("click", async () => {
    try {
        const questions = await loadQuestions("questions/level1.txt");
        const imageQuestions = questions.filter(question => question.type === "image");

        if (imageQuestions.length === 0) {
            alert("Brak pytań obrazkowych.");
            return;
        }

        startQuiz(imageQuestions);
    } catch (error) {
        console.error(error);
        alert("Nie udało się wczytać pytań.");
    }
});


/* =====================================
   URUCHOMIENIE
   ===================================== */

if (isAuthenticated()) {
    showApp();
} else {
    showPasswordScreen();
}