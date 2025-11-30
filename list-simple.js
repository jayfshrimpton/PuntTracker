const https = require('https');
const fs = require('fs');
const path = require('path');

let apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf8');
            const match = envConfig.match(/GEMINI_API_KEY=(.*)/);
            if (match) apiKey = match[1].trim();
        }
    } catch (e) { }
}

if (!apiKey) {
    console.log("NO_KEY");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.models) {
                console.log("MODELS_START");
                json.models.forEach(m => console.log(m.name));
                console.log("MODELS_END");
            } else {
                console.log("ERROR: " + JSON.stringify(json));
            }
        } catch (e) {
            console.log("PARSE_ERROR");
        }
    });
});
