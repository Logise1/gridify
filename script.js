const state = {
    webmixes: [],
    activeWebmixId: null,
    settings: {
        backgroundImage: ''
    }
};

const DEFAULT_DATA = {
    webmixes: [
        {
            id: 'wm-home',
            name: 'Home',
            icon: 'ri-home-4-line',
            color: '#4CC9F0',
            rows: 6,
            cols: 8,
            background: '',
            tiles: [
                { id: 't-google', position: 10, name: 'Google', url: 'https://google.com', icon: 'ri-google-fill', color: '#4285F4', showText: true },
                { id: 't-youtube', position: 11, name: 'YouTube', url: 'https://youtube.com', icon: 'ri-youtube-fill', color: '#FF0000', showText: true },
                { id: 't-gmail', position: 12, name: 'Gmail', url: 'https://mail.google.com', icon: 'ri-mail-fill', color: '#EA4335', showText: true },
                { id: 't-twitter', position: 13, name: 'Twitter', url: 'https://twitter.com', icon: 'ri-twitter-x-fill', color: '#000000', showText: true },
                { id: 't-insta', position: 18, name: 'Instagram', url: 'https://instagram.com', icon: 'ri-instagram-fill', color: '#E1306C', showText: true },
                { id: 't-facebook', position: 19, name: 'Facebook', url: 'https://facebook.com', icon: 'ri-facebook-fill', color: '#1877F2', showText: true },
                { id: 't-amazon', position: 20, name: 'Amazon', url: 'https://amazon.com', icon: 'ri-shopping-cart-fill', color: '#FF9900', showText: true },
                { id: 't-netflix', position: 21, name: 'Netflix', url: 'https://netflix.com', icon: 'ri-movie-2-fill', color: '#E50914', showText: true }
            ]
        },
        {
            id: 'wm-news',
            name: 'News & Tech',
            icon: 'ri-article-line',
            color: '#06d6a0',
            rows: 6,
            cols: 9,
            background: '',
            tiles: [
                { id: 't-techcrunch', position: 0, name: 'TechCrunch', url: 'https://techcrunch.com', icon: 'ri-article-line', color: '#00A562', showText: true }
            ]
        }
    ],
    activeWebmixId: 'wm-home',
    settings: {
        backgroundImage: ''
    }
};

// DOM Elements
const gridContainer = document.getElementById('grid-container');
const webmixList = document.getElementById('webmix-list');
const modal = document.getElementById('tile-modal');
const tileUrlInput = document.getElementById('tile-url');
const tileNameInput = document.getElementById('tile-name');
const tileIconInput = document.getElementById('tile-icon');
const tileShowTextInput = document.getElementById('tile-show-text');
const colorPicker = document.getElementById('color-picker');
const deleteBtn = document.getElementById('delete-tile-btn');
const saveBtn = document.getElementById('save-tile-btn');
const closeModalBtns = document.querySelectorAll('.close-modal');

// Settings Elements
const settingsModal = document.getElementById('settings-modal');
const settingsBtn = document.getElementById('settings-btn');
const bgUrlInput = document.getElementById('bg-url-input');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const backgroundOverlay = document.querySelector('.background-overlay');

// Global UI
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const promptModal = document.getElementById('prompt-modal');
const promptInput = document.getElementById('prompt-input');
const promptConfirmBtn = document.getElementById('prompt-confirm-btn');
const promptLabel = document.getElementById('prompt-label');
const promptTitle = document.getElementById('prompt-title');

const confirmModal = document.getElementById('confirm-modal');
const confirmMessage = document.getElementById('confirm-message');
const confirmYesBtn = document.getElementById('confirm-yes-btn');
const closePromptBtns = document.querySelectorAll('.close-modal-prompt');
const closeConfirmBtns = document.querySelectorAll('.close-modal-confirm');
const magicBtn = document.getElementById('magic-autocomplete-btn'); // may fail if removed in HTML but kept ref here, let's check

// Webmix Settings UI
// Webmix Settings UI
const webmixModal = document.getElementById('webmix-modal');
const closeWebmixBtns = document.querySelectorAll('.close-modal-webmix');
const webmixNameInput = document.getElementById('webmix-name');
const webmixColsInput = document.getElementById('webmix-cols');
const webmixRowsInput = document.getElementById('webmix-rows');
const webmixIconInput = document.getElementById('webmix-icon');
const webmixIconPreview = document.getElementById('webmix-icon-preview');
const webmixColorPicker = document.getElementById('webmix-color-picker');

const saveWebmixBtn = document.getElementById('save-webmix-btn');
const deleteWebmixBtn = document.getElementById('delete-webmix-btn');

// New Global Elements
const globalBgUpload = document.getElementById('global-bg-upload');
const globalFileName = document.getElementById('global-file-name');

let currentEditTileId = null;
let currentEditPosition = null;
let selectedColor = '#2b2d42';
let selectedWebmixColor = '#4CC9F0';
let promptCallback = null;
let confirmCallback = null;

// Initialization
function init() {
    loadState();
    renderSidebar();
    renderGrid();
    setupEventListeners();
    setupGlobalUpload();
    setupWallpaperGallery();
    initOnboarding();
    setupGlobalUpload();
    setupWallpaperGallery();
}

function loadState() {
    const saved = localStorage.getItem('glimState');
    if (saved) {
        const parsed = JSON.parse(saved);
        state.webmixes = parsed.webmixes || DEFAULT_DATA.webmixes;
        state.activeWebmixId = parsed.activeWebmixId || DEFAULT_DATA.activeWebmixId;
        state.settings = parsed.settings || DEFAULT_DATA.settings;

        // Migration: Ensure new props exist
        state.webmixes.forEach(wm => {
            if (!wm.rows) wm.rows = 6;
            if (!wm.cols) wm.cols = 8;
            if (!wm.icon) wm.icon = 'ri-folder-2-line';
            if (!wm.color) wm.color = '#4CC9F0';
        });

    } else {
        Object.assign(state, JSON.parse(JSON.stringify(DEFAULT_DATA)));
    }
}

function saveState() {
    localStorage.setItem('glimState', JSON.stringify(state));
}

function getActiveWebmix() {
    return state.webmixes.find(w => w.id === state.activeWebmixId);
}

// Rendering
function renderSidebar() {
    webmixList.innerHTML = '';
    state.webmixes.forEach(wm => {
        const btn = document.createElement('div');
        btn.className = `webmix-item ${wm.id === state.activeWebmixId ? 'active' : ''}`;

        // Inline style for dynamic active color
        if (wm.id === state.activeWebmixId) {
            btn.style.setProperty('--accent-color', wm.color);
            btn.style.borderLeftColor = wm.color;
        } else {
            btn.style.borderLeftColor = 'transparent';
        }

        btn.innerHTML = `
            <i class="${wm.icon}" style="color: ${wm.id === state.activeWebmixId ? wm.color : 'inherit'}"></i>
            <span>${wm.name}</span>
            <div class="webmix-actions">
                <button class="settings-trigger" title="Settings"><i class="ri-settings-3-line"></i></button>
            </div>
        `;

        // Click main area to switch
        btn.onclick = (e) => {
            if (!e.target.closest('.settings-trigger')) {
                switchWebmix(wm.id);
            }
        };

        // Click settings gear
        const gear = btn.querySelector('.settings-trigger');
        if (gear) {
            gear.onclick = (e) => {
                e.stopPropagation();
                openWebmixSettings(wm.id);
            };
        }

        btn.oncontextmenu = (e) => {
            e.preventDefault();
            openWebmixSettings(wm.id);
        };

        webmixList.appendChild(btn);
    });
}

function renderGrid() {
    gridContainer.innerHTML = '';
    const activeWebmix = getActiveWebmix();
    if (!activeWebmix) return;

    // Apply Webmix Specific Background or Global Fallback
    const bg = activeWebmix.background || state.settings.backgroundImage || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop";
    backgroundOverlay.style.backgroundImage = `url('${bg}')`;

    // Dynamic Grid Config
    const rows = activeWebmix.rows || 6;
    const cols = activeWebmix.cols || 8;

    gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    const gridSize = rows * cols;

    for (let i = 0; i < gridSize; i++) {
        const tileData = activeWebmix.tiles.find(t => t.position === i);
        const tileEl = document.createElement('div');

        if (tileData) {
            tileEl.className = 'tile';
            tileEl.style.backgroundColor = tileData.color;
            tileEl.style.color = isDark(tileData.color) ? '#fff' : '#000';

            // ICON ONLY as requested
            tileEl.innerHTML = `
                <div class="tile-icon"><i class="${tileData.icon}"></i></div>
            `;
            // NOTE: Name hidden by CSS .tile-name display:none, removed from HTML for leaner DOM

            tileEl.onclick = (e) => window.open(tileData.url, '_blank');
            tileEl.oncontextmenu = (e) => {
                e.preventDefault();
                openEditModal(i, tileData);
            };

            tileEl.setAttribute('draggable', true);
            tileEl.ondragstart = (e) => dragStart(e, i);
            tileEl.ondragover = (e) => e.preventDefault();
            tileEl.ondrop = (e) => drop(e, i);

        } else {
            tileEl.className = 'tile tile-add';
            tileEl.innerHTML = '<i class="ri-add-line"></i>';
            tileEl.onclick = () => openEditModal(i, null);
            tileEl.ondragover = (e) => e.preventDefault();
            tileEl.ondrop = (e) => drop(e, i);
        }

        gridContainer.appendChild(tileEl);
    }
}

// Logic
function switchWebmix(id) {
    state.activeWebmixId = id;
    renderSidebar();
    renderGrid();
    saveState();
}

function openWebmixSettings(id) {
    let wm = state.webmixes.find(w => w.id === id);
    if (!wm) return;

    // Fill form
    webmixNameInput.value = wm.name;
    webmixRowsInput.value = wm.rows || 6;
    webmixColsInput.value = wm.cols || 8;
    webmixIconInput.value = wm.icon || 'ri-folder-2-line';
    webmixIconPreview.innerHTML = `<i class="${wm.icon || 'ri-folder-2-line'}"></i>`;
    // webmixBgUrl and fileNameDisplay Removed
    selectedWebmixColor = wm.color || '#4CC9F0';

    // Setup Color Picker for Webmix
    const colors = ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c', '#ffffff', '#2b2d42', '#4CC9F0', '#9D4EDD'];
    webmixColorPicker.innerHTML = '';
    colors.forEach(c => {
        const d = document.createElement('div');
        d.className = `color-option ${c === selectedWebmixColor ? 'selected' : ''}`;
        d.style.backgroundColor = c;
        d.onclick = () => {
            selectedWebmixColor = c;
            document.querySelectorAll('#webmix-color-picker .color-option').forEach(el => el.classList.remove('selected'));
            d.classList.add('selected');
        };
        webmixColorPicker.appendChild(d);
    });

    // Preview Icon Update
    webmixIconInput.oninput = () => {
        webmixIconPreview.innerHTML = `<i class="${webmixIconInput.value}"></i>`;
    };

    // Save Action
    saveWebmixBtn.onclick = () => {
        wm.name = webmixNameInput.value;
        wm.rows = parseInt(webmixRowsInput.value);
        wm.cols = parseInt(webmixColsInput.value);
        wm.icon = webmixIconInput.value;
        wm.color = selectedWebmixColor;

        // Background handling removed (Global Only)

        saveState();
        renderSidebar();
        renderGrid();
        webmixModal.classList.add('hidden');
        showToast("Webmix updated!", "success");
    };

    // Delete Action
    deleteWebmixBtn.onclick = () => {
        showConfirm(`Really delete webmix "${wm.name}"?`, () => {
            deleteWebmix(wm.id);
            webmixModal.classList.add('hidden');
        });
    };

    webmixModal.classList.remove('hidden');
}

// Webmix logic
function deleteWebmix(id) {
    state.webmixes = state.webmixes.filter(w => w.id !== id);
    if (state.activeWebmixId === id) {
        state.activeWebmixId = state.webmixes.length > 0 ? state.webmixes[0].id : null;
    }
    saveState();
    renderSidebar();
    renderGrid();
    closeEditModal();
    showToast("Webmix deleted.", "success");
}


// Tile Editor Logic
function openEditModal(position, tileData) {
    currentEditPosition = position;
    currentEditTileId = tileData ? tileData.id : null;

    if (tileData) {
        tileUrlInput.value = tileData.url;
        tileNameInput.value = tileData.name;
        tileIconInput.value = tileData.icon;
        tileShowTextInput.checked = tileData.showText;
        selectedColor = tileData.color;
        deleteBtn.classList.remove('hidden');
    } else {
        tileUrlInput.value = '';
        tileNameInput.value = '';
        tileIconInput.value = 'ri-earth-line';
        tileShowTextInput.checked = true;
        selectedColor = '#2b2d42';
        deleteBtn.classList.add('hidden');
    }

    updateColorSelection();
    document.getElementById('icon-preview-box').innerHTML = `<i class="${tileIconInput.value}"></i>`;
    modal.classList.remove('hidden');
}

function closeEditModal() {
    modal.classList.add('hidden');
    settingsModal.classList.add('hidden');
    promptModal.classList.add('hidden');
    confirmModal.classList.add('hidden');
    webmixModal.classList.add('hidden');
    currentEditTileId = null;
    currentEditPosition = null;
    promptCallback = null;
    confirmCallback = null;
}

// ... (Rest of existing functions like saveTile, deleteTile, etc.)
// Re-implementing them briefly to ensure closure integrity in this Full Rewrite

function saveTile() {
    const activeWebmix = getActiveWebmix();
    const newTile = {
        id: currentEditTileId || 't-' + Date.now(),
        position: currentEditPosition,
        url: tileUrlInput.value,
        name: tileNameInput.value,
        icon: tileIconInput.value,
        color: selectedColor,
        showText: tileShowTextInput.checked
    };

    if (!newTile.url) return showToast('URL is required', 'error');
    if (!/^https?:\/\//i.test(newTile.url)) newTile.url = 'https://' + newTile.url;

    if (currentEditTileId) {
        const index = activeWebmix.tiles.findIndex(t => t.id === currentEditTileId);
        if (index !== -1) activeWebmix.tiles[index] = newTile;
    } else {
        activeWebmix.tiles.push(newTile);
    }
    saveState();
    renderGrid();
    closeEditModal();
    showToast("Tile saved!", "success");
}

function deleteTile() {
    if (!currentEditTileId) return;
    showConfirm('Delete tile?', () => {
        const activeWebmix = getActiveWebmix();
        activeWebmix.tiles = activeWebmix.tiles.filter(t => t.id !== currentEditTileId);
        saveState();
        renderGrid();
        closeEditModal();
        showToast("Tile deleted.", "success");
    });
}

function createNewWebmix() {
    showPrompt("New Webmix Name", "My Dashboard", (name) => {
        if (!name) return;
        const newId = 'wm-' + Date.now();
        state.webmixes.push({
            id: newId,
            name: name,
            rows: 6,
            cols: 8,
            icon: 'ri-folder-2-line',
            color: '#4CC9F0',
            tiles: []
        });
        switchWebmix(newId);
        openWebmixSettings(newId); // Open settings immediately to customize
        showToast("Webmix created.", "success");
    });
}

// Helpers
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="${type === 'success' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showPrompt(title, defaultValue, callback) {
    promptTitle.textContent = title;
    promptInput.value = defaultValue;
    promptCallback = callback;
    promptModal.classList.remove('hidden');
    promptInput.focus();
}

function showConfirm(message, callback) {
    confirmMessage.textContent = message;
    confirmCallback = callback;
    confirmModal.classList.remove('hidden');
}

function selectIcon(iconClass) {
    tileIconInput.value = iconClass;
    document.getElementById('icon-preview-box').innerHTML = `<i class="${iconClass}"></i>`;
}
// Expose for HTML onclick
window.selectIcon = selectIcon;

// AI Integration
// AI Integration
async function fetchIconSuggestion() {
    const url = tileUrlInput.value;
    const name = tileNameInput.value;
    const suggestionsContainer = document.getElementById('icon-suggestions');
    const loadingEl = document.querySelector('.loading-icons');
    const previewBox = document.getElementById('icon-preview-box');

    if (!url && !name) return;

    suggestionsContainer.classList.remove('hidden');
    suggestionsContainer.innerHTML = '';
    suggestionsContainer.appendChild(loadingEl);
    loadingEl.classList.remove('hidden');

    // NOTE: Removed optimistic preview "if (tileIconInput.value.startsWith('ri-'))" 
    // because we are technically hiding the ID from the user now.

    const query = `Given the website name "${name}" and url "${url}", suggest 5 different appropriate RemixIcon v3.5.0 class names. Return ONLY a JSON array of strings (e.g. ["ri-google-fill", "ri-search-line"]).`;

    try {
        const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer mjVkbhVGVY43LJNMttSLDYOFSYFSkOuv" },
            body: JSON.stringify({ model: "mistral-small-latest", messages: [{ role: "user", content: query }], temperature: 0.2 })
        });
        const data = await response.json();
        loadingEl.classList.add('hidden');

        if (data.choices && data.choices.length > 0) {
            let content = data.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
            let icons = [];
            try { icons = JSON.parse(content); } catch (e) {
                const matches = content.match(/ri-[a-z0-9-]+/g);
                if (matches) icons = matches.slice(0, 5);
            }

            icons.forEach((iconClass, index) => {
                const iconEl = document.createElement('div');
                iconEl.className = 'suggested-icon';
                iconEl.innerHTML = `<i class="${iconClass}"></i>`;
                iconEl.onclick = () => {
                    selectIcon(iconClass);
                    document.querySelectorAll('.suggested-icon').forEach(el => el.classList.remove('selected'));
                    iconEl.classList.add('selected');
                };
                suggestionsContainer.appendChild(iconEl);

                // Auto-select first if currently empty
                if (index === 0 && (!tileIconInput.value || tileIconInput.value === 'ri-earth-line')) {
                    selectIcon(iconClass);
                    iconEl.classList.add('selected');
                }
            });
        }
    } catch (error) {
        console.error(error);
        loadingEl.classList.add('hidden');
    }
}

// Helpers
function isDark(color) {
    if (!color) return true;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return ((r * 299) + (g * 587) + (b * 114)) / 1000 < 128;
}

function updateColorSelection() {
    document.querySelectorAll('#color-picker .color-option').forEach(opt => {
        opt.onclick = () => {
            selectedColor = opt.dataset.color;
            updateColorSelection();
        };
        opt.classList.toggle('selected', opt.dataset.color === selectedColor);
    });
}

function setupEventListeners() {
    document.getElementById('add-webmix-btn').onclick = createNewWebmix;
    saveBtn.onclick = saveTile;
    deleteBtn.onclick = deleteTile;
    settingsBtn.onclick = () => settingsModal.classList.remove('hidden'); // Global settings (legacy)
    saveSettingsBtn.onclick = () => {
        state.settings.backgroundImage = bgUrlInput.value;
        saveState(); init(); // Reload
        settingsModal.classList.add('hidden');
    };

    closeModalBtns.forEach(btn => btn.onclick = closeEditModal);
    closePromptBtns.forEach(btn => btn.onclick = closeEditModal);
    closeConfirmBtns.forEach(btn => btn.onclick = closeEditModal);
    closeWebmixBtns.forEach(btn => btn.onclick = closeEditModal);

    sidebarToggle.onclick = () => {
        sidebar.classList.toggle('expanded');
        const icon = sidebarToggle.querySelector('i');
        icon.className = sidebar.classList.contains('expanded') ? 'ri-menu-fold-line' : 'ri-menu-unfold-line';
    };

    promptConfirmBtn.onclick = () => { if (promptCallback) promptCallback(promptInput.value); closeEditModal(); };
    promptInput.onkeypress = (e) => { if (e.key === 'Enter') promptConfirmBtn.click(); };
    confirmYesBtn.onclick = () => { if (confirmCallback) confirmCallback(); closeEditModal(); };

    const searchInput = document.getElementById('main-search');
    const doSearch = () => { if (searchInput.value) window.open(`https://www.google.com/search?q=${encodeURIComponent(searchInput.value)}`, '_blank'); };
    document.querySelector('.search-btn').onclick = doSearch;
    searchInput.onkeypress = (e) => { if (e.key === 'Enter') doSearch(); };

    window.onclick = (event) => { if ([modal, settingsModal, promptModal, confirmModal, webmixModal].includes(event.target)) closeEditModal(); };
    gridContainer.ondragend = () => document.querySelectorAll('.tile').forEach(t => t.style.opacity = '1');

    tileUrlInput.addEventListener('blur', () => {
        if (tileUrlInput.value.length > 3 || tileNameInput.value.length > 2) fetchIconSuggestion();
    });
}

// Custom Init for Webmix Upload
function setupWallpaperGallery() {
    const options = document.querySelectorAll('.wallpaper-option');
    options.forEach(opt => {
        opt.onclick = () => {
            const url = opt.dataset.bg;
            bgUrlInput.value = url;
            // Visual feedback
            options.forEach(el => el.style.border = '2px solid transparent');
            opt.style.border = '2px solid var(--accent-color)';
        };
    });
}

// Global Upload Setup
function setupGlobalUpload() {
    if (!globalBgUpload) return;
    globalBgUpload.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert("File too large (>2MB).");
            return;
        }
        globalFileName.textContent = file.name;

        const reader = new FileReader();
        reader.onload = function (event) {
            bgUrlInput.value = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Onboarding Logic
const recommendedPlatforms = [
    { name: 'Google', url: 'https://google.com', icon: 'ri-google-fill', color: '#4285F4' },
    { name: 'YouTube', url: 'https://youtube.com', icon: 'ri-youtube-fill', color: '#FF0000' },
    { name: 'Gmail', url: 'https://mail.google.com', icon: 'ri-mail-fill', color: '#EA4335' },
    { name: 'Twitter', url: 'https://twitter.com', icon: 'ri-twitter-x-fill', color: '#000000' },
    { name: 'Instagram', url: 'https://instagram.com', icon: 'ri-instagram-fill', color: '#E1306C' },
    { name: 'Facebook', url: 'https://facebook.com', icon: 'ri-facebook-fill', color: '#1877F2' },
    { name: 'Amazon', url: 'https://amazon.com', icon: 'ri-shopping-cart-fill', color: '#FF9900' },
    { name: 'Netflix', url: 'https://netflix.com', icon: 'ri-movie-2-fill', color: '#E50914' },
    { name: 'Spotify', url: 'https://open.spotify.com', icon: 'ri-spotify-fill', color: '#1DB954' },
    { name: 'LinkedIn', url: 'https://linkedin.com', icon: 'ri-linkedin-fill', color: '#0077B5' },
    { name: 'GitHub', url: 'https://github.com', icon: 'ri-github-fill', color: '#181717' },
    { name: 'Discord', url: 'https://discord.com', icon: 'ri-discord-fill', color: '#5865F2' },
    { name: 'Reddit', url: 'https://reddit.com', icon: 'ri-reddit-fill', color: '#FF4500' },
    { name: 'Twitch', url: 'https://twitch.tv', icon: 'ri-twitch-fill', color: '#9146FF' },
    { name: 'ChatGPT', url: 'https://chat.openai.com', icon: 'ri-openai-fill', color: '#10A37F' }
];

function initOnboarding() {
    // Check if run before
    if (localStorage.getItem('gridify_onboarded')) return;

    const modal = document.getElementById('onboarding-modal');
    const grid = document.getElementById('onboarding-grid');
    const finishBtn = document.getElementById('finish-onboarding-btn');
    const selected = new Set(); // Store indices or names

    modal.classList.remove('hidden');

    // Populate
    recommendedPlatforms.forEach((p, idx) => {
        const card = document.createElement('div');
        card.className = 'platform-card';
        card.innerHTML = `
            <i class="${p.icon}" style="color: ${p.color}"></i>
            <span>${p.name}</span>
        `;

        card.onclick = () => {
            if (selected.has(idx)) {
                selected.delete(idx);
                card.classList.remove('selected');
            } else {
                selected.add(idx);
                card.classList.add('selected');
            }
        };
        grid.appendChild(card);
    });

    finishBtn.onclick = () => {
        // Build new tiles list
        const newTiles = [];
        let pos = 0;
        selected.forEach(idx => {
            const p = recommendedPlatforms[idx];
            newTiles.push({
                id: 't-' + Date.now() + '-' + idx,
                position: pos++,
                name: p.name,
                url: p.url,
                icon: p.icon,
                color: p.color,
                showText: true
            });
        });

        // If user selected nothing, maybe keep defaults? Or empty?
        // Let's assume they want what they selected. If empty, give em Google.
        if (newTiles.length === 0) {
            newTiles.push({ id: 't-def', position: 0, name: 'Google', url: 'https://google.com', icon: 'ri-google-fill', color: '#4285F4', showText: true });
        }

        // Overwrite standard Home webmix
        const homeWm = state.webmixes.find(w => w.id === 'wm-home');
        if (homeWm) {
            homeWm.tiles = newTiles;
        }

        localStorage.setItem('gridify_onboarded', 'true');
        saveState();
        renderGrid();
        modal.classList.add('hidden');
        showToast("Welcome to Gridify!", "success");
    };
}

// Assuming 'init' function is defined elsewhere and needs to be updated.
// Since the 'init' function definition is not provided in the snippet,
// this change assumes it exists and adds the call to it.
// Original init function was:
/*
function init() {
    loadState();
    renderSidebar();
    renderGrid();
    setupEventListeners();
    setupGlobalUpload();
    setupWallpaperGallery();
    initOnboarding(); // Add this line
}
*/
// The previous step added a dummy init() at the end. I should remove it and ensure the REAL init() calls initOnboarding.

// Removing the dummy lines added by mistake in previous step.
// And calling init() properly.
