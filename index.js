require('dotenv').config();
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

// Variables extraction from .env
const SITE_URL = process.env.SITE_URL;
const USER_EMAIL = process.env.USER_EMAIL;
const USER_PASSWORD = process.env.USER_PASSWORD;
const AFK_PAGE_URL = process.env.AFK_PAGE_URL || SITE_URL;
const REFRESH_INTERVAL = (process.env.REFRESH_INTERVAL_MINUTES || 15) * 60 * 1000;

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startBot() {
    console.log("🚀 Starting Pingless Human-Like AFK Bot...");

    if (!USER_EMAIL || !USER_PASSWORD) {
        console.log("❌ Error: Email or Password missing in environment variables!");
        return;
    }

    const browser = await puppeteer.launch({
        headless: false, // Background mein chalana ho toh true kar dena
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    try {
        // 1. Login Page Open karo
        console.log(`🌐 Opening Login Page: ${SITE_URL}`);
        await page.goto(SITE_URL, { waitUntil: 'networkidle2' });
        await wait(4000);

        // 2. Human-like Email Typing (WordPress/Custom forms ke standard selectors: #user_login, #email, etc.)
        console.log("⌨️ Entering Email/Username...");
        await page.waitForSelector('#user_login, #email, input[type="text"]', { timeout: 10000 });
        await page.type('#user_login, #email, input[type="text"]', USER_EMAIL, { delay: 100 });
        await wait(1500);

        // 3. Human-like Password Typing
        console.log("🔑 Entering Password...");
        await page.waitForSelector('#user_pass, #password, input[type="password"]', { timeout: 10000 });
        await page.type('#user_pass, #password, input[type="password"]', USER_PASSWORD, { delay: 110 });
        await wait(2000);

        // 4. Natural Mouse movement before clicking submit
        console.log("🖱️ Simulating human mouse movement...");
        await page.mouse.move(120, 250);
        await wait(600);
        await page.mouse.move(340, 420);
        await wait(1000);

        // 5. Click Login / Submit Button
        console.log("🖱️ Clicking Submit/Login Button...");
        await Promise.all([
            page.click('#wp-submit, #login-btn, button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {})
        ]);
        await wait(5000);
        console.log("✅ Login Process Completed!");

        // 6. Navigate to AFK Page Dashboard
        if (AFK_PAGE_URL !== SITE_URL) {
            console.log(`🌐 Navigating to AFK Dashboard: ${AFK_PAGE_URL}`);
            await page.goto(AFK_PAGE_URL, { waitUntil: 'networkidle2' });
            await wait(4000);
        }

        // 7. Continuous AFK Refresh Loop (Har 10-15 minute mein page refresh)
        console.log(`🔄 AFK & Refresh Loop started (Refreshing every ${process.env.REFRESH_INTERVAL_MINUTES || 15} minutes)...`);
        
        setInterval(async () => {
            try {
                console.log(`[${new Date().toLocaleTimeString()}] 🔄 Refreshing page to maintain AFK status...`);
                await page.reload({ waitUntil: 'networkidle2' });
                await wait(5000);

                // Optional: Yahan agar koi specific element ya button click karna ho toh check kar sakte hain
                console.log("✅ Page refreshed successfully, AFK active.");
            } catch (err) {
                console.log("❌ Error during refresh loop:", err.message);
            }
        }, REFRESH_INTERVAL);

    } catch (error) {
        console.log("❌ Fatal Automation Error:", error);
    }
}

startBot();
