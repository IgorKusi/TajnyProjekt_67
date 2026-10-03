const ANSWER_IMAGE_EXTENSION = "jpg";


async function loadQuestions(filePath) {
    const response = await fetch(filePath);

    if (!response.ok) {
        throw new Error(`Nie udało się wczytać pliku: ${filePath}`);
    }

    const text = await response.text();
    return parseQuestions(text);
}


function parseQuestions(text) {
    const blocks = text
        .split(/\n\s*\n\s*\n/)
        .map(block => block.trim())
        .filter(block => block.length > 0);

    const questions = [];

    blocks.forEach((block, index) => {
        try {
            const question = parseQuestionBlock(block);
            questions.push(question);
        } catch (error) {
            console.error(`Błąd w pytaniu nr ${index + 1}:`, error.message);
        }
    });

    return questions;
}


function parseQuestionBlock(block) {
    const lines = block
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);

    if (lines.length < 7) {
        throw new Error("Blok pytania zawiera za mało danych.");
    }

    /*
     * ID:
     *
     * [L1T001]
     * [L1I001]
     */
    const idMatch = lines[0].match(/^\[L(\d+)(T|I)(\d+)\]$/i);

    if (!idMatch) {
        throw new Error(`Nieprawidłowe ID pytania: "${lines[0]}"`);
    }

    const level = Number(idMatch[1]);
    const typeLetter = idMatch[2].toUpperCase();
    const questionNumber = Number(idMatch[3]);
    const id = `L${level}${typeLetter}${String(questionNumber).padStart(3, "0")}`;
    const type = typeLetter === "I" ? "image" : "text";


    /*
     * Treść pytania
     */
    const questionText = lines[1];

    if (!questionText) {
        throw new Error("Brak treści pytania.");
    }


    /*
     * Opcjonalny obrazek pytania
     *
     * IMAGE: images/level1/questions/L1T001.jpg
     */
    let questionImage = null;
    let answersStartIndex = 2;
    const imageMatch = lines[2]?.match(/^IMAGE:\s*(.+)$/i);

    if (imageMatch) {
        questionImage = imageMatch[1].trim();
        answersStartIndex = 3;
    }


    /*
     * Odpowiedzi A-D
     */
    const answers = [];

    for (let i = 0; i < 4; i++) {
        const answerLine = lines[answersStartIndex + i];

        if (!answerLine) {
            throw new Error(`Brak odpowiedzi nr ${i + 1}.`);
        }

        const answerMatch = answerLine.match(/^([A-Da-d])\.\s*(.*)$/);

        if (!answerMatch) {
            throw new Error(`Nieprawidłowa odpowiedź: "${answerLine}"`);
        }

        const letter = answerMatch[1].toUpperCase();
        const answerText = answerMatch[2].trim();

        /*
         * Pytanie obrazkowe:
         *
         * L1I001
         * ↓
         * images/level1/L1I001/A.jpg
         */
        let image = null;

        if (type === "image") {
            image = `images/level${level}/${id}/${letter}.${ANSWER_IMAGE_EXTENSION}`;
        }

        answers.push({
            letter,
            text: answerText,
            image
        });
    }


    /*
     * Poprawna odpowiedź
     */
    const correctLine = lines[answersStartIndex + 4];

    if (!correctLine) {
        throw new Error("Brak informacji o poprawnej odpowiedzi.");
    }

    const correctMatch = correctLine.match(/^#([A-Da-d])$/);

    if (!correctMatch) {
        throw new Error("Brak prawidłowej odpowiedzi (#A/#B/#C/#D).");
    }

    const correctAnswer = correctMatch[1].toUpperCase();

    return {
        id,
        level,
        type,
        questionNumber,
        question: questionText,
        questionImage,
        answers,
        correctAnswer
    };
}