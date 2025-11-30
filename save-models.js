const https = require('https');
const fs = require('fs');
const path = require('path');

// Read API Key
let apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf8');
            const match = envConfig.match(/GEMINI_API_KEY=(.*)/);
            if (match) apiKey = match[1].trim();
        }
    } catch (e) {
        console.error("Error reading .env.local:", e);
    }
}

if (!apiKey) {
    console.error("No API Key found!");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        fs.writeFileSync('models.json', data);
        console.log("Saved models to models.json");
    });
}).on('error', (e) => {
    console.error("Request error:", e);
});
