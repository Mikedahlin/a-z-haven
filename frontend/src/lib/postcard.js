// Compose a downloadable postcard PNG: scene image + title + caption + footer
export async function createPostcard({ imageUrl, title, body, petName }) {
    const W = 1600, H = 1000;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");

    // Warm cream background
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#F7F3EB");
    grad.addColorStop(1, "#EBE5D9");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Soft frame
    ctx.strokeStyle = "rgba(44,54,39,0.10)";
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, W - 80, H - 80);

    // Paper card panel
    ctx.fillStyle = "#FFFCF8";
    roundRect(ctx, 80, 80, W - 160, H - 160, 32);
    ctx.fill();
    ctx.strokeStyle = "rgba(44,54,39,0.06)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, 80, 80, W - 160, H - 160, 32);
    ctx.stroke();

    // Image (left column)
    const imgX = 120, imgY = 130, imgW = 760, imgH = H - 260;
    if (imageUrl) {
        try {
            const img = await loadImage(imageUrl);
            // cover-fit
            const ratio = Math.max(imgW / img.width, imgH / img.height);
            const dw = img.width * ratio, dh = img.height * ratio;
            const dx = imgX + (imgW - dw) / 2;
            const dy = imgY + (imgH - dh) / 2;
            ctx.save();
            roundRect(ctx, imgX, imgY, imgW, imgH, 24);
            ctx.clip();
            ctx.drawImage(img, dx, dy, dw, dh);
            ctx.restore();
        } catch {
            ctx.fillStyle = "#EBE5D9";
            roundRect(ctx, imgX, imgY, imgW, imgH, 24);
            ctx.fill();
        }
    }

    // Right column text
    const tx = 940;
    ctx.fillStyle = "#D9735A";
    ctx.font = "600 22px 'Nunito', system-ui, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText("A · NOTE FROM THE HAVEN", tx, 150);

    ctx.fillStyle = "#2C3627";
    ctx.font = "italic 600 60px 'Fraunces', Georgia, serif";
    wrapText(ctx, title || "A cozy chapter", tx, 195, W - tx - 130, 66);

    ctx.fillStyle = "#5C584E";
    ctx.font = "400 24px 'Nunito', system-ui, sans-serif";
    const bodyTrim = (body || "").replace(/\s+/g, " ").trim();
    const teaser = bodyTrim.length > 360 ? bodyTrim.slice(0, 357).trimEnd() + "…" : bodyTrim;
    wrapText(ctx, teaser, tx, 360, W - tx - 130, 34);

    // Footer
    ctx.fillStyle = "#5B7B53";
    ctx.font = "600 20px 'Nunito', system-ui, sans-serif";
    const stamp = petName
        ? `made on a–z haven · with archie, zeke${petName ? `, & ${petName.toLowerCase()}` : ""}`
        : "made on a–z haven · with archie & zeke";
    ctx.fillText(stamp, tx, H - 175);

    // Tiny logo block
    ctx.fillStyle = "rgba(217,115,90,0.16)";
    roundRect(ctx, tx, H - 230, 80, 80, 20);
    ctx.fill();
    ctx.fillStyle = "#D9735A";
    ctx.font = "italic 600 38px 'Fraunces', Georgia, serif";
    ctx.fillText("a–z", tx + 13, H - 222);

    return canvas;
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let yy = y;
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line.trim(), x, yy);
            line = words[n] + " ";
            yy += lineHeight;
        } else {
            line = testLine;
        }
    }
    if (line.trim()) ctx.fillText(line.trim(), x, yy);
}
