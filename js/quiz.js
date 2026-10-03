let quizQuestions = [];
let currentQuizIndex = 0;
let quizLocked = false;


/* =====================================
   URUCHOMIENIE QUIZU
   ===================================== */

function startQuiz(questions) {
    if (!questions || questions.length === 0) {
        console.error("Brak pytań do uruchomienia quizu.");
        return;
    }

    quizQuestions = questions;
    currentQuizIndex = 0;
    quizLocked = false;

    showQuizScreen();
    renderCurrentQuestion();
}


/* =====================================
   EKRAN QUIZU
   ===================================== */

function showQuizScreen() {
    document.querySelectorAll(".app-page").forEach(screen => {
        screen.classList.add("hidden");
    });

    quizScreen.classList.remove("hidden");
}


/* =====================================
   WYŚWIETLANIE PYTANIA
   ===================================== */

function renderCurrentQuestion() {
    const question = quizQuestions[currentQuizIndex];

    if (!question) {
        finishQuiz();
        return;
    }

    quizLocked = false;

    quizQuestionNumber.textContent = `PYTANIE ${currentQuizIndex + 1} / ${quizQuestions.length}`;
    quizQuestionText.textContent = question.question;
    quizAnswers.innerHTML = "";

    /*
     * Opcjonalny obrazek pytania.
     */
    if (question.questionImage) {
        quizQuestionImage.src = question.questionImage;
        quizQuestionImage.alt = "Obrazek pytania";
        quizQuestionImage.classList.remove("hidden");
    } else {
        quizQuestionImage.src = "";
        quizQuestionImage.classList.add("hidden");
    }

    /*
     * Układ odpowiedzi.
     */
    quizAnswers.classList.toggle("image-answers", question.type === "image");

    question.answers.forEach(answer => {
        const button = document.createElement("button");
        button.className = "answer-button";

        /*
         * Obrazek odpowiedzi.
         */
        if (answer.image) {
            const image = document.createElement("img");
            image.className = "answer-image";
            image.src = answer.image;
            image.alt = `Odpowiedź ${answer.letter}`;

            image.onerror = () => {
                console.error(`Nie udało się załadować obrazka: ${answer.image}`);
            };

            button.appendChild(image);
        }

        /*
         * Litera odpowiedzi.
         */
        const letter = document.createElement("span");
        letter.className = "answer-letter";
        letter.textContent = answer.letter;
        button.appendChild(letter);

        /*
         * Tekst odpowiedzi.
         */
        if (answer.text) {
            const text = document.createElement("span");
            text.className = "answer-text";
            text.textContent = answer.text;
            button.appendChild(text);
        }

        /*
         * Obsługa odpowiedzi.
         */
        button.addEventListener("click", () => {
            handleQuizAnswer(question, answer, button);
        });

        quizAnswers.appendChild(button);
    });
}


/* =====================================
   OBSŁUGA ODPOWIEDZI
   ===================================== */

function handleQuizAnswer(question, selectedAnswer, selectedButton) {
    /*
     * Nie pozwalamy kliknąć drugiej odpowiedzi podczas oczekiwania.
     */
    if (quizLocked) {
        return;
    }

    quizLocked = true;

    const buttons = quizAnswers.querySelectorAll(".answer-button");

    /*
     * Blokujemy wszystkie przyciski.
     */
    buttons.forEach(button => {
        button.disabled = true;
    });

    /*
     * Zaznaczamy poprawną odpowiedź.
     */
    buttons.forEach(button => {
        const letter = button.querySelector(".answer-letter").textContent;

        if (letter === question.correctAnswer) {
            button.classList.add("correct");
        }
    });

    /*
     * Jeżeli użytkownik wybrał źle, zaznaczamy jego odpowiedź na czerwono.
     */
    if (selectedAnswer.letter !== question.correctAnswer) {
        selectedButton.classList.add("incorrect");
    }

    /*
     * Krótkie opóźnienie przed kolejnym pytaniem.
     */
    setTimeout(() => {
        currentQuizIndex++;
        renderCurrentQuestion();
    }, 1000);
}


/* =====================================
   ZAKOŃCZENIE QUIZU
   ===================================== */

function finishQuiz() {
    quizLocked = false;

    quizQuestionNumber.textContent = "KONIEC";
    quizQuestionText.textContent = "Quiz został zakończony.";
    quizQuestionImage.classList.add("hidden");
    quizAnswers.innerHTML = "";
}