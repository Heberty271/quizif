export async function gradeCodeWithAI(objective, correctCode, studentCode) {
    const prompt = `
        Aja como um professor especialista em desenvolvimento web a corrigir uma prova.
        O objetivo da questão era: "${objective}".

        O código de gabarito do professor é:
        HTML: \`\`\`html\n${correctCode.html || ''}\n\`\`\`
        CSS: \`\`\`css\n${correctCode.css || ''}\n\`\`\`
        JS: \`\`\`javascript\n${correctCode.js || ''}\n\`\`\`

        O código enviado pelo aluno é:
        HTML: \`\`\`html\n${studentCode.html || ''}\n\`\`\`
        CSS: \`\`\`css\n${studentCode.css || ''}\n\`\`\`
        JS: \`\`\`javascript\n${studentCode.js || ''}\n\`\`\`

        Compare o código do aluno com o gabarito. Não precisa de ser idêntico, mas deve ser funcionalmente equivalente, não precisa ser muito exigente.
        Atribua uma nota de 0 a 10 e forneça um feedback curto e construtivo em português.
        Responda APENAS com um objeto JSON no seguinte formato: {"grade": number, "feedback": string}.
    `;

    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    "grade": { "type": "NUMBER" },
                    "feedback": { "type": "STRING" }
                },
                required: ["grade", "feedback"]
            }
        }
    };
    
    // A API Key será injetada automaticamente pelo ambiente
    const apiKey = "AIzaSyBMSD8v5emxk8hTXlN6orvEi-n8fac72vU"; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0]) {
        return JSON.parse(result.candidates[0].content.parts[0].text);
    } else {
        throw new Error("Resposta da IA inválida.");
    }
}