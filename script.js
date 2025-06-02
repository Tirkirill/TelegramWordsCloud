async function processFile() {

    const stopWords = new Set([
        'это', 'как', 'так', 'вот', 'тут', 'там', 'они', 'она', 'что', 'где',
        'когда', 'или', 'для', 'тоже', 'если', 'тогда', 'чтобы', 'нет', 'да',
        'просто', 'ещё', 'уже', 'было', 'быть', 'сейчас', 'был', 'будет',
        'тебя', 'тебе', 'меня', 'мне', 'только', 'очень', 'ещё', 'можно',
        'нужно', 'все', 'всё', 'сам', 'сама', 'поэтому', 'потому', 'ну',
        'из-за', 'без', 'при', 'надо', 'раз', 'два', 'три', 'есть', 'если', 
        'даже', 'короче', 'этом', 'этот', 'кого', 'себя', 'себе', 'которых', 'чтоб',
        "тому", "тому", "тебя", "тебе", "меня", "мне", "тех", "этих",
        "того", "того", "этого", "этих", "тех", "тех", "тех", "тех",
        "кто", "кого", "чего", "кому", "кем", "чем", "кто-то", "что-то",
        "какой-то", "какая-то", "какие-то", "каких-то", "какому-то", "каким-то",
        "хотя", "хотя бы", "хоть", "хоть бы", "всё равно", "всё-таки",
        "хоть", "хоть бы", "всё равно", "всё-таки", "всё же", "почти", "такой", "особо", "еще", "если",
        "этой","ними", "таки", "опять", "конечно", "вроде", "какой",
        "таким", "вообще", "этим", "свой", "либо", "кроме", "пусть",
        "свои", "ведь", "какие", "которые", "чуть", "всем", "самое", "него",
        "никто", "такая", "куда", "такие", "в", "на", "я", "ты", "он", "она", "мы", "вы", "они",
        "за", "у", "с", "по", "от", "до", "без", "при", "над", "из", "к", "о", "об", "для", "и", "не", "то", "а", "его",
        "про", "же", "но", "их", "бы", "нас", "том", "со", "них", "нас", "ее", "оно",
        "те", "ее", "эта", "во", "тот", "вся", "ним", "весь", "вам", "нам", "вас", "таких", "нашего",
        "эти", "ни", "тем", "им", "ли", "эту", "уж", "ваш", "под", "наш",
        "своей", "мои", "одна", "один", "наши", "мой", "свою", ""

    ])

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert("Выберите файл JSON из Telegram");
        return;
    }

    const text = await file.text();
    const json = JSON.parse(text);
    const messages = json.messages || [];

    // Собираем текст из всех сообщений
    let combinedText = messages
        .map(msg => typeof msg.text === 'string' ? msg.text : '')
        .join(' ')
        .toLowerCase();

    // Удаляем лишние символы
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

    // Нормализуем частоты от 1 до 10
    const list = Object.entries(frequencies)
    .map(([word, freq]) => [word, Math.round((freq / maxFreq) * 10)])
    .sort((a, b) => b[1] - a[1]);

    const wordCount = 250;

    WordCloud(document.getElementById('canvas'), {
        list: list.slice(0, wordCount),
        backgroundColor: 'white',
        weightFactor: 0.02 * wordCount,
        drawOutOfBound: false
    });

}