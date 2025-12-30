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
            widgets: [],
            tiles: [
                { id: 't-google', category: 'Productividad y Herramientas', name: 'Google', url: 'https://google.com', icon: 'https://cdn.simpleicons.org/google', color: '#4285F4', showText: true },
                { id: 't-gmail', category: 'Productividad y Herramientas', name: 'Gmail', url: 'https://mail.google.com', icon: 'https://cdn.simpleicons.org/gmail', color: '#EA4335', showText: true },
                { id: 't-youtube', category: 'Música y Video', name: 'YouTube', url: 'https://youtube.com', icon: 'https://cdn.simpleicons.org/youtube', color: '#FF0000', showText: true },
                { id: 't-spotify', category: 'Música y Video', name: 'Spotify', url: 'https://open.spotify.com', icon: 'https://cdn.simpleicons.org/spotify', color: '#1DB954', showText: true },
                { id: 't-netflix', category: 'Streaming & TV', name: 'Netflix', url: 'https://netflix.com', icon: 'https://cdn.simpleicons.org/netflix', color: '#E50914', showText: true },
                { id: 't-prime', category: 'Streaming & TV', name: 'Prime Video', url: 'https://primevideo.com', icon: 'logos/primevideo.svg', color: '#00A8E1', showText: true },
                { id: 't-twitter', category: 'Redes Sociales', name: 'Twitter', url: 'https://twitter.com', icon: 'https://cdn.simpleicons.org/x', color: '#000000', showText: true },
                { id: 't-chatgpt', category: 'Inteligencia Artificial', name: 'ChatGPT', url: 'https://chat.openai.com', icon: 'https://cdn.simpleicons.org/openai', color: '#10A37F', showText: true }
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
let widgetIntervals = []; // For tracking widget update intervals

// Initialization
// Initialization
// (init moved to after loadState)

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
            if (!wm.widgets) wm.widgets = [];
        });

    } else {
        Object.assign(state, JSON.parse(JSON.stringify(DEFAULT_DATA)));
    }
}

function init() {
    loadState();
    checkIncomingApps();
    renderSidebar();
    renderGrid();
    renderWidgets();
    setupEventListeners();
    setupGlobalUpload();
    setupWallpaperGallery();
    initOnboarding();
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

// Rendering Categories
function renderGrid() {
    gridContainer.innerHTML = '';
    const activeWebmix = getActiveWebmix();
    if (!activeWebmix) return;

    // Background
    const bg = activeWebmix.background || state.settings.backgroundImage || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop";
    backgroundOverlay.style.backgroundImage = `url('${bg}')`;

    // Group tiles by category
    const tiles = activeWebmix.tiles;
    const categories = {};

    // Default categories if missing in data
    const defaultCats = ["Productividad y Herramientas", "Streaming & TV", "Música y Video", "Redes Sociales", "Inteligencia Artificial", "Compras", "Otros"];

    // Helper to map old data or unassigned to categories
    tiles.forEach(t => {
        // Simple heuristic for legacy data or if category missing
        if (!t.category) {
            // Try to guess orput in 'Otros'?
            // For now, let's just put them in 'Productividad' or 'Otros'
            t.category = assignCategory(t);
        }

        if (!categories[t.category]) {
            categories[t.category] = [];
        }
        categories[t.category].push(t);
    });

    // Render Groups
    // Use fixed order + dynamic
    const catsToRender = [...new Set([...defaultCats, ...Object.keys(categories)])];

    catsToRender.forEach(catName => {
        if (catName === 'Widgets') return; // Do not render widgets in grid
        const catTiles = categories[catName] || [];
        if (catTiles.length === 0) return;

        const groupEl = document.createElement('div');
        groupEl.className = 'category-group';

        const headerEl = document.createElement('div');
        headerEl.className = 'category-header';
        headerEl.innerHTML = `<span>${catName}</span>`;
        groupEl.appendChild(headerEl);

        const tilesContainer = document.createElement('div');
        tilesContainer.className = 'category-tiles';

        catTiles.forEach(tileData => {
            const tileEl = document.createElement('div');
            tileEl.className = 'tile';

            // Category Color Mapping
            const categoryColors = {
                "Productividad y Herramientas": "#eeff00", // Blue
                "Streaming & TV": "#9900ff", // Purple
                "Música y Video": "#f72584", // Pink/Red
                "Redes Sociales": "#38eeff", // Industry Blue
                "Inteligencia Artificial": "#64ef48", // Light Blue
                "Compras": "#F77F00", // Orange
                "Otros": "#808080" // Gray
            };

            // Force Update Legacy Icons
            const iconMap = {
                // Streaming
                'Netflix': 'https://cdn.simpleicons.org/netflix',
                'HBO Max': 'https://cdn.simpleicons.org/hbomax',
                'Disney+': 'logos/disneyplus.svg',
                'Prime Video': 'logos/primevideo.svg',
                'Movistar+': 'logos/movistarplus.svg',
                // Productivity / Google
                'Google': 'https://cdn.simpleicons.org/google',
                'Gmail': 'https://cdn.simpleicons.org/gmail',
                'Google Drive': 'https://cdn.simpleicons.org/googledrive',
                'Google Calendar': 'logos/calendar.svg', // Local
                'Calendar': 'logos/calendar.svg', // Local
                'Google Docs': 'https://cdn.simpleicons.org/googledocs',
                'Slack': 'ri-slack-fill',
                'Trello': 'https://cdn.simpleicons.org/trello',
                'Notion': 'https://cdn.simpleicons.org/notion',
                'Zoom': 'https://cdn.simpleicons.org/zoom',
                'Microsoft Teams': 'https://cdn.simpleicons.org/microsoftteams',
                // Social
                'Whatsapp': 'https://cdn.simpleicons.org/whatsapp',
                'WhatsApp': 'https://cdn.simpleicons.org/whatsapp',
                'Instagram': 'https://cdn.simpleicons.org/instagram',
                'Facebook': 'https://cdn.simpleicons.org/facebook',
                'Twitter': 'https://cdn.simpleicons.org/x',
                'X': 'https://cdn.simpleicons.org/x',
                'LinkedIn': 'ri-linkedin-fill', // Reverted
                'Discord': 'https://cdn.simpleicons.org/discord',
                'Reddit': 'https://cdn.simpleicons.org/reddit',
                'TikTok': 'https://cdn.simpleicons.org/tiktok',
                'Pinterest': 'https://cdn.simpleicons.org/pinterest',
                'Telegram': 'https://cdn.simpleicons.org/telegram',
                // Music
                'Spotify': 'https://cdn.simpleicons.org/spotify',
                'SoundCloud': 'https://cdn.simpleicons.org/soundcloud',
                'Twitch': 'https://cdn.simpleicons.org/twitch',
                // Shopping
                'Amazon': 'logos/amazon.svg', // Local
                'AliExpress': 'https://cdn.simpleicons.org/aliexpress',
                'eBay': 'https://cdn.simpleicons.org/ebay',
                'Temu': 'logos/temu.svg' // Local
            };
            if (iconMap[tileData.name] && !tileData.icon.startsWith('http') && !tileData.icon.startsWith('logos/')) {
                tileData.icon = iconMap[tileData.name];
            }
            // Also force update if it WAS a bad URL previously (e.g. 404 cdn)
            // Logic: if mapped, just overwrite to be safe?
            // "he metido esto" implies they want the local file used.
            if (iconMap[tileData.name]) {
                tileData.icon = iconMap[tileData.name];
            }

            // Theme Logic
            let displayColor = tileData.color || '#fff'; // Default

            // 1. Force Category Color (Restored)
            if (tileData.category && categoryColors[tileData.category]) {
                displayColor = categoryColors[tileData.category];
            }

            // 2. Override if a specific GLOBAL MONO theme is set
            if (state.settings.themeColor && state.settings.themeColor !== 'original') {
                displayColor = state.settings.themeColor;
            }

            // Calculate Background: "Tonos del fondo"
            // Outlook should be more visible (higher opacity)
            let bgOpacity = (tileData.name === 'Outlook') ? 0.35 : 0.2;
            let rgbaBg = hexToRgba(displayColor, bgOpacity);
            tileEl.style.borderColor = hexToRgba(displayColor, 0.3);
            tileEl.style.backgroundColor = rgbaBg;

            // Icon Rendering: Font vs SVG Mask
            // Special handling for Outlook (transparent logo)
            if (tileData.name === 'Outlook' && tileData.icon === 'logos/outlook.svg') {
                tileEl.innerHTML = `<div class="tile-icon" style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;"><img src="${tileData.icon}" style="width: 100%; height: 100%; object-fit: contain;"></div>`;
            } else if (tileData.icon.startsWith('http') || tileData.icon.includes('simpleicons') || tileData.icon.startsWith('logos/')) {
                tileEl.innerHTML = `<div class="tile-icon" style="background-color: ${displayColor}; -webkit-mask: url('${tileData.icon}') no-repeat center / contain; mask: url('${tileData.icon}') no-repeat center / contain; width: 48px; height: 48px;"></div>`;
            } else {
                tileEl.innerHTML = `<div class="tile-icon"><i class="${tileData.icon}" style="color: ${displayColor}"></i></div>`;
            }
            tileEl.title = tileData.name;

            tileEl.onclick = (e) => window.open(tileData.url, '_blank');
            tileEl.oncontextmenu = (e) => {
                e.preventDefault();
                showConfirm("¿Borrar " + tileData.name + "?", () => {
                    activeWebmix.tiles = activeWebmix.tiles.filter(t => t.id !== tileData.id);
                    saveState();
                    renderGrid();
                    showToast("App borrada", "success");

                    if (activeWebmix.tiles.length === 0) {
                        // All apps deleted, redirect to catalog
                        openAppCatalog(null, true);
                    }
                });
            };

            // Basic drag events (stubbed for now as grid pos is gone, reordering would need list logic)
            // tileEl.setAttribute('draggable', true);

            tilesContainer.appendChild(tileEl);
        });

        groupEl.appendChild(tilesContainer);
        gridContainer.appendChild(groupEl);
    });
}

function assignCategory(tile) {
    // Basic mapping for migration
    const n = tile.name.toLowerCase();
    if (n.includes('google') || n.includes('mail') || n.includes('drive') || n.includes('whatsapp') || n.includes('slack')) return 'Productividad y Herramientas';
    if (n.includes('netflix') || n.includes('disney') || n.includes('hbo') || n.includes('movistar') || n.includes('prime')) return 'Streaming & TV';
    if (n.includes('youtube') || n.includes('spotify') || n.includes('twitch') || n.includes('music')) return 'Música y Video';
    if (n.includes('twitter') || n.includes('facebook') || n.includes('instagram') || n.includes('linkedin') || n.includes('reddit') || n.includes('discord')) return 'Redes Sociales';
    if (n.includes('gpt') || n.includes('ai') || n.includes('midjourney') || n.includes('gemini')) return 'Inteligencia Artificial';
    if (n.includes('amazon') || n.includes('ebay') || n.includes('shop')) return 'Compras';
    return 'Otros';
}

function hexToRgba(hex, alpha) {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length === 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
    }
    return 'rgba(255,255,255,0.1)'; // Fallback
}

// Logic
function switchWebmix(id) {
    state.activeWebmixId = id;
    renderSidebar();
    renderGrid();
    renderWidgets(); // Update widgets when switching webmix
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
    let hex = color.replace('#', '');
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq < 128; // Standard threshold
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
    const addAppBtn = document.getElementById('add-app-btn');
    if (addAppBtn) {
        addAppBtn.onclick = () => openAppCatalog(null, false);
    }
    // document.getElementById('add-webmix-btn').onclick = createNewWebmix; // Removed
    saveBtn.onclick = saveTile;
    deleteBtn.onclick = deleteTile;
    // Theme Selection
    window.selectTheme = function (color) {
        state.settings.tempTheme = color;
        document.querySelectorAll('.theme-option').forEach(opt => {
            if (opt.dataset.color === color) opt.classList.add('selected'), opt.style.border = '2px solid white';
            else opt.classList.remove('selected'), opt.style.border = '1px solid #555';
        });
    };

    saveSettingsBtn.onclick = () => {
        state.settings.backgroundImage = bgUrlInput.value;
        if (state.settings.tempTheme) {
            state.settings.themeColor = state.settings.tempTheme;
            delete state.settings.tempTheme;
        }
        saveState();
        renderGrid();
        settingsModal.classList.add('hidden');
        showToast("Settings saved!", "success");
    };

    // ... existing code ...

    settingsBtn.onclick = () => {
        bgUrlInput.value = state.settings.backgroundImage || '';
        // Set active theme UI
        const currentTheme = state.settings.themeColor || 'original';
        selectTheme(currentTheme);
        settingsModal.classList.remove('hidden');
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
    const calcResult = document.getElementById('calc-result');

    // Inline calculator in search bar
    const evaluateExpression = (expr) => {
        try {
            // Only allow numbers, operators, parentheses, spaces, and decimal points
            if (!/^[\d+\-*/().\s]+$/.test(expr)) return null;

            // Use Function constructor as safer eval alternative
            const result = Function('"use strict"; return (' + expr + ')')();

            if (typeof result === 'number' && !isNaN(result)) {
                return result;
            }
            return null;
        } catch (e) {
            return null;
        }
    };

    searchInput.oninput = () => {
        const value = searchInput.value.trim();
        const result = evaluateExpression(value);

        if (result !== null) {
            calcResult.textContent = `= ${result}`;
            calcResult.style.opacity = '1';
        } else {
            calcResult.textContent = '';
            calcResult.style.opacity = '0';
        }
    };

    const doSearch = () => {
        if (searchInput.value) {
            // If it's a calculation, just clear the input
            const result = evaluateExpression(searchInput.value.trim());
            if (result !== null) {
                searchInput.value = result.toString();
                calcResult.textContent = '';
            } else {
                window.open(`https://www.google.com/search?q=${encodeURIComponent(searchInput.value)}`, '_blank');
            }
        }
    };

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
// App Catalog with Categories
const recommendedPlatforms = [
    {
        category: "Search & Social",
        apps: [
            { name: 'Google', url: 'https://google.com', icon: 'ri-google-fill', color: '#4285F4' },
            { name: 'Bing', url: 'https://bing.com', icon: 'ri-search-eye-line', color: '#008373' },
            { name: 'Twitter', url: 'https://twitter.com', icon: 'ri-twitter-x-fill', color: '#000000' },
            { name: 'Instagram', url: 'https://instagram.com', icon: 'ri-instagram-fill', color: '#E1306C' },
            { name: 'Facebook', url: 'https://facebook.com', icon: 'ri-facebook-fill', color: '#1877F2' },
            { name: 'LinkedIn', url: 'https://linkedin.com', icon: 'ri-linkedin-fill', color: '#0077B5' },
            { name: 'Pinterest', url: 'https://pinterest.com', icon: 'ri-pinterest-fill', color: '#BD081C' },
            { name: 'TikTok', url: 'https://tiktok.com', icon: 'ri-video-chat-line', color: '#000000' },
            { name: 'Snapchat', url: 'https://snapchat.com', icon: 'ri-snapchat-fill', color: '#FFFC00' }
        ]
    },
    {
        category: "Entertainment",
        apps: [
            { name: 'YouTube', url: 'https://youtube.com', icon: 'ri-youtube-fill', color: '#FF0000' },
            { name: 'Netflix', url: 'https://netflix.com', icon: 'ri-movie-2-fill', color: '#E50914' },
            { name: 'Spotify', url: 'https://open.spotify.com', icon: 'ri-spotify-fill', color: '#1DB954' },
            { name: 'Twitch', url: 'https://twitch.tv', icon: 'ri-twitch-fill', color: '#9146FF' },
            { name: 'Disney+', url: 'https://disneyplus.com', icon: 'ri-mv-fill', color: '#113CCF' },
            { name: 'Prime Video', url: 'https://primevideo.com', icon: 'ri-video-fill', color: '#00A8E1' },
            { name: 'SoundCloud', url: 'https://soundcloud.com', icon: 'ri-soundcloud-fill', color: '#FF5500' }
        ]
    },
    {
        category: "Productivity & Tools",
        apps: [
            { name: 'Gmail', url: 'https://mail.google.com', icon: 'ri-mail-fill', color: '#EA4335' },
            { name: 'Outlook', url: 'https://outlook.com', icon: 'ri-mail-send-fill', color: '#0078D4' },
            { name: 'Drive', url: 'https://drive.google.com', icon: 'ri-hard-drive-2-fill', color: '#1FA463' },
            { name: 'ChatGPT', url: 'https://chat.openai.com', icon: 'ri-openai-fill', color: '#10A37F' },
            { name: 'GitHub', url: 'https://github.com', icon: 'ri-github-fill', color: '#181717' },
            { name: 'Slack', url: 'https://slack.com', icon: 'ri-slack-fill', color: '#4A154B' },
            { name: 'Trello', url: 'https://trello.com', icon: 'ri-kanban-view', color: '#0079BF' },
            { name: 'Canva', url: 'https://canva.com', icon: 'ri-brush-fill', color: '#00C4CC' },
            { name: 'Dropbox', url: 'https://dropbox.com', icon: 'ri-dropbox-fill', color: '#0061FF' }
        ]
    },
    {
        category: "News & Shopping",
        apps: [
            { name: 'Amazon', url: 'https://amazon.com', icon: 'ri-shopping-cart-fill', color: '#FF9900' },
            { name: 'Reddit', url: 'https://reddit.com', icon: 'ri-reddit-fill', color: '#FF4500' },
            { name: 'eBay', url: 'https://ebay.com', icon: 'ri-shopping-bag-3-fill', color: '#E53238' },
            { name: 'AliExpress', url: 'https://aliexpress.com', icon: 'ri-shopping-bag-fill', color: '#FF4747' },
            { name: 'CNN', url: 'https://cnn.com', icon: 'ri-newspaper-fill', color: '#CC0000' },
            { name: 'BBC', url: 'https://bbc.com', icon: 'ri-article-fill', color: '#BB1919' },
            { name: 'Wikipedia', url: 'https://wikipedia.org', icon: 'ri-book-open-fill', color: '#000000' }
        ]
    }
];

let onboardingSelected = new Set();
let onboardingTargetPos = null;
let isOnboardingMode = false;

function initOnboarding() {
    // Check if run before
    if (localStorage.getItem('gridify_onboarded')) return;
    openAppCatalog(null, true);
}

// App Catalog Redirection
function openAppCatalog(targetPos, isOnboarding = false) {
    if (isOnboarding) {
        localStorage.removeItem('gridify_onboarded'); // Clear flag so catalog knows? 
        // Actually, catalog logic is standalone. 
        // We just redirect.
    }
    // Store target pos if needed, though catalog pushes to end usually.
    // If specific pos, maybe store in LS?
    if (targetPos !== null) {
        localStorage.setItem('glim_target_pos', targetPos);
    } else {
        localStorage.removeItem('glim_target_pos');
    }

    if (isOnboarding) {
        window.location.href = 'catalog.html?onboarding=true';
    } else {
        window.location.href = 'catalog.html';
    }
}

function checkIncomingApps() {
    const newAppsJson = localStorage.getItem('glim_new_apps');
    if (newAppsJson) {
        try {
            const newApps = JSON.parse(newAppsJson);
            if (newApps.length > 0) {
                const activeWebmix = getActiveWebmix();

                // If this is the FIRST run (onboarding finish), CLEAR default tiles.
                // We check if 'gridify_onboarded' is NOT set yet.
                // However, initOnboarding sets it? No, initOnboarding redirects.
                // The redirected page sends us back here.

                if (!localStorage.getItem('gridify_onboarded')) {
                    activeWebmix.tiles = []; // Clear defaults
                }

                // Check target pos
                let targetPos = parseInt(localStorage.getItem('glim_target_pos'));
                let pos = !isNaN(targetPos) ? targetPos : 0;

                // If appending (no specific target), find first empty from end? Or just fill holes?
                // Standard logic: fill holes starting from pos.

                newApps.forEach(p => {
                    // Check if this is a widget
                    if (p.type === 'widget') {
                        // Add to widgets
                        if (!activeWebmix.widgets) activeWebmix.widgets = [];

                        const widgetId = 'widget-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                        activeWebmix.widgets.push({
                            id: widgetId,
                            type: p.widgetType,
                            x: 100 + (activeWebmix.widgets.length * 30),
                            y: 150 + (activeWebmix.widgets.length * 30),
                            width: 250,
                            height: 200,
                            settings: {
                                symbol: p.symbol || 'AAPL'
                            }
                        });
                    } else {
                        // Add as regular tile
                        while (activeWebmix.tiles.some(t => t.position === pos)) {
                            pos++;
                        }

                        activeWebmix.tiles.push({
                            id: 't-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                            position: pos++,
                            name: p.name,
                            url: p.url,
                            icon: p.icon,
                            color: p.color,
                            showText: true,
                            category: p.category // Preservation of category
                        });
                    }
                });

                saveState();
                renderGrid(); // explicit re-render
                renderWidgets(); // Also render widgets!
                showToast(`${newApps.length} apps added from Catalog!`, 'success');
            }
        } catch (e) { console.error("Error processing new apps", e); }

        localStorage.removeItem('glim_new_apps');
        localStorage.removeItem('glim_target_pos');

        // Mark as onboarded
        if (!localStorage.getItem('gridify_onboarded')) {
            localStorage.setItem('gridify_onboarded', 'true');
        }
    }
}

function handleOnboardingFinish() {
    const modal = document.getElementById('onboarding-modal');
    const activeWebmix = getActiveWebmix();
    if (!activeWebmix.widgets) activeWebmix.widgets = [];

    // Build new tiles list
    const newTiles = [];
    let pos = isOnboardingMode ? 0 : (onboardingTargetPos !== null ? onboardingTargetPos : 0);

    onboardingSelected.forEach(p => {
        // Check availability if not onboarding
        if (!isOnboardingMode) {
            while (activeWebmix.tiles.some(t => t.position === pos)) {
                pos++;
            }
        }

        newTiles.push({
            id: 't-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            position: pos++,
            name: p.name,
            url: p.url,
            icon: p.icon,
            color: p.color,
            showText: true
        });
    });

    if (isOnboardingMode) {
        const homeWm = state.webmixes.find(w => w.id === 'wm-home');
        if (newTiles.length === 0) {
            newTiles.push({ id: 't-def', position: 0, name: 'Google', url: 'https://google.com', icon: 'ri-google-fill', color: '#4285F4', showText: true });
        }
        if (homeWm) {
            homeWm.tiles = newTiles;
        }
        localStorage.setItem('gridify_onboarded', 'true');
        showToast("Welcome to Gridify!", "success");
    } else {
        if (newTiles.length > 0) {
            activeWebmix.tiles = [...activeWebmix.tiles, ...newTiles];
            showToast(`${newTiles.length} apps added.`, "success");
        }
    }

    saveState();
    renderGrid();
    modal.classList.add('hidden');
}

// Drag and Drop Logic
function dragStart(e, position) {
    e.dataTransfer.setData('text/plain', position);
    e.target.style.opacity = '0.4';
}

function drop(e, targetPosition) {
    e.preventDefault();
    const sourcePosition = parseInt(e.dataTransfer.getData('text/plain'));
    const activeWebmix = getActiveWebmix();

    const sourceTileIndex = activeWebmix.tiles.findIndex(t => t.position === sourcePosition);
    const targetTileIndex = activeWebmix.tiles.findIndex(t => t.position === targetPosition);

    if (sourceTileIndex !== -1) {
        // Move source tile to target position
        activeWebmix.tiles[sourceTileIndex].position = targetPosition;

        // If there was a tile at target, swap it to source position
        if (targetTileIndex !== -1) {
            activeWebmix.tiles[targetTileIndex].position = sourcePosition;
        }

        saveState();
        renderGrid();
    }
}

// Start the app
// WIDGETS SYSTEM

function renderWidgets() {
    console.log("DEBUG: renderWidgets called");
    // 1. Setup Layer
    let layer = document.getElementById('widget-layer');
    if (!layer) {
        console.log("DEBUG: Creating widget-layer");
        layer = document.createElement('div');
        layer.id = 'widget-layer';
        document.body.appendChild(layer);
    }
    layer.innerHTML = '';

    // Clear old intervals
    widgetIntervals.forEach(clearInterval);
    widgetIntervals = [];

    const activeWebmix = getActiveWebmix();
    console.log('DEBUG: Active WM', activeWebmix ? activeWebmix.id : 'None');
    console.log('DEBUG: Widgets list', activeWebmix ? activeWebmix.widgets : 'N/A');

    if (!activeWebmix || !activeWebmix.widgets) return;

    activeWebmix.widgets.forEach(w => {
        const el = document.createElement('div');
        el.className = 'widget-box';
        el.id = w.id;
        el.style.left = w.x + 'px';
        el.style.top = w.y + 'px';
        el.style.width = w.width + 'px';
        el.style.height = w.height + 'px';

        // Initial Content
        el.innerHTML = `
            <div class="widget-header">
                ${w.type}
            </div>
            <div class="widget-content" id="content-${w.id}">Loading...</div>
            <div class="widget-resize-handle"></div>
        `;

        // Drag Logic
        const headerDrag = el.querySelector('.widget-header');
        headerDrag.onmousedown = (e) => {
            e.preventDefault();
            let startX = e.clientX;
            let startY = e.clientY;
            let startLeft = parseFloat(el.style.left) || 0;
            let startTop = parseFloat(el.style.top) || 0;

            document.onmousemove = (me) => {
                const dx = me.clientX - startX;
                const dy = me.clientY - startY;
                el.style.left = (startLeft + dx) + 'px';
                el.style.top = (startTop + dy) + 'px';
            };

            document.onmouseup = () => {
                document.onmousemove = null;
                document.onmouseup = null;
                // Save
                w.x = parseFloat(el.style.left);
                w.y = parseFloat(el.style.top);
                saveState();
            };
        }

        // Resize Logic
        const resizer = el.querySelector('.widget-resize-handle');
        resizer.onmousedown = (e) => {
            e.preventDefault();
            e.stopPropagation(); // Stop drag from header if overlapping
            let startX = e.clientX;
            let startY = e.clientY;
            let startWidth = parseFloat(getComputedStyle(el).width);
            let startHeight = parseFloat(getComputedStyle(el).height);

            document.onmousemove = (me) => {
                const dx = me.clientX - startX;
                const dy = me.clientY - startY;
                el.style.width = (startWidth + dx) + 'px';
                el.style.height = (startHeight + dy) + 'px';

                // Trigger resize event for content adjustment
                const resizeEvent = new Event('widgetResize');
                el.dispatchEvent(resizeEvent);
            };

            document.onmouseup = () => {
                document.onmousemove = null;
                document.onmouseup = null;
                w.width = parseFloat(el.style.width);
                w.height = parseFloat(el.style.height);
                saveState();

                // Final resize event
                const resizeEvent = new Event('widgetResize');
                el.dispatchEvent(resizeEvent);
            };
        };

        // Context Menu (Delete)
        el.oncontextmenu = (e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent grid context mnu
            // Native confirm for simplicity or use custom
            if (confirm("Borrar Widget?")) {
                activeWebmix.widgets = activeWebmix.widgets.filter(wid => wid.id !== w.id);
                saveState();
                renderWidgets();
            }
        };

        layer.appendChild(el);

        // Populate Content - PREMIUM VERSIONS
        const contentBox = el.querySelector('.widget-content');
        const header = el.querySelector('.widget-header');

        // === CLOCK WIDGET (Digital) ===
        if (w.type === 'clock') {
            header.innerHTML = `<i class="ri-time-line" style="margin-right: 5px;"></i> Reloj & Fecha`;

            const update = () => {
                const now = new Date();
                const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const dateStr = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

                // Get widget width for responsive sizing
                const widgetWidth = parseFloat(el.style.width) || 250;
                const isCompact = widgetWidth < 220;
                const timeSize = isCompact ? '2rem' : '3.5rem';
                const dateSize = isCompact ? '0.7rem' : '0.95rem';

                contentBox.innerHTML = `
                    <div style="font-size: ${timeSize}; font-weight: 700; background: linear-gradient(135deg, #4CC9F0, #3A86FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: pulse 2s ease-in-out infinite;">
                        ${timeStr}
                    </div>
                    <div style="font-size: ${dateSize}; opacity: 0.7; text-transform: capitalize; margin-top: 10px;">
                        ${dateStr}
                    </div>
                `;
            };
            update();
            widgetIntervals.push(setInterval(update, 1000));

            // Listen for resize to update sizes
            el.addEventListener('widgetResize', update);
        }

        // === ANALOG CLOCK WIDGET ===
        if (w.type === 'analog-clock') {
            header.innerHTML = `<i class="ri-time-line" style="margin-right: 5px;"></i> Reloj Analógico`;

            const canvasId = `canvas-${w.id}`;
            contentBox.innerHTML = `<canvas id="${canvasId}" style="width: 100%; height: 100%;"></canvas>`;

            const drawClock = () => {
                const canvas = document.getElementById(canvasId);
                if (!canvas) return;

                const ctx = canvas.getContext('2d');
                const rect = contentBox.getBoundingClientRect();

                // Set canvas size to match container
                canvas.width = rect.width;
                canvas.height = rect.height;

                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const radius = Math.min(centerX, centerY) * 0.85;

                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw clock face
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(76, 201, 240, 0.1)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(76, 201, 240, 0.5)';
                ctx.lineWidth = 3;
                ctx.stroke();

                // Draw hour markers
                for (let i = 0; i < 12; i++) {
                    const angle = (i * 30 * Math.PI) / 180 - Math.PI / 2;
                    const x1 = centerX + Math.cos(angle) * radius * 0.85;
                    const y1 = centerY + Math.sin(angle) * radius * 0.85;
                    const x2 = centerX + Math.cos(angle) * radius * 0.95;
                    const y2 = centerY + Math.sin(angle) * radius * 0.95;

                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.strokeStyle = '#4CC9F0';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }

                // Draw minute markers
                for (let i = 0; i < 60; i++) {
                    if (i % 5 !== 0) {
                        const angle = (i * 6 * Math.PI) / 180 - Math.PI / 2;
                        const x1 = centerX + Math.cos(angle) * radius * 0.90;
                        const y1 = centerY + Math.sin(angle) * radius * 0.90;
                        const x2 = centerX + Math.cos(angle) * radius * 0.95;
                        const y2 = centerY + Math.sin(angle) * radius * 0.95;

                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.strokeStyle = 'rgba(76, 201, 240, 0.3)';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }

                // Get current time
                const now = new Date();
                const hours = now.getHours() % 12;
                const minutes = now.getMinutes();
                const seconds = now.getSeconds();

                // Draw hour hand
                const hourAngle = ((hours + minutes / 60) * 30 * Math.PI) / 180 - Math.PI / 2;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(
                    centerX + Math.cos(hourAngle) * radius * 0.5,
                    centerY + Math.sin(hourAngle) * radius * 0.5
                );
                ctx.strokeStyle = '#4CC9F0';
                ctx.lineWidth = 6;
                ctx.lineCap = 'round';
                ctx.stroke();

                // Draw minute hand
                const minuteAngle = ((minutes + seconds / 60) * 6 * Math.PI) / 180 - Math.PI / 2;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(
                    centerX + Math.cos(minuteAngle) * radius * 0.7,
                    centerY + Math.sin(minuteAngle) * radius * 0.7
                );
                ctx.strokeStyle = '#3A86FF';
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.stroke();

                // Draw second hand
                const secondAngle = (seconds * 6 * Math.PI) / 180 - Math.PI / 2;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(
                    centerX + Math.cos(secondAngle) * radius * 0.8,
                    centerY + Math.sin(secondAngle) * radius * 0.8
                );
                ctx.strokeStyle = '#FF6B6B';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.stroke();

                // Draw center dot
                ctx.beginPath();
                ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
                ctx.fillStyle = '#4CC9F0';
                ctx.fill();
            };

            // Initial draw
            setTimeout(drawClock, 100);

            // Update every second
            widgetIntervals.push(setInterval(drawClock, 1000));

            // Redraw on resize
            el.addEventListener('widgetResize', drawClock);
        }


        // === WEATHER WIDGET ===
        if (w.type === 'weather') {
            header.innerHTML = `<i class="ri-sun-cloudy-line" style="margin-right: 5px;"></i> Clima`;
            contentBox.innerHTML = `<i class="ri-loader-4-line" style="font-size: 2rem; animation: spin 1s linear infinite;"></i>`;

            let weatherData = null; // Cache weather data

            const renderWeather = () => {
                if (!weatherData) return;

                const { temp, weatherCode, dailyData } = weatherData;

                // Get widget size for responsive design
                const widgetWidth = parseFloat(el.style.width) || 250;
                const isCompact = widgetWidth < 250;

                const iconSize = isCompact ? '2rem' : '3rem';
                const tempSize = isCompact ? '1.5rem' : '2.2rem';
                const dayFontSize = isCompact ? '0.55rem' : '0.7rem';
                const dayIconSize = isCompact ? '1rem' : '1.3rem';
                const dayTempSize = isCompact ? '0.7rem' : '0.85rem';
                const marginBottom = isCompact ? '6px' : '12px';

                // Weather icons based on code
                let icon = 'ri-sun-line';
                let gradient = 'linear-gradient(135deg, #FFD700, #FFA500)';
                if (weatherCode > 50 && weatherCode < 70) { icon = 'ri-rainy-line'; gradient = 'linear-gradient(135deg, #4CC9F0, #3A86FF)'; }
                else if (weatherCode > 70) { icon = 'ri-snowy-line'; gradient = 'linear-gradient(135deg, #E0E0E0, #4CC9F0)'; }
                else if (weatherCode > 0) { icon = 'ri-cloudy-line'; gradient = 'linear-gradient(135deg, #A0A0A0, #606060)'; }

                // Forecast for 7 days horizontal
                const today = new Date();
                const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                const getWeatherIcon = (code) => {
                    if (code > 70) return 'ri-snowy-line';
                    if (code > 50) return 'ri-rainy-line';
                    if (code > 0) return 'ri-cloudy-line';
                    return 'ri-sun-line';
                };
                let forecastHTML = '';

                for (let i = 0; i < 7; i++) {
                    const futureDate = new Date(today);
                    futureDate.setDate(today.getDate() + i);
                    const dayName = i === 0 ? 'Hoy' : days[futureDate.getDay()];
                    const maxTemp = Math.round(dailyData.temperature_2m_max[i]);
                    const dayIcon = getWeatherIcon(dailyData.weathercode[i]);

                    forecastHTML += `
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; min-width: 0;">
                            <div style="font-size: ${dayFontSize}; opacity: 0.6; white-space: nowrap;">${dayName}</div>
                            <i class="${dayIcon}" style="font-size: ${dayIconSize}; opacity: 0.8;"></i>
                            <div style="font-size: ${dayTempSize}; font-weight: 600;">${maxTemp}°</div>
                        </div>
                    `;
                }

                contentBox.innerHTML = `
                    <div style="text-align: center; margin-bottom: ${marginBottom};">
                        <i class="${icon}" style="font-size: ${iconSize}; background: ${gradient}; -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i>
                        <div style="font-size: ${tempSize}; font-weight: 700; margin-top: 4px;">
                            ${temp}°C
                        </div>
                    </div>
                    <div style="display: flex; gap: 6px; width: 100%; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; margin-top: 10px; justify-content: space-between;">
                        ${forecastHTML}
                    </div>
                `;
            };

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(pos => {
                    const { latitude, longitude } = pos.coords;
                    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`)
                        .then(r => r.json())
                        .then(d => {
                            if (d.current_weather && d.daily) {
                                weatherData = {
                                    temp: Math.round(d.current_weather.temperature),
                                    weatherCode: d.current_weather.weathercode,
                                    dailyData: d.daily
                                };
                                renderWeather();
                            } else {
                                contentBox.innerHTML = `<div style="opacity: 0.5;">⚠️ No disponible</div>`;
                            }
                        })
                        .catch(() => contentBox.innerHTML = `<div style="opacity: 0.5;">⚠️ Error de conexión</div>`);
                }, () => {
                    contentBox.innerHTML = `<div style="opacity: 0.7; text-align: center; padding: 20px;">📍 Se requiere permiso de ubicación</div>`;
                });
            } else {
                contentBox.innerHTML = `<div style="opacity: 0.5;">Geolocalización no soportada</div>`;
            }

            // Listen for resize events
            el.addEventListener('widgetResize', renderWeather);
        }

        // === STOCK/MARKETS WIDGET ===
        if (w.type === 'stock') {
            header.innerHTML = `<i class="ri-stock-line" style="margin-right: 5px;"></i> Mercados`;

            // Initialize symbols from settings or use defaults
            if (!w.settings) w.settings = {};
            if (!w.settings.symbols) w.settings.symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA'];

            const symbols = w.settings.symbols;
            let cachedResults = null; // Cache for API results

            // Right-click context menu for configuration
            el.oncontextmenu = (e) => {
                e.preventDefault();
                e.stopPropagation();

                const currentSymbols = w.settings.symbols.join(', ');
                const newSymbols = prompt('Ingresa los símbolos de acciones separados por comas:\n(Ejemplo: AAPL, GOOGL, MSFT)', currentSymbols);

                if (newSymbols !== null && newSymbols.trim() !== '') {
                    // Parse and clean symbols
                    w.settings.symbols = newSymbols.split(',').map(s => s.trim().toUpperCase()).filter(s => s.length > 0);
                    saveState();
                    renderWidgets(); // Re-render to show new symbols
                }
            };

            // Function to render HTML from cached data (NO API CALL)
            const renderStockHTML = (results) => {
                if (!results) return;

                // Get widget width to determine sizing
                const widgetWidth = parseFloat(el.style.width) || 250;
                const isCompact = widgetWidth < 220;

                // Responsive font sizes
                const symbolSize = isCompact ? '0.75rem' : '0.9rem';
                const priceSize = isCompact ? '0.65rem' : '0.75rem';
                const changeSize = isCompact ? '0.7rem' : '0.85rem';
                const padding = isCompact ? '4px 6px' : '6px 8px';
                const gap = isCompact ? '4px' : '8px';

                let html = `<div style="display: flex; flex-direction: column; gap: ${gap}; width: 100%; overflow: hidden;">`;

                results.forEach((data, index) => {
                    if (data && data.results && data.results[symbols[index]]) {
                        const stockData = data.results[symbols[index]];
                        const timeSeries = stockData["Time Series"];
                        const dates = Object.keys(timeSeries).sort((a, b) => new Date(b) - new Date(a));

                        if (dates.length >= 2) {
                            const latest = timeSeries[dates[0]];
                            const previous = timeSeries[dates[1]];
                            const price = latest["4. close"];
                            const prevPrice = previous["4. close"];
                            const change = ((price - prevPrice) / prevPrice * 100);
                            const isPositive = change >= 0;
                            const color = isPositive ? '#10B981' : '#EF4444';
                            const arrow = isPositive ? '▲' : '▼';

                            html += `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: ${padding}; background: rgba(255,255,255,0.03); border-radius: 8px; border-left: 3px solid ${color}; min-width: 0;">
                                    <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1;">
                                        <div style="font-weight: 700; font-size: ${symbolSize}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${symbols[index]}</div>
                                        <div style="font-size: ${priceSize}; opacity: 0.6; white-space: nowrap;">$${parseFloat(price).toFixed(2)}</div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 4px; color: ${color}; font-weight: 600; font-size: ${changeSize}; white-space: nowrap;">
                                        <span>${arrow}</span>
                                        <span>${Math.abs(change).toFixed(2)}%</span>
                                    </div>
                                </div>
                            `;
                        }
                    } else {
                        // Show error for failed symbols
                        html += `
                            <div style="display: flex; align-items: center; padding: ${padding}; background: rgba(255,255,255,0.03); border-radius: 8px; border-left: 3px solid #EF4444; opacity: 0.5;">
                                <div style="font-size: ${symbolSize};">${symbols[index]} - Error</div>
                            </div>
                        `;
                    }
                });

                html += '</div>';
                contentBox.innerHTML = html;
            };

            // Initial data fetch (ONLY ONCE)
            contentBox.innerHTML = `<i class="ri-loader-4-line" style="font-size: 2rem; animation: spin 1s linear infinite;"></i>`;

            Promise.all(symbols.map(symbol =>
                fetch(`https://finances.logise1123.workers.dev/history?symbol=${symbol}`)
                    .then(r => r.json())
                    .catch(() => null)
            )).then(results => {
                cachedResults = results; // Cache the results
                renderStockHTML(results);
            }).catch(() => {
                contentBox.innerHTML = `<div style="opacity: 0.5;">⚠️ Error de API</div>`;
            });

            // Listen for resize events to adapt layout (WITHOUT re-fetching)
            el.addEventListener('widgetResize', () => {
                if (cachedResults) {
                    renderStockHTML(cachedResults);
                }
            });
        }


        // === CALCULATOR WIDGET ===
        if (w.type === 'calculator') {
            header.innerHTML = `<i class="ri-calculator-line" style="margin-right: 5px;"></i> Calculadora`;

            let display = '0';
            let operation = null;
            let previousValue = null;

            const updateDisplay = () => {
                const displayEl = contentBox.querySelector('.calc-display');
                if (displayEl) displayEl.textContent = display;
            };

            contentBox.innerHTML = `
                <div class="calc-display" style="font-size: 2rem; font-weight: 700; padding: 10px; background: rgba(139, 92, 246, 0.2); border-radius: 8px; text-align: right; margin-bottom: 10px; min-height: 50px; display: flex; align-items: center; justify-content: flex-end;">
                    ${display}
                </div>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
                    <button class="calc-btn" data-value="7">7</button>
                    <button class="calc-btn" data-value="8">8</button>
                    <button class="calc-btn" data-value="9">9</button>
                    <button class="calc-btn calc-op" data-value="/">÷</button>
                    <button class="calc-btn" data-value="4">4</button>
                    <button class="calc-btn" data-value="5">5</button>
                    <button class="calc-btn" data-value="6">6</button>
                    <button class="calc-btn calc-op" data-value="*">×</button>
                    <button class="calc-btn" data-value="1">1</button>
                    <button class="calc-btn" data-value="2">2</button>
                    <button class="calc-btn" data-value="3">3</button>
                    <button class="calc-btn calc-op" data-value="-">−</button>
                    <button class="calc-btn" data-value="0">0</button>
                    <button class="calc-btn" data-value=".">.</button>
                    <button class="calc-btn calc-op" data-value="=">=</button>
                    <button class="calc-btn calc-op" data-value="+">+</button>
                </div>
                <button class="calc-btn" data-value="C" style="margin-top: 8px; width: 100%; background: rgba(239, 68, 68, 0.3);">C</button>
            `;

            contentBox.querySelectorAll('.calc-btn').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    const val = btn.dataset.value;

                    if (val === 'C') {
                        display = '0';
                        operation = null;
                        previousValue = null;
                    } else if (['+', '-', '*', '/'].includes(val)) {
                        previousValue = parseFloat(display);
                        operation = val;
                        display = '0';
                    } else if (val === '=') {
                        if (operation && previousValue !== null) {
                            const current = parseFloat(display);
                            switch (operation) {
                                case '+': display = (previousValue + current).toString(); break;
                                case '-': display = (previousValue - current).toString(); break;
                                case '*': display = (previousValue * current).toString(); break;
                                case '/': display = current !== 0 ? (previousValue / current).toString() : 'Error'; break;
                            }
                            operation = null;
                            previousValue = null;
                        }
                    } else {
                        if (display === '0' && val !== '.') display = val;
                        else display += val;
                    }

                    updateDisplay();
                };
            });
        }

        // === NOTES WIDGET ===
        if (w.type === 'notes') {
            header.innerHTML = `<i class="ri-sticky-note-line" style="margin-right: 5px;"></i> Notas Rápidas`;

            const savedNotes = w.settings.notes || '';

            contentBox.innerHTML = `
                <textarea 
                    id="notes-${w.id}"
                    placeholder="Escribe aquí tus notas..."
                    style="
                        background: rgba(245, 158, 11, 0.1);
                        border: 1px solid rgba(245, 158, 11, 0.3);
                        border-radius: 8px;
                        color: white;
                        width: 100%;
                        height: 100%;
                        resize: none;
                        padding: 12px;
                        font-size: 0.95rem;
                        line-height: 1.5;
                        font-family: 'Outfit', sans-serif;
                        outline: none;
                    "
                >${savedNotes}</textarea>
            `;

            setTimeout(() => {
                const textarea = document.getElementById(`notes-${w.id}`);
                if (textarea) {
                    textarea.onclick = (e) => e.stopPropagation();
                    textarea.onchange = () => {
                        w.settings.notes = textarea.value;
                        saveState();
                    };
                }
            }, 100);
        }
    }); // End foreach
}

// Drag & Drop / Init
// ... (Make sure these run)
init();
