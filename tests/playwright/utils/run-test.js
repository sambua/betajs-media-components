import { chromium } from '@playwright/test';
import { CHROME_CANARY_LOCATION, CHROME_LOCATION } from '../consts.js';
require('dotenv').config();

const CI = process.env?.CI === true || process.env?.CI === "true";

export default async (args, func, browserSettings) => {
    const { page, browserName, browser, context } = args;

    if (!CI && (CHROME_CANARY_LOCATION || CHROME_LOCATION)) {
    }

    browserSettings.executablePath = CHROME_CANARY_LOCATION || CHROME_LOCATION;
    console.log(`Will run with: exe `, browserSettings);

    if (browserName === 'chromium') {
        await (async () => {
            // const browser = await firefox.launch();
            const browser = await chromium.launch(browserSettings);
            const page = await browser.newPage();
            const context = await browser.newContext();
            await func(page, browser, context);
        })();
    } else {
        await func(page, browser, context);
    }
}
