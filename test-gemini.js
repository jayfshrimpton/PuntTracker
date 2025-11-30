const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Manually read .env.local
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
    }
} catch (e) {
    console.error("Error reading .env.local:", e);
}

async function testModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY not found");
        return;
    }
    console.log("API Key found (starts with):", apiKey.substring(0, 4) + "...");

    const genAI = new GoogleGenerativeAI(apiKey);

    const models = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-1.5-pro-001",
        "gemini-1.0-pro"
    ];

    for (const modelName of models) {
        console.log(`\n--- Testing ${modelName} ---`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hi");
            console.log(`✅ SUCCESS: ${modelName}`);
            console.log("Response:", result.response.text());
            return; // Stop after first success
        } catch (error) {
            console.log(`❌ FAILED: ${modelName}`);
            console.log("Error:", error.message);
        }
    }
}

testModels();
