let savedWordList = [];
let currentCanvasOptions = {};
let baseWeightFactor = 1;

async function processFile() {

    const stopWords = new Set([
        'это', 'как', 'так', 'вот', 'тут', 'там', 'они', 'она', 'что', 'где',
        'когда', 'или', 'для', 'тоже', 'если', 'тогда', 'чтобы', 'нет', 'да',
        'просто', 'ещё', 'уже', 'было', 'быть', 'сейчас', 'был', 'будет',
        'тебя', 'тебе', 'меня', 'мне', 'только', 'очень', 'можно',
        'нужно', 'все', 'всё', 'сам', 'сама', 'поэтому', 'потому', 'ну',
        'из-за', 'без', 'при', 'надо', 'раз', 'два', 'три', 'есть', 'даже',
        'короче', 'этом', 'этот', 'кого', 'себя', 'себе', 'которых', 'чтоб',
        "тому", "тех", "того", "этого", "этих", "кто", "чего", "кому", "кем",
        "чем", "кто-то", "что-то", "какой-то", "какая-то", "какие-то",
        "каких-то", "какому-то", "каким-то", "хотя", "хотя бы", "хоть",
        "хоть бы", "всё равно", "всё-таки", "всё же", "почти", "такой",
        "особо", "еще", "этой", "ними", "таки", "опять", "конечно", "вроде",
        "какой", "таким", "вообще", "этим", "свой", "либо", "кроме", "пусть",
        "свои", "ведь", "какие", "которые", "чуть", "всем", "самое", "него",
        "никто", "такая", "куда", "такие", "в", "на", "я", "ты", "он", "она",
        "мы", "вы", "они", "за", "у", "с", "по", "от", "до", "без", "при",
        "над", "из", "к", "о", "об", "и", "не", "то", "а", "его", "про", "же",
        "но", "их", "бы", "нас", "том", "со", "них", "ее", "оно", "те", "эта",
        "во", "тот", "вся", "ним", "весь", "вам", "нам", "вас", "таких",
        "нашего", "эти", "ни", "тем", "им", "ли", "эту", "уж", "ваш", "под",
        "наш", "своей", "мои", "одна", "один", "наши", "мой", "свою", "ему",
        "нибудь", "ко", "ей", "который", "которой", "столько", "своих"
    ]);

    const wordCountInput = document.getElementById('wordCountInput');
    let wordCount = parseInt(wordCountInput?.value, 10);

    if (isNaN(wordCount) || wordCount < 100 || wordCount > 1000) {
        alert("Введите корректное количество слов от 100 до 1000");
        wordCount = 100;
        wordCountInput.value = wordCount;
        return;
    }

    wordCount = Math.max(100, Math.min(500, wordCount));

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert("Выберите файл JSON из Telegram");
        return;
    }

    let json;

    try {
        const text = await file.text();
        json = JSON.parse(text);
    } catch (e) {
        alert("Ошибка чтения файла. Убедитесь, что это корректный JSON-файл.");
        return;
    }

    if (!json.messages || !Array.isArray(json.messages)) {
        alert("Файл не похож на экспорт из Telegram. Убедитесь, что вы загрузили правильный JSON.");
        return;
    }

    const messages = json.messages || [];

    let combinedText = messages
        .map(msg => typeof msg.text === 'string' ? msg.text : '')
        .join(' ')
        .toLowerCase();

    combinedText = combinedText.replace(/[^а-яёa-z\s]/gi, ' ');

    const words = combinedText.split(/\s+/);
    const frequencies = {};

    const minWordLength = 2;

    for (const word of words) {
        if (word.length < minWordLength) continue;
        if (stopWords.has(word)) continue;
        frequencies[word] = (frequencies[word] || 0) + 1;
    }

    const maxFreq = Math.max(...Object.values(frequencies));
    const list = Object.entries(frequencies)
        .map(([word, freq]) => [word, Math.round((freq / maxFreq) * 10)])
        .sort((a, b) => b[1] - a[1])
        .map(([word, freq]) => [word, Math.max(freq, 1)]);

    const words_length = Math.min(list.length, wordCount);
    const sum_weight = list.slice(0, words_length)
        .map(([word, freq]) => freq)
        .reduce((partialSum, a) => partialSum + a, 0);

    const canvas = document.getElementById('canvas');
    const totalArea = canvas.width * canvas.height;
    const estimatedWordArea = words_length * 150;

    baseWeightFactor = Math.max(
        1.0,
        Math.min(10.0, Math.sqrt(totalArea / estimatedWordArea) * Math.sqrt(sum_weight / words_length) * 2.5)
    );

    const gridSize = Math.max(3, Math.min(5, Math.round(canvas.width / 100)));

    savedWordList = list.slice(0, words_length);
    currentCanvasOptions = {
        gridSize,
        backgroundColor: 'white'
    };

    updateWordSizeFromSlider(); // <--- вызываем отрисовку с текущим масштабом

    console.log("sum_weight:", sum_weight);
    console.log("baseWeightFactor:", baseWeightFactor.toFixed(2));
    console.log("gridSize:", gridSize);
}

function updateWordSizeFromSlider() {
    const slider = document.getElementById('sizeSlider');
    const scale = parseFloat(slider.value);
    const canvas = document.getElementById('canvas');

    if (!savedWordList.length) return;

    WordCloud(canvas, {
        list: savedWordList,
        weightFactor: baseWeightFactor * scale,
        drawOutOfBound: false,
        ...currentCanvasOptions
    });
}

async function saveCanvasImage() {
    const canvas = document.getElementById('canvas');
    const link = document.createElement('a');
    link.download = 'wordcloud.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}
