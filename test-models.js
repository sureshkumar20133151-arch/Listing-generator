const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const key = env.match(/GEMINI_API_KEY=(.*)/)[1].trim();

async function run() {
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await res.json();
        console.log("Available models:");
        data.models?.forEach(m => console.log(m.name, m.supportedGenerationMethods));
        if (data.error) console.error("Error from API:", data.error);
    } catch (e) { console.error(e) }
}
run();
