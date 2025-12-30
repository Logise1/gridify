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
                { id: 't-google', category: 'Productividad y Herramientas', name: 'Google', url: 'https://google.com', icon: 'ri-google-fill', color: '#4285F4', showText: true },
                { id: 't-gmail', category: 'Productividad y Herramientas', name: 'Gmail', url: 'https://mail.google.com', icon: 'ri-mail-fill', color: '#EA4335', showText: true },
                { id: 't-youtube', category: 'Música y Video', name: 'YouTube', url: 'https://youtube.com', icon: 'ri-youtube-fill', color: '#FF0000', showText: true },
                { id: 't-spotify', category: 'Música y Video', name: 'Spotify', url: 'https://open.spotify.com', icon: 'ri-spotify-fill', color: '#1DB954', showText: true },
                { id: 't-netflix', category: 'Streaming & TV', name: 'Netflix', url: 'https://netflix.com', icon: 'ri-movie-2-fill', color: '#E50914', showText: true },
                { id: 't-prime', category: 'Streaming & TV', name: 'Prime Video', url: 'https://primevideo.com', icon: 'ri-video-fill', color: '#00A8E1', showText: true },
                { id: 't-twitter', category: 'Redes Sociales', name: 'Twitter', url: 'https://twitter.com', icon: 'ri-twitter-x-fill', color: '#000000', showText: true },
                { id: 't-chatgpt', category: 'Inteligencia Artificial', name: 'ChatGPT', url: 'https://chat.openai.com', icon: 'ri-openai-fill', color: '#10A37F', showText: true }
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
    checkIncomingApps(); // Check apps before rendering
    renderSidebar();
    renderGrid();
    setupEventListeners();
    setupGlobalUpload();
    setupWallpaperGallery();
    initOnboarding();
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
        const catTiles = categories[catName] || [];
        if (catTiles.length === 0) return; // Hide empty categories? User wants categories visible. Or maybe only if inhabited. usually only inhabited.

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

            // Theme Logic
            let displayColor = tileData.color; // Brand

            // 1. Force Category Color (Requested behavior: "Apps de la categoria sea todos el mismo")
            // This becomes the new "Original/Default" look.
            if (tileData.category && categoryColors[tileData.category]) {
                displayColor = categoryColors[tileData.category];
            }

            // 2. Override if a specific GLOBAL MONO theme is set (e.g. "White", "Purple")
            // If themeColor is 'original' or null, we keep the Category Color set above.
            if (state.settings.themeColor && state.settings.themeColor !== 'original') {
                displayColor = state.settings.themeColor;
            }

            // Calculate Background: "Tonos del fondo" (Glass tint of the displayColor)
            let rgbaBg = hexToRgba(displayColor, 0.2); // Saturated glass
            tileEl.style.borderColor = hexToRgba(displayColor, 0.3);
            tileEl.style.backgroundColor = rgbaBg;

            tileEl.innerHTML = `<div class="tile-icon"><i class="${tileData.icon}" style="color: ${displayColor}"></i></div>`;
            tileEl.title = tileData.name; // Tooltip since name is hidden

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
                });

                saveState();
                renderGrid(); // explicit re-render
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
init();
