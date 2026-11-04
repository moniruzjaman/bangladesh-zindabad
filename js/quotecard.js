/* ============================================================
   Quote Card Maker — উক্তি কার্ড
   - Select any memorable quote/paragraph in the book → one-tap
     typographic card at 1200×675 (PNG)
   - 5 themes: গাঢ় সবুজ · সোনালি নথি · রক্তিম সংস্কার · ক্রিম কাগজ · অমাবস্যার রাত
   - Download PNG · Copy text · Share to WhatsApp/Facebook/X/Telegram
   ============================================================ */

(function () {
    const SITE_URL = 'https://moniruzjaman.github.io/bangladesh-zindabad/';
    const W = 1200, H = 675;
    const FOOTER_TITLE = 'বাংলাদেশ জিন্দাবাদ — বাংলাদেশী জাতীয়তাবাদের সহজপাঠ';
    const FOOTER_TAG = 'মূল পুস্তিকার সৌজন্য ই-বুক সংস্করণ';
    const FOOTER_URL = 'moniruzjaman.github.io/bangladesh-zindabad';

    const THEMES = {
        'dark-green': {
            name: 'গাঢ় সবুজ',
            bg: ['#0B3D2E', '#062B1F'], fg: '#F3EFE4', accent: '#C9A227', muted: 'rgba(243,239,228,0.75)',
            frame: 'single'
        },
        'golden-doc': {
            name: 'সোনালি নথি',
            bg: ['#F7EDD3', '#EAD093'], fg: '#3E2A12', accent: '#8C6A1D', muted: 'rgba(62,42,18,0.72)',
            frame: 'double'
        },
        'crimson': {
            name: 'রক্তিম সংস্কার',
            bg: ['#4A0E12', '#2B0608'], fg: '#F7ECE1', accent: '#E0A93E', muted: 'rgba(247,236,225,0.75)',
            frame: 'single'
        },
        'cream-paper': {
            name: 'ক্রিম কাগজ',
            bg: ['#FBF6EA', '#EFE6D0'], fg: '#1F3D2B', accent: '#145A32', muted: 'rgba(31,61,43,0.72)',
            frame: 'single'
        },
        'moonless': {
            name: 'অমাবস্যার রাত',
            bg: ['#0B0B12', '#16161F'], fg: '#E9E9F2', accent: '#C25B5B', muted: 'rgba(233,233,242,0.72)',
            frame: 'single'
        }
    };

    const PRESETS = [
        'আমাদের স্বাধীনতা কারো দয়ার দান নয়, আমাদের অর্জন।',
        'স্বাধীনতাকে সুদৃঢ় রাখা এবং স্বাধীনতাকে অর্থবহ করে তোলা — এই দুটোই আমাদের অবশ্যকরণীয়।',
        'এক দফা — বাংলাদেশ স্বাধীন চাই।'
    ];

    let activeTheme = 'dark-green';
    let drawTimer = null;

    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

    // ── Canvas rendering ──────────────────────────────────────
    async function ensureFonts() {
        try {
            await Promise.all([
                document.fonts.load('700 150px "NotoSerifBengali"'),
                document.fonts.load('400 44px "NotoSerifBengali"'),
                document.fonts.load('700 30px "NotoSansBengali"'),
                document.fonts.load('400 24px "NotoSansBengali"'),
            ]);
        } catch (e) { /* system fallback is fine */ }
    }

    function wrapLines(ctx, text, maxWidth) {
        const words = text.split(/\s+/).filter(Boolean);
        const lines = [];
        let line = '';
        for (const w of words) {
            const test = line ? line + ' ' + w : w;
            if (ctx.measureText(test).width <= maxWidth) {
                line = test;
            } else {
                if (line) lines.push(line);
                // extremely long single word — hard break
                if (ctx.measureText(w).width > maxWidth) {
                    let part = '';
                    for (const ch of w) {
                        if (ctx.measureText(part + ch).width > maxWidth && part) {
                            lines.push(part); part = ch;
                        } else part += ch;
                    }
                    line = part;
                } else line = w;
            }
        }
        if (line) lines.push(line);
        return lines;
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

    function drawCard(text) {
        const canvas = $('#qcCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const t = THEMES[activeTheme];
        text = (text || '').trim() || PRESETS[0];

        // Background
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, t.bg[0]);
        g.addColorStop(1, t.bg[1]);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);

        // Subtle vignette for dark themes
        if (activeTheme === 'dark-green' || activeTheme === 'crimson' || activeTheme === 'moonless') {
            const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, W * 0.75);
            v.addColorStop(0, 'rgba(255,255,255,0.04)');
            v.addColorStop(1, 'rgba(0,0,0,0.18)');
            ctx.fillStyle = v;
            ctx.fillRect(0, 0, W, H);
        }

        // Frame
        if (t.frame === 'double') {
            ctx.strokeStyle = t.accent;
            ctx.lineWidth = 3;
            ctx.strokeRect(30, 30, W - 60, H - 60);
            ctx.lineWidth = 1;
            ctx.strokeRect(44, 44, W - 88, H - 88);
        } else {
            ctx.strokeStyle = t.accent;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.85;
            ctx.strokeRect(30, 30, W - 60, H - 60);
            ctx.globalAlpha = 1;
        }

        // Corner diamonds
        const cx = [30, W - 30], cy = [30, H - 30];
        ctx.fillStyle = t.accent;
        for (const x of cx) for (const y of cy) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-5, -5, 10, 10);
            ctx.restore();
        }

        // Big opening quote glyph
        ctx.fillStyle = t.accent;
        ctx.font = '700 150px "NotoSerifBengali", serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.globalAlpha = 0.95;
        ctx.fillText('\u201C', 72, 208);
        ctx.globalAlpha = 1;

        // Adaptive body text
        const left = 92, right = W - 92, top = 248, bottom = H - 118;
        const sizes = [46, 42, 38, 34, 30];
        let chosen = sizes[sizes.length - 1], lines = null, lineH = 0;
        for (const size of sizes) {
            ctx.font = `400 ${size}px "NotoSerifBengali", serif`;
            lineH = size * 1.55;
            const maxLines = Math.max(1, Math.floor((bottom - top) / lineH));
            lines = wrapLines(ctx, text, right - left);
            if (lines.length <= maxLines) { chosen = size; break; }
        }
        ctx.font = `400 ${chosen}px "NotoSerifBengali", serif`;
        lineH = chosen * 1.55;
        const maxLines = Math.max(1, Math.floor((bottom - top) / lineH));
        if (lines.length > maxLines) {
            lines = lines.slice(0, maxLines);
            let last = lines[maxLines - 1];
            while (ctx.measureText(last + '…').width > right - left && last.length > 4) last = last.slice(0, -1);
            lines[maxLines - 1] = last.replace(/[\s,;:—-]+$/, '') + '…';
        }
        ctx.fillStyle = t.fg;
        let y = top + chosen * 0.92;
        for (const ln of lines) { ctx.fillText(ln, left, y); y += lineH; }

        // Footer rule + credits
        ctx.strokeStyle = t.accent;
        ctx.globalAlpha = 0.65;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(90, H - 96);
        ctx.lineTo(W - 90, H - 96);
        ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.font = '700 28px "NotoSansBengali", sans-serif';
        ctx.fillStyle = t.fg;
        ctx.textAlign = 'left';
        ctx.fillText(FOOTER_TITLE, 90, H - 56);

        ctx.font = '400 24px "NotoSansBengali", sans-serif';
        ctx.fillStyle = t.muted;
        ctx.textAlign = 'right';
        ctx.fillText(FOOTER_URL, W - 90, H - 56);

        ctx.font = '400 22px "NotoSansBengali", sans-serif';
        ctx.fillStyle = t.accent;
        ctx.textAlign = 'left';
        ctx.fillText(FOOTER_TAG, 90, H - 40 + 6);
    }

    async function redraw() {
        await ensureFonts();
        drawCard($('#qcText') ? $('#qcText').value : '');
    }

    // ── Modal handling ────────────────────────────────────────
    function openModal(presetText) {
        const modal = $('#quoteModal');
        if (!modal) return;
        $('#qcText').value = presetText || PRESETS[0];
        modal.classList.add('visible');
        updateThemeButtons();
        redraw();
    }
    function closeModal() {
        $('#quoteModal').classList.remove('visible');
    }
    function updateThemeButtons() {
        $$('.qc-theme').forEach(b => b.classList.toggle('active', b.dataset.qtheme === activeTheme));
    }

    // ── Text selection → floating button ──────────────────────
    const selBtn = () => $('#selQuoteBtn');
    function hideSelBtn() { const b = selBtn(); if (b) b.style.display = 'none'; }

    function onSelectionDone() {
        const sel = window.getSelection && window.getSelection();
        if (!sel || sel.isCollapsed || !sel.rangeCount) { hideSelBtn(); return; }
        const node = sel.anchorNode;
        const inBody = node && node.parentElement && node.parentElement.closest('.chapter-body');
        const text = sel.toString().replace(/\s+/g, ' ').trim();
        if (!inBody || text.length < 15) { hideSelBtn(); return; }
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        const b = selBtn();
        b.style.display = 'flex';
        const top = Math.max(74, rect.top - 52);
        const left = Math.min(window.innerWidth - 150, Math.max(10, rect.left + rect.width / 2 - 70));
        b.style.top = top + 'px';
        b.style.left = left + 'px';
        b.dataset.quote = text.slice(0, 600);
    }

    // ── Share helpers ─────────────────────────────────────────
    function quoteWithCredit() {
        const q = ($('#qcText').value || '').trim() || PRESETS[0];
        return `\u201C${q}\u201D\n— ${FOOTER_TITLE} (${FOOTER_TAG})\n${SITE_URL}`;
    }
    async function canvasBlob() {
        return new Promise(res => $('#qcCanvas').toBlob(res, 'image/png'));
    }

    async function downloadPng() {
        const blob = await canvasBlob();
        if (!blob) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'bangladesh-zindabad-উক্তি-কার্ড.png';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
    }

    async function copyText(btn) {
        let ok = false;
        try { await navigator.clipboard.writeText(quoteWithCredit()); ok = true; }
        catch (e) { /* clipboard unavailable */ }
        if (btn) {
            const old = btn.textContent;
            btn.textContent = ok ? '✓ কপি হয়েছে' : '✗ ব্যর্থ';
            setTimeout(() => btn.textContent = old, 1500);
        }
    }

    function shareUrl(platform) {
        const q = ($('#qcText').value || '').trim() || PRESETS[0];
        const full = quoteWithCredit();
        const u = encodeURIComponent(SITE_URL);
        switch (platform) {
            case 'whatsapp':
                return `https://wa.me/?text=${encodeURIComponent(full)}`;
            case 'facebook':
                return `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${encodeURIComponent('\u201C' + q + '\u201D')}`;
            case 'twitter': {
                let t = `\u201C${q}\u201D — ${FOOTER_TITLE.split(' — ')[0]}`;
                if (t.length > 220) t = t.slice(0, 217) + '…';
                return `https://twitter.com/intent/tweet?url=${u}&text=${encodeURIComponent(t)}`;
            }
            case 'telegram':
                return `https://t.me/share/url?url=${u}&text=${encodeURIComponent('\u201C' + q + '\u201D — ' + FOOTER_TITLE.split(' — ')[0])}`;
            default:
                return SITE_URL;
        }
    }

    function openPopup(url) {
        window.open(url, '_blank', 'width=640,height=560,left=' + Math.max(0, (screen.width - 640) / 2) + ',top=' + Math.max(0, (screen.height - 560) / 2 - 40) + ',menubar=no,toolbar=no,resizable=yes,scrollbars=yes');
    }

    async function nativeShareFile() {
        const q = ($('#qcText').value || '').trim();
        const blob = await canvasBlob();
        const file = blob ? new File([blob], 'bangladesh-zindabad-quote-card.png', { type: 'image/png' }) : null;
        const payload = { title: FOOTER_TITLE.split(' — ')[0], text: q ? `\u201C${q}\u201D` : '', url: SITE_URL };
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
            payload.files = [file];
        }
        if (navigator.share) {
            try { await navigator.share(payload); return true; }
            catch (e) { return e && e.name === 'AbortError'; }
        }
        return false;
    }

    // ── Events ────────────────────────────────────────────────
    function wire() {
        const modal = $('#quoteModal');
        if (!modal) return;

        // Floating selection button
        document.addEventListener('mouseup', () => setTimeout(onSelectionDone, 10));
        document.addEventListener('touchend', () => setTimeout(onSelectionDone, 150));
        window.addEventListener('scroll', hideSelBtn, { passive: true });
        $('#selQuoteBtn').addEventListener('click', () => {
            const q = $('#selQuoteBtn').dataset.quote || '';
            hideSelBtn();
            openModal(q);
        });

        // Topbar
        $('#btnQuote').addEventListener('click', () => {
            const sel = window.getSelection && window.getSelection();
            const text = sel && !sel.isCollapsed ? sel.toString().replace(/\s+/g, ' ').trim().slice(0, 600) : '';
            openModal(text);
        });
        $('#btnCloseQuote').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target.id === 'quoteModal') closeModal(); });

        // Presets
        $$('.qc-preset').forEach(btn => btn.addEventListener('click', () => {
            $('#qcText').value = btn.dataset.quote;
            scheduleRedraw();
        }));

        // Themes
        $$('.qc-theme').forEach(btn => btn.addEventListener('click', () => {
            activeTheme = btn.dataset.qtheme;
            updateThemeButtons();
            redraw();
        }));

        // Text edits → debounce redraw
        $('#qcText').addEventListener('input', scheduleRedraw);

        // Actions
        $('#qcDownload').addEventListener('click', downloadPng);
        $('#qcCopy').addEventListener('click', (e) => copyText(e.currentTarget));
        $$('.qc-share[data-qshare]').forEach(btn => btn.addEventListener('click', () => {
            const p = btn.dataset.qshare;
            if (p === 'native') { nativeShareFile(); return; }
            openPopup(shareUrl(p));
        }));

        // Esc
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('visible')) closeModal();
        });
    }

    function scheduleRedraw() {
        clearTimeout(drawTimer);
        drawTimer = setTimeout(redraw, 300);
    }

    function init() {
        // Give reader.js a beat to render the book first
        const start = () => {
            if (!$('#bookContent').children.length) { setTimeout(start, 120); return; }
            wire();
        };
        start();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
