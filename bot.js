const botBubble = document.getElementById('botBubble');
const botWindow = document.getElementById('botWindow');

// Toggle bot window
botBubble.addEventListener('click', () => {
    botWindow.style.display = botWindow.style.display === 'none' ? 'block' : 'none';
});

// Convert worded math to symbols
function wordToMath(text) {
    let expr = text.toLowerCase();
    expr = expr.replace(/plus/g, "+");
    expr = expr.replace(/minus/g, "-");
    expr = expr.replace(/times|multiplied by/g, "*");
    expr = expr.replace(/divided by/g, "/");
    expr = expr.replace(/squared/g, "^2");
    expr = expr.replace(/square root of/g, "sqrt");
    expr = expr.replace(/\s/g, "");
    return expr;
}

// Detect math in text
function detectTextMath() {
    const elements = document.querySelectorAll('p, span, div');
    const mathRegex = /^[0-9+\-*/^().\s]+$/;

    elements.forEach(el => {
        const text = el.innerText.trim();
        if (!text || text.length < 2) return;

        let expr = text;
        if (!/[\+\-\*\/\^()]/.test(text)) {
            expr = wordToMath(text);
        }

        try {
            const result = math.evaluate(expr);
            const msg = document.createElement('div');
            msg.className = 'botMsg';
            msg.innerText = `"${text}" = ${result}`;
            if (!botWindow.innerText.includes(msg.innerText)) {
                botWindow.appendChild(msg);
            }
        } catch (e) {}
    });
}

// Detect math in images (graphs)
async function detectGraphMath() {
    const images = document.querySelectorAll('img, canvas');

    for (let img of images) {
        try {
            const result = await Tesseract.recognize(img.src || img.toDataURL(), 'eng');
            const text = result.data.text.trim();
            if (!text) continue;

            let expr = wordToMath(text);
            let answer;
            try { answer = math.evaluate(expr); }
            catch(e){ answer = "Cannot solve graph problem"; }

            const msg = document.createElement('div');
            msg.className = 'botMsg';
            msg.innerText = `"Graph Text: ${text}" = ${answer}`;
            if (!botWindow.innerText.includes(msg.innerText)) {
                botWindow.appendChild(msg);
            }
        } catch(e) {
            console.log("Graph OCR failed:", e);
        }
    }
}

// Run detection automatically every 2 seconds
setInterval(() => {
    detectTextMath();
    detectGraphMath();
}, 2000);
