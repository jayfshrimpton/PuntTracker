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

console.log(`Using API Key: ${apiKey.substring(0, 5)}...`);

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error("API Error:", JSON.stringify(json.error, null, 2));
            } else {
                console.log("Available Models:");
                if (json.models) {
                    json.models.forEach(m => {
                        if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                            console.log(`- ${m.name} (${m.displayName})`);
                        }
                    });
                } else {
                    console.log("No models found in response:", json);
                }
            }
        } catch (e) {
            console.error("Failed to parse response:", data);
        }
    });
}).on('error', (e) => {
    console.error("Request error:", e);
});
