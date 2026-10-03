const STORAGE_KEY = "tajnyProjektProgress";

const DEFAULT_PROGRESS = {
    currentScreen: "start",
    completedScreens: [],
    quiz: {
        currentQuestion: 0,
        score: 0
    },
    game: {
        completed: false
    }
};


/* =====================================
   ODCZYT I ZAPIS POSTĘPU
   ===================================== */

function getProgress() {
    const savedProgress = localStorage.getItem(STORAGE_KEY);

    if (!savedProgress) {
        return structuredClone(DEFAULT_PROGRESS);
    }

    try {
        return {
            ...structuredClone(DEFAULT_PROGRESS),
            ...JSON.parse(savedProgress)
        };
    } catch (error) {
        console.error("Nie udało się odczytać zapisanego postępu.", error);
        return structuredClone(DEFAULT_PROGRESS);
    }
}

function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function updateProgress(changes) {
    const progress = getProgress();

    const updatedProgress = {
        ...progress,
        ...changes
    };

    saveProgress(updatedProgress);

    return updatedProgress;
}


/* =====================================
   ZARZĄDZANIE POSTĘPEM
   ===================================== */

function resetProgress() {
    localStorage.removeItem(STORAGE_KEY);
}

function saveCurrentScreen(screenName) {
    updateProgress({
        currentScreen: screenName
    });
}

function resetAllProgress() {
    localStorage.removeItem(STORAGE_KEY);
    console.log("Postęp został wyczyszczony.");
}