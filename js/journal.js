/* ============================================================
   Reader's Journal — পাঠকের নোটবুক ও বুকমার্কিং
   - Per-chapter personal notes & review, auto-saved to
     localStorage (device-local, nothing leaves the browser)
   - Chapter bookmarks + badges in the TOC
   - One-click export (.txt download) or copy of all notes
   ============================================================ */

(function () {
    const NOTES_KEY = 'ebook-notes-v1';
    const BOOKMARKS_KEY = 'ebook-bookmarks-v1';
    const SITE_URL = 'https://moniruzjaman.github.io/bangladesh-zindabad/';

    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

    // ── Storage helpers ───────────────────────────────────────
    function loadJson(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) { return fallback; }
    }
    function saveJson(key, val) {
        try { localStorage.setItem(key, JSON.stringify(val)); return true; }
        catch (e) { return false; }
    }
    const getNotes = () => loadJson(NOTES_KEY, {});
    const getBookmarks = () => loadJson(BOOKMARKS_KEY, []);
    const saveNotes = (n) => saveJson(NOTES_KEY, n);
    const saveBookmarks = (b) => saveJson(BOOKMARKS_KEY, b);

    // ── Chapter catalogue ─────────────────────────────────────
    function chaptersAll() {
        return [
            ...EBOOK_CONTENT.chapters,
            EBOOK_CONTENT.glossary,
            EBOOK_CONTENT.resources,
        ];
    }
    const chapterById = (id) => chaptersAll().find(c => c.id === id);

    // ── Inject per-chapter note cards + bookmark buttons ──────
    function injectJournalCards() {
        for (const ch of chaptersAll()) {
            const section = document.getElementById(ch.id);
            if (!section || section.querySelector('.journal-card')) continue;

            // Bookmark toggle in the chapter header
            const header = section.querySelector('.chapter-header');
            if (header && !header.querySelector('.chapter-bookmark')) {
                const bm = document.createElement('button');
                bm.className = 'chapter-bookmark';
                bm.dataset.bm = ch.id;
                bm.type = 'button';
                bm.title = 'বুকমার্ক করুন';
                bm.setAttribute('aria-label', 'বুকমার্ক করুন');
                header.appendChild(bm);
            }

            // Notes card at the end of the chapter
            const card = document.createElement('div');
            card.className = 'journal-card';
            card.dataset.journal = ch.id;
            card.innerHTML = `
  <div class="jc-head">
    <span class="jc-title">📓 পাঠকের নোটবুক</span>
    <span class="jc-status" data-status="${ch.id}"></span>
  </div>
  <textarea class="jc-note" data-note="${ch.id}" rows="4"
    placeholder="এই অধ্যায় নিয়ে আপনার ভাবনা, পর্যালোচনা বা প্রশ্ন লিখুন… (এই ডিভাইসেই সংরক্ষিত থাকবে)"></textarea>
  <div class="jc-foot">
    <button type="button" class="jc-save" data-save="${ch.id}">সংরক্ষণ করুন</button>
    <span class="jc-hint">স্বয়ংক্রিয়ভাবে সংরক্ষিত হয় · localStorage</span>
  </div>`;
            section.appendChild(card);
        }
        hydrateFromStorage();
        decorateBookmarks();
        decorateToc();
    }

    function hydrateFromStorage() {
        const notes = getNotes();
        $$('.jc-note').forEach(ta => { ta.value = notes[ta.dataset.note] || ''; });
        $$('.chapter-bookmark').forEach(b => {
            const on = getBookmarks().includes(b.dataset.bm);
            b.classList.toggle('active', on);
            b.textContent = on ? '🔖' : '🔖';
        });
    }

    function decorateBookmarks() {
        $$('.chapter-bookmark').forEach(b => {
            b.classList.toggle('active', getBookmarks().includes(b.dataset.bm));
        });
    }

    function decorateToc() {
        const marks = new Set(getBookmarks());
        $$('.toc-item').forEach(item => {
            const existing = item.querySelector('.toc-bm');
            if (marks.has(item.dataset.target)) {
                if (!existing) {
                    const s = document.createElement('span');
                    s.className = 'toc-bm';
                    s.title = 'বুকমার্ক করা';
                    s.textContent = '🔖';
                    item.querySelector('.toc-text-block').appendChild(s);
                }
            } else if (existing) existing.remove();
        });
    }

    // ── Saving ────────────────────────────────────────────────
    const saveTimers = {};
    function saveNote(id, silent) {
        const ta = $(`.jc-note[data-note="${id}"]`);
        if (!ta) return;
        const notes = getNotes();
        if (ta.value.trim()) notes[id] = ta.value.trim();
        else delete notes[id];
        const ok = saveNotes(notes);
        const st = $(`[data-status="${id}"]`);
        if (st) {
            const t = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
            st.textContent = ok ? `✓ সংরক্ষিত ${t}` : '✗ সংরক্ষণ ব্যর্থ';
            st.classList.toggle('err', !ok);
            clearTimeout(saveTimers[id + '-fade']);
            saveTimers[id + '-fade'] = setTimeout(() => { st.textContent = ''; }, 2600);
        }
        if (!silent) renderJournalList();
    }

    function toggleBookmark(id) {
        const marks = getBookmarks();
        const i = marks.indexOf(id);
        if (i >= 0) marks.splice(i, 1); else marks.push(id);
        saveBookmarks(marks);
        decorateBookmarks();
        decorateToc();
        renderJournalList();
    }

    // ── Journal modal ─────────────────────────────────────────
    function renderJournalList() {
        const list = $('#jmNotesList');
        if (!list) return;
        const notes = getNotes();
        const marks = getBookmarks();

        // Bookmarks row
        const bmWrap = $('#jmBookmarks');
        if (marks.length) {
            bmWrap.innerHTML = marks.map(id => {
                const ch = chapterById(id);
                if (!ch) return '';
                return `<button type="button" class="jm-bm-chip" data-goto="${id}">🔖 ${ch.numLabel} · ${ch.title}</button>`;
            }).join('');
        } else {
            bmWrap.innerHTML = '<span class="jm-empty">কোনো বুকমার্ক নেই — অধ্যায়ের শিরোনামের পাশের 🔖 চেপে যোগ করুন।</span>';
        }

        // Notes list
        list.innerHTML = chaptersAll().map(ch => {
            const note = notes[ch.id] || '';
            return `
<div class="jm-row ${note ? 'has-note' : ''}">
  <div class="jm-row-head">
    <span class="jm-row-title">${ch.numLabel} · ${ch.title}</span>
    <span class="jm-row-badge">${note ? 'লেখা আছে' : 'খালি'}</span>
  </div>
  <div class="jm-row-preview">${note ? escapeHtml(note.slice(0, 160)) + (note.length > 160 ? '…' : '') : '<em>— এখনো কোনো নোট লেখা হয়নি —</em>'}</div>
  <div class="jm-row-actions">
    <button type="button" class="jm-btn" data-goto="${ch.id}">যান ও লিখুন</button>
    ${note ? `<button type="button" class="jm-btn jm-danger" data-delnote="${ch.id}">মুছুন</button>` : ''}
  </div>
</div>`;
        }).join('');
    }

    function escapeHtml(s) {
        return s.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    }

    function exportText() {
        const notes = getNotes();
        const marks = getBookmarks();
        const now = new Date();
        const dateStr = now.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
        const lines = [
            'বাংলাদেশ জিন্দাবাদ — পাঠকের নোটবুক',
            'মূল পুস্তিকার সৌজন্য ই-বুক সংস্করণ',
            `রপ্তানি: ${dateStr}`,
            '═'.repeat(40),
            ''
        ];
        let withNotes = 0;
        for (const ch of chaptersAll()) {
            const note = notes[ch.id];
            lines.push(`❖ ${ch.numLabel} · ${ch.title}`);
            if (note) { withNotes++; lines.push(note); }
            else lines.push('(কোনো নোট নেই)');
            lines.push('');
        }
        if (marks.length) {
            lines.push('═'.repeat(40), '🔖 বুকমার্ক করা অধ্যায়');
            marks.forEach(id => {
                const ch = chapterById(id);
                if (ch) lines.push(`· ${ch.numLabel} · ${ch.title} — ${SITE_URL}#${id}`);
            });
            lines.push('');
        }
        lines.push('═'.repeat(40), `মোট নোট: ${withNotes} · ${SITE_URL}`);

        const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        const y = now.getFullYear(), m = String(now.getMonth() + 1).padStart(2, '0'), d = String(now.getDate()).padStart(2, '0');
        a.download = `bangladesh-zindabad-notes-${y}-${m}-${d}.txt`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
        flashToolbar('✓ নোটবুক এক্সপোর্ট হয়েছে');
    }

    async function copyAll(btn) {
        const notes = getNotes();
        const parts = [];
        for (const ch of chaptersAll()) {
            if (notes[ch.id]) parts.push(`${ch.numLabel} · ${ch.title}\n${notes[ch.id]}`);
        }
        const text = parts.length
            ? 'বাংলাদেশ জিন্দাবাদ — আমার পাঠকের নোট\n\n' + parts.join('\n\n———\n\n')
            : 'বাংলাদেশ জিন্দাবাদ — এখনো কোনো নোট লেখা হয়নি।';
        let ok = false;
        try { await navigator.clipboard.writeText(text); ok = true; } catch (e) { }
        const old = btn.textContent;
        btn.textContent = ok ? '✓ কপি হয়েছে' : '✗ ব্যর্থ';
        setTimeout(() => btn.textContent = old, 1500);
    }

    function flashToolbar(msg) {
        const el = $('#jmFlash');
        if (!el) return;
        el.textContent = msg;
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 2200);
    }

    function openModal() {
        renderJournalList();
        $('#journalModal').classList.add('visible');
    }
    function closeModal() {
        $('#journalModal').classList.remove('visible');
    }

    // ── Events ────────────────────────────────────────────────
    function wire() {
        // Topbar
        $('#btnJournal').addEventListener('click', openModal);
        $('#btnCloseJournal').addEventListener('click', closeModal);
        $('#journalModal').addEventListener('click', (e) => {
            if (e.target.id === 'journalModal') closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && $('#journalModal').classList.contains('visible')) closeModal();
        });

        // Per-chapter interactions (delegated)
        document.addEventListener('input', (e) => {
            const ta = e.target.closest('.jc-note');
            if (!ta) return;
            const id = ta.dataset.note;
            clearTimeout(saveTimers[id]);
            saveTimers[id] = setTimeout(() => saveNote(id), 800);
        });
        document.addEventListener('click', (e) => {
            const saveBtn = e.target.closest('[data-save]');
            if (saveBtn) { saveNote(saveBtn.dataset.save); return; }

            const bmBtn = e.target.closest('.chapter-bookmark');
            if (bmBtn) { toggleBookmark(bmBtn.dataset.bm); return; }

            const gotoBtn = e.target.closest('[data-goto]');
            if (gotoBtn) {
                closeModal();
                const section = document.getElementById(gotoBtn.dataset.goto);
                const card = section && section.querySelector('.journal-card');
                (card || section)?.scrollIntoView({ behavior: 'smooth', block: card ? 'center' : 'start' });
                setTimeout(() => $(`.jc-note[data-note="${gotoBtn.dataset.goto}"]`)?.focus({ preventScroll: true }), 700);
                return;
            }

            const delBtn = e.target.closest('[data-delnote]');
            if (delBtn) {
                if (!confirm('এই অধ্যায়ের নোটটি মুছে ফেলবেন?')) return;
                const notes = getNotes();
                delete notes[delBtn.dataset.delnote];
                saveNotes(notes);
                const ta = $(`.jc-note[data-note="${delBtn.dataset.delnote}"]`);
                if (ta) ta.value = '';
                renderJournalList();
            }
        });

        // Modal toolbar
        $('#jmExport').addEventListener('click', exportText);
        $('#jmCopyAll').addEventListener('click', (e) => copyAll(e.currentTarget));
        $('#jmClearAll').addEventListener('click', () => {
            if (!confirm('সব নোট ও বুকমার্ক মুছে ফেলবেন? এটি ফিরিয়ে আনা যাবে না।')) return;
            saveNotes({});
            saveBookmarks([]);
            hydrateFromStorage();
            decorateBookmarks();
            decorateToc();
            renderJournalList();
            flashToolbar('সব নোট ও বুকমার্ক মুছে ফেলা হয়েছে');
        });
    }

    function init() {
        const start = () => {
            if (!$('#bookContent').children.length) { setTimeout(start, 120); return; }
            injectJournalCards();
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
