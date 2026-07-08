import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:8001';
const artifactDir = path.resolve('test-artifacts', 'tep-flow-user-2');

const result = {
    baseUrl,
    startedAt: new Date().toISOString(),
    endedAt: null,
    finalUrl: null,
    title: null,
    screenshots: [],
    console: [],
    network: [],
    validations: [],
    sections: [],
    totalQuestionsAnswered: 0,
    bug: null,
};

function recordValidation(name, passed, detail = '') {
    result.validations.push({ name, passed, detail });
}

async function screenshot(page, name) {
    const filename = `${String(result.screenshots.length + 1).padStart(2, '0')}-${name}.png`;
    const filePath = path.join(artifactDir, filename);
    await page.screenshot({ path: filePath, fullPage: true });
    result.screenshots.push(filePath.replaceAll('\\', '/'));
}

async function waitForUrl(page, pattern, label, timeout = 15000) {
    await page.waitForURL(pattern, { timeout });
    recordValidation(label, true, page.url());
}

async function clickByText(page, text, exact = true) {
    await page.getByRole('button', { name: text, exact }).click();
}

async function continueInfo(page, expectedHeading) {
    await page.waitForLoadState('networkidle');
    if (expectedHeading) {
        await page.getByRole('heading', { name: expectedHeading }).waitFor({ timeout: 10000 });
    }
    await page.getByRole('button', { name: /Continue|Start Test/ }).click();
    await page.waitForLoadState('networkidle');
}

async function answerRadioSection(page, sectionName, expectedCount) {
    const section = { name: sectionName, answered: 0, previousChecked: false };
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /Next|Finish Section/ }).waitFor({ timeout: 10000 });

    for (let i = 0; i < expectedCount; i++) {
        const radios = page.locator('input[type="radio"]');
        await radios.first().waitFor({ timeout: 10000 });
        await radios.first().check({ force: true });
        section.answered++;
        result.totalQuestionsAnswered++;

        if (i === 1 && !section.previousChecked) {
            await page.getByRole('button', { name: 'Previous' }).click();
            await page.waitForTimeout(200);
            await page.getByRole('button', { name: /Next/ }).click();
            await page.waitForTimeout(200);
            section.previousChecked = true;
        }

        const isLast = i === expectedCount - 1;
        await page.getByRole('button', { name: isLast ? /Finish Section/ : /Next/ }).click();
        await page.waitForTimeout(100);
    }

    await page.getByRole('dialog').waitFor({ timeout: 10000 });
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForLoadState('networkidle');
    result.sections.push(section);
}

async function answerListeningSection(page, expectedCount) {
    const section = { name: 'Listening', answered: 0, previousChecked: false, blockedAt: null };
    await page.waitForLoadState('networkidle');

    for (let i = 0; i < expectedCount; i++) {
        const play = page.getByRole('button', { name: /^Play/ });
        if (await play.isVisible().catch(() => false)) {
            await play.click();
            await page.evaluate(() => {
                document.querySelectorAll('audio').forEach((audio) => {
                    audio.playbackRate = 16;
                });
            });
            await page.waitForTimeout(500);
        }

        const radios = page.locator('input[type="radio"]');
        try {
            await radios.first().waitFor({ timeout: 30000 });
        } catch (error) {
            section.blockedAt = i + 1;
            result.sections.push(section);
            throw new Error(`Listening choices did not become available at question ${i + 1}`);
        }

        await radios.first().check({ force: true });
        section.answered++;
        result.totalQuestionsAnswered++;

        if (i === 1 && !section.previousChecked) {
            const previous = page.getByRole('button', { name: 'Previous' });
            if (await previous.isEnabled().catch(() => false)) {
                await previous.click();
                await page.waitForTimeout(200);
                await page.getByRole('button', { name: /Next/ }).click();
                await page.waitForTimeout(200);
                section.previousChecked = true;
            }
        }

        const isLast = i === expectedCount - 1;
        await page.getByRole('button', { name: isLast ? /Finish Section/ : /Next/ }).click();
        await page.waitForTimeout(150);
    }

    await page.getByRole('dialog').waitFor({ timeout: 10000 });
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForLoadState('networkidle');
    result.sections.push(section);
}

async function answerEssaySection(page, expectedCount) {
    const section = { name: 'Essay', answered: 0, previousChecked: false };
    const answers = [
        'A smartphone is a portable digital device that combines communication, internet access, photography, entertainment, and productivity tools. It helps people make calls, send messages, study, work, and manage daily activities efficiently.',
        'Eating healthy food every day is important because it gives the body energy, vitamins, minerals, and protein. Healthy meals support concentration, growth, immunity, and long term wellness for students and workers.',
        'Air pollution is contamination of the air by harmful gases, smoke, dust, and chemicals. It is caused by vehicles, factories, burning waste, forest fires, and careless use of industrial materials.',
        'Studying English is important for vocational high school students because many workplaces use English for instructions, machines, documents, interviews, and communication with foreign clients or partners.',
        'Teamwork is cooperation among people who share a common goal. It is needed in the workplace because tasks become easier, ideas improve, problems are solved faster, and communication becomes stronger.',
    ];

    for (let i = 0; i < expectedCount; i++) {
        const textarea = page.locator('textarea[name^="question-"]');
        await textarea.waitFor({ timeout: 10000 });
        await textarea.fill(answers[i] ?? answers[0]);
        section.answered++;
        result.totalQuestionsAnswered++;

        if (i === 1 && !section.previousChecked) {
            await page.getByRole('button', { name: 'Previous' }).click();
            await page.waitForTimeout(200);
            await page.getByRole('button', { name: /Next/ }).click();
            await page.waitForTimeout(200);
            section.previousChecked = true;
        }

        const isLast = i === expectedCount - 1;
        await page.getByRole('button', { name: isLast ? /Submit Writing/ : /Next/ }).click();
        await page.waitForTimeout(150);
    }

    await page.getByRole('dialog').waitFor({ timeout: 10000 });
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForLoadState('networkidle');
    result.sections.push(section);
}

await fs.mkdir(artifactDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    locale: 'en-US',
});
const page = await context.newPage();

page.on('console', (message) => {
    result.console.push({
        type: message.type(),
        text: message.text(),
        url: message.location().url,
        lineNumber: message.location().lineNumber,
    });
});

page.on('response', async (response) => {
    const request = response.request();
    if (request.method() !== 'GET' || response.status() >= 400 || request.url().includes('/submit')) {
        let body = '';
        if (response.status() >= 400 || request.url().includes('/submit')) {
            body = await response.text().catch(() => '');
            if (body.length > 1000) body = `${body.slice(0, 1000)}...`;
        }
        result.network.push({
            url: request.url(),
            method: request.method(),
            status: response.status(),
            payload: request.postData() ?? '',
            response: body,
        });
    }
});

page.on('pageerror', (error) => {
    result.console.push({ type: 'pageerror', text: error.message, url: page.url(), lineNumber: 0 });
});

try {
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await screenshot(page, 'homepage');
    await page.getByLabel('Packet Test Code').fill('tep-pratice');
    await page.getByLabel('Username').fill('User 2');
    await page.getByLabel('Password').fill('password');
    await clickByText(page, 'Start Test');
    await waitForUrl(page, /\/test\/general$/, 'Login redirects to General Information');
    await page.getByRole('heading', { name: 'General Information' }).waitFor({ timeout: 10000 });
    recordValidation('General page loads', true, page.url());
    await screenshot(page, 'general-information');

    await continueInfo(page, 'General Information');
    await waitForUrl(page, /\/test\/listening$/, 'General Continue navigates to Listening info');
    await continueInfo(page, 'listening Section Information');
    await waitForUrl(page, /\/test\/listening-question$/, 'Listening info Continue navigates to Listening questions');
    await screenshot(page, 'listening-question-start');
    await answerListeningSection(page, 50);
    await screenshot(page, 'after-listening-submit');

    await waitForUrl(page, /\/test\/structure$/, 'Listening submit navigates to Structure info');
    await continueInfo(page, 'structure Section Information');
    await waitForUrl(page, /\/test\/structure-question$/, 'Structure info Continue navigates to Structure questions');
    await answerRadioSection(page, 'Structure', 40);
    await screenshot(page, 'after-structure-submit');

    await waitForUrl(page, /\/test\/reading$/, 'Structure submit navigates to Reading info');
    await continueInfo(page, 'reading Section Information');
    await waitForUrl(page, /\/test\/reading-question$/, 'Reading info Continue navigates to Reading questions');
    await answerRadioSection(page, 'Reading', 50);
    await screenshot(page, 'after-reading-submit');

    await waitForUrl(page, /\/test\/essay$/, 'Reading submit navigates to Essay info');
    await continueInfo(page, 'essay Section Information');
    await waitForUrl(page, /\/test\/essay-question$/, 'Essay info Continue navigates to Essay questions');
    await answerEssaySection(page, 5);
    await screenshot(page, 'after-essay-submit');

    await waitForUrl(page, /\/scoreboard$/, 'Essay submit navigates to Scoreboard', 30000);
    await page.getByRole('heading', { name: 'Test Results' }).waitFor({ timeout: 10000 });
    recordValidation('Scoreboard opens', true, page.url());
    await screenshot(page, 'scoreboard');
} catch (error) {
    result.bug = {
        message: error.message,
        url: page.url(),
        title: await page.title().catch(() => ''),
    };
    await screenshot(page, 'failure');
} finally {
    result.finalUrl = page.url();
    result.title = await page.title().catch(() => '');
    result.endedAt = new Date().toISOString();
    await fs.writeFile(path.join(artifactDir, 'result.json'), JSON.stringify(result, null, 2));
    await browser.close();
}

if (result.bug) {
    console.error(JSON.stringify(result.bug, null, 2));
    process.exit(1);
}

console.log(JSON.stringify({
    finalUrl: result.finalUrl,
    sections: result.sections,
    validations: result.validations.length,
    screenshots: result.screenshots.length,
    consoleErrors: result.console.filter((item) => ['error', 'pageerror'].includes(item.type)).length,
    networkRecords: result.network.length,
}, null, 2));
