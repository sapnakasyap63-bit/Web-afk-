require('dotenv').config();
const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const AFK_PAGE_URL = process.env.AFK_PAGE_URL || 'https://dash.pingless.org/afk';
const REFRESH_INTERVAL = (process.env.REFRESH_INTERVAL_MINUTES || 15) * 60 * 1000;

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startBot() {
    console.log("🚀 Starting Cookie-Based AFK Bot...");

    if (!fs.existsSync('./cookies.json')) {
        console.log("❌ Error: 'cookies.json' file not found! Please export cookies from your browser after logging in.");
        return;
    }

    const browser = await puppeteer.launch({
        headless: false, // Render ya server par chalaane ke liye ise 'true' kar dena
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    try {
        // 1. Load Cookies
        console.log("🍪 Loading session cookies...");
        const cookiesString = fs.readFileSync('./cookies.json', 'utf8');
        const cookies = JSON.parse(cookiesString);
        await page.setCookie(...cookies);

        // 2. Direct Go to AFK Page
        console.log(`🌐 Navigating directly to: ${AFK_PAGE_URL}`);
        await page.goto(AFK_PAGE_URL, { waitUntil: 'networkidle2' });
        await wait(5000);

        console.log("✅ Successfully logged in via cookies and reached AFK page!");

        // 3. AFK & Refresh Loop
        console.log(`🔄 AFK refresh loop running every ${process.env.REFRESH_INTERVAL_MINUTES || 15} minutes...`);
        
        setInterval(async () => {
            try {
                console.log(`[${new Date().toLocaleTimeString()}] 🔄 Refreshing page to maintain AFK...`);
                await page.reload({ waitUntil: 'networkidle2' });
                await wait(4000);
                console.log("✅ Page refreshed successfully!");
            } catch (err) {
                console.log("❌ Refresh error:", err.message);
            }
        }, REFRESH_INTERVAL);

    } catch (error) {
        console.log("❌ Fatal Error:", error);
    }
}

startBot();
