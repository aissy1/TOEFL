// This utility function takes a sentence and an array of choices and returns the sentence with the choices highlighted using <span> tags with underline and bold styling.

function escapeRegex(text: string) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function renderSentence(sentence: string, choices: string[]) {
    let result = sentence;

    choices.forEach((choice) => {
        const safe = escapeRegex(choice);
        const regex = new RegExp(`\\b${safe}\\b`, 'gi');

        result = result.replace(regex, `<span class="underline font-bold">${choice}</span>`);
    });

    return result;
}
