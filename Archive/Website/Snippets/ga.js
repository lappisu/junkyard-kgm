

// Code base by Zpayer
(function() {
    'use strict';
    function Log(level, ...args) {
        const levels = {
            NONE: "color: #35EA93;",
            ERROR: "color: #FF6E74;",
            WARN: "color: #FFB36A;",
            INFO: "color: #35EA93;",
            DEBUG: "color: #BE7CFF;",
            MESSAGE: "color: #56C4FF;",
            ALL: "color: #35EA93;",
        };
        console.log(`%c[${level}]`, levels[level], ...args);
    }

    function findBootstrapScript() {
        return [...document.head.querySelectorAll("script")].filter(l => l.innerHTML.includes("options.bootstrap"))[0]?.textContent;
    }

    function parsePageData() {
        try {
            const body = findBootstrapScript();
            const firstIndex = body.indexOf("options.bootstrap = {") + 20;
            const lastIndex = body.indexOf("};", firstIndex) + 1;
            const data = body.substring(firstIndex, lastIndex);
            return JSON.parse(data);
        } catch {
            return null;
        }
    }

    async function BuyAvatar(id) {
        Log("DEBUG", "/model/market/a-" + id + "/purchase/");
        return await fetch("/model/market/a-" + id + "/purchase/", {
            "headers": {
                "accept": "application/json, text/plain, */*",
            },
            "body": null,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
    }

    async function GetCurrentUserData(id) {
        Log("DEBUG", "/user/" + id + "/");
        let res = await fetch("/user/" + id + "/");
        return await res.json();
    }

    async function GetAvatars(data) {
        let res = await fetch(`/model/market/?page=${data.page}&count=${data.count}&category=avatar&orderBy=created&author_profile_id=${data.author_profile_id}`);
        let json = await res.json();
        return json.data;
    }

    let modalState = {
        isDragging: false,
        currentX: 0,
        currentY: 0,
        initialX: 0,
        initialY: 0,
        xOffset: 0,
        yOffset: 0,
        avatarList: [],
        selectedAvatars: new Set(),
        isRunning: false,
        currentInterval: null
    };

    function createModal() {
        const modal = document.createElement('div');
        modal.id = 'avatar-purchaser-modal';
        modal.innerHTML = `
            <div class="ap-header">
                <div class="ap-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="8" r="5"/>
                        <path d="M20 21a8 8 0 1 0-16 0"/>
                    </svg>
                    <span>Avatar Purchaser</span>
                </div>
                <button class="ap-close" id="ap-close-btn">×</button>
            </div>
            <div class="ap-content">
                <div class="ap-input-section">
                    <div class="ap-input-group">
                        <label for="author-id">Author Profile ID</label>
                        <input type="text" id="author-id" placeholder="e.g., 5409310" />
                    </div>
                    <div class="ap-input-row">
                        <div class="ap-input-group">
                            <label for="start-index">Start From</label>
                            <input type="number" id="start-index" value="0" min="0" />
                        </div>
                        <div class="ap-input-group">
                            <label for="delay-time">Delay (ms)</label>
                            <input type="number" id="delay-time" value="30000" min="1000" step="1000" />
                        </div>
                    </div>
                    <button class="ap-btn ap-btn-primary" id="load-avatars-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Load Avatars
                    </button>
                </div>
                <div class="ap-avatars-section" id="avatars-section" style="display: none;">
                    <div class="ap-controls">
                        <button class="ap-btn ap-btn-small" id="select-all-btn">Select All</button>
                        <button class="ap-btn ap-btn-small" id="deselect-all-btn">Deselect All</button>
                        <span class="ap-count" id="avatar-count">0 avatars loaded</span>
                    </div>
                    <div class="ap-avatar-grid" id="avatar-grid"></div>
                    <div class="ap-action-bar">
                        <button class="ap-btn ap-btn-success" id="start-purchase-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="5 3 19 12 5 21 5 3"/>
                            </svg>
                            Start Purchase
                        </button>
                        <button class="ap-btn ap-btn-danger" id="stop-purchase-btn" style="display: none;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="6" y="6" width="12" height="12"/>
                            </svg>
                            Stop
                        </button>
                    </div>
                </div>
                <div class="ap-status" id="status-message"></div>
            </div>
        `;

        document.body.appendChild(modal);
        attachStyles();
        attachEventListeners();
    }

    function attachStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            #avatar-purchaser-modal {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 720px;
                max-width: 90vw;
                max-height: 85vh;
                background: #1c1c1e;
                border: 1px solid #3a3a3c;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
                z-index: 999999;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                color: #e5e5e7;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .ap-header {
                background: linear-gradient(180deg, #2c2c2e 0%, #242426 100%);
                padding: 18px 24px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: move;
                border-bottom: 1px solid #3a3a3c;
            }

            .ap-title {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 18px;
                font-weight: 600;
                color: #f5c842;
                letter-spacing: -0.3px;
            }

            .ap-title svg {
                stroke: #f5c842;
                filter: drop-shadow(0 2px 4px rgba(245, 200, 66, 0.3));
            }

            .ap-close {
                background: transparent;
                border: none;
                color: #8e8e93;
                font-size: 24px;
                width: 32px;
                height: 32px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                line-height: 1;
                font-weight: 300;
            }

            .ap-close:hover {
                background: rgba(142, 142, 147, 0.15);
                color: #e5e5e7;
            }

            .ap-content {
                padding: 24px;
                overflow-y: auto;
                flex: 1;
                background: #1c1c1e;
            }

            .ap-content::-webkit-scrollbar {
                width: 8px;
            }

            .ap-content::-webkit-scrollbar-track {
                background: transparent;
            }

            .ap-content::-webkit-scrollbar-thumb {
                background: #3a3a3c;
                border-radius: 4px;
            }

            .ap-content::-webkit-scrollbar-thumb:hover {
                background: #48484a;
            }

            .ap-input-section {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .ap-input-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .ap-input-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }

            .ap-input-group label {
                font-size: 13px;
                font-weight: 500;
                color: #8e8e93;
                letter-spacing: -0.1px;
            }

            .ap-input-group input {
                background: #2c2c2e;
                border: 1px solid #3a3a3c;
                border-radius: 8px;
                padding: 10px 14px;
                color: #e5e5e7;
                font-size: 15px;
                font-family: inherit;
                transition: all 0.2s;
            }

            .ap-input-group input:focus {
                outline: none;
                border-color: #f5c842;
                background: #2c2c2e;
                box-shadow: 0 0 0 3px rgba(245, 200, 66, 0.1);
            }

            .ap-input-group input::placeholder {
                color: #636366;
            }

            .ap-btn {
                background: linear-gradient(180deg, #f5c842 0%, #e6b632 100%);
                border: none;
                color: #1c1c1e;
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                font-family: inherit;
                box-shadow: 0 2px 8px rgba(245, 200, 66, 0.25);
            }

            .ap-btn:hover {
                background: linear-gradient(180deg, #ffd24d 0%, #f5c842 100%);
                box-shadow: 0 4px 12px rgba(245, 200, 66, 0.35);
                transform: translateY(-1px);
            }

            .ap-btn:active {
                transform: translateY(0);
                box-shadow: 0 2px 6px rgba(245, 200, 66, 0.3);
            }

            .ap-btn svg {
                stroke: #1c1c1e;
            }

            .ap-btn-primary {
                background: linear-gradient(180deg, #f5c842 0%, #e6b632 100%);
            }

            .ap-btn-success {
                background: linear-gradient(180deg, #34c759 0%, #30b350 100%);
                color: #ffffff;
                box-shadow: 0 2px 8px rgba(52, 199, 89, 0.25);
            }

            .ap-btn-success:hover {
                background: linear-gradient(180deg, #40d465 0%, #34c759 100%);
                box-shadow: 0 4px 12px rgba(52, 199, 89, 0.35);
            }

            .ap-btn-success svg {
                stroke: #ffffff;
            }

            .ap-btn-danger {
                background: linear-gradient(180deg, #ff453a 0%, #e6342a 100%);
                color: #ffffff;
                box-shadow: 0 2px 8px rgba(255, 69, 58, 0.25);
            }

            .ap-btn-danger:hover {
                background: linear-gradient(180deg, #ff5a50 0%, #ff453a 100%);
                box-shadow: 0 4px 12px rgba(255, 69, 58, 0.35);
            }

            .ap-btn-danger svg {
                stroke: #ffffff;
            }

            .ap-btn-small {
                padding: 8px 14px;
                font-size: 13px;
            }

            .ap-avatars-section {
                margin-top: 24px;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .ap-controls {
                display: flex;
                gap: 12px;
                align-items: center;
                padding: 14px 16px;
                background: #2c2c2e;
                border: 1px solid #3a3a3c;
                border-radius: 8px;
            }

            .ap-count {
                margin-left: auto;
                font-size: 13px;
                color: #f5c842;
                font-weight: 500;
            }

            .ap-avatar-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 14px;
                max-height: 450px;
                overflow-y: auto;
                padding: 4px;
            }

            .ap-avatar-grid::-webkit-scrollbar {
                width: 8px;
            }

            .ap-avatar-grid::-webkit-scrollbar-track {
                background: transparent;
            }

            .ap-avatar-grid::-webkit-scrollbar-thumb {
                background: #3a3a3c;
                border-radius: 4px;
            }

            .ap-avatar-grid::-webkit-scrollbar-thumb:hover {
                background: #48484a;
            }

            .ap-avatar-item {
                position: relative;
                background: #2c2c2e;
                border: 2px solid transparent;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s;
                padding: 10px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                overflow: hidden;
            }

            .ap-avatar-item:hover {
                border-color: #f5c842;
                box-shadow: 0 4px 16px rgba(245, 200, 66, 0.2);
                transform: translateY(-2px);
            }

            .ap-avatar-item.selected {
                border-color: #34c759;
                background: linear-gradient(180deg, #2c2c2e 0%, #263328 100%);
                box-shadow: 0 4px 16px rgba(52, 199, 89, 0.3);
            }

            .ap-avatar-item .ap-avatar-img-container {
                width: 100%;
                position: relative;
                background: #1c1c1e;
                border-radius: 6px;
                overflow: hidden;
            }

            .ap-avatar-item img {
                width: 100%;
                height: auto;
                display: block;
                object-fit: contain;
            }

            .ap-avatar-item .ap-avatar-name {
                color: #e5e5e7;
                padding: 4px 0;
                font-size: 12px;
                font-weight: 500;
                text-align: center;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .ap-avatar-item .ap-avatar-price {
                position: absolute;
                top: 8px;
                left: 8px;
                background: rgba(28, 28, 30, 0.85);
                backdrop-filter: blur(10px);
                color: #f5c842;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 3px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(245, 200, 66, 0.2);
            }

            .ap-avatar-item .ap-avatar-price::before {
                content: '⚡';
                font-size: 11px;
            }

            .ap-avatar-item .ap-check {
                position: absolute;
                top: 8px;
                right: 8px;
                width: 24px;
                height: 24px;
                background: #34c759;
                border-radius: 50%;
                display: none;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(52, 199, 89, 0.5);
                border: 2px solid rgba(28, 28, 30, 0.5);
            }

            .ap-avatar-item.selected .ap-check {
                display: flex;
            }

            .ap-check svg {
                width: 14px;
                height: 14px;
                stroke: #ffffff;
                stroke-width: 3;
            }

            .ap-action-bar {
                display: flex;
                gap: 12px;
            }

            .ap-action-bar button {
                flex: 1;
            }

            .ap-status {
                margin-top: 16px;
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                text-align: center;
                display: none;
            }

            .ap-status.info {
                display: block;
                background: rgba(245, 200, 66, 0.1);
                border: 1px solid rgba(245, 200, 66, 0.3);
                color: #f5c842;
            }

            .ap-status.success {
                display: block;
                background: rgba(52, 199, 89, 0.1);
                border: 1px solid rgba(52, 199, 89, 0.3);
                color: #34c759;
            }

            .ap-status.error {
                display: block;
                background: rgba(255, 69, 58, 0.1);
                border: 1px solid rgba(255, 69, 58, 0.3);
                color: #ff453a;
            }

            .ap-toggle-btn {
                position: fixed;
                bottom: 24px;
                right: 24px;
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: linear-gradient(180deg, #f5c842 0%, #e6b632 100%);
                border: none;
                color: #1c1c1e;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(245, 200, 66, 0.4);
                transition: all 0.3s;
                z-index: 999998;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .ap-toggle-btn:hover {
                transform: translateY(-4px) scale(1.05);
                box-shadow: 0 8px 30px rgba(245, 200, 66, 0.5);
            }

            .ap-toggle-btn:active {
                transform: translateY(-2px) scale(1.02);
            }

            .ap-toggle-btn svg {
                width: 26px;
                height: 26px;
                stroke: #1c1c1e;
            }
        `;
        document.head.appendChild(style);
    }

    function attachEventListeners() {
        const modal = document.getElementById('avatar-purchaser-modal');
        const header = modal.querySelector('.ap-header');
        const closeBtn = document.getElementById('ap-close-btn');
        const loadBtn = document.getElementById('load-avatars-btn');
        const selectAllBtn = document.getElementById('select-all-btn');
        const deselectAllBtn = document.getElementById('deselect-all-btn');
        const startBtn = document.getElementById('start-purchase-btn');
        const stopBtn = document.getElementById('stop-purchase-btn');

        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        loadBtn.addEventListener('click', loadAvatars);
        selectAllBtn.addEventListener('click', () => {
            modalState.selectedAvatars.clear();
            modalState.avatarList.forEach(avatar => modalState.selectedAvatars.add(avatar.id));
            updateAvatarDisplay();
        });

        deselectAllBtn.addEventListener('click', () => {
            modalState.selectedAvatars.clear();
            updateAvatarDisplay();
        });
        startBtn.addEventListener('click', startPurchase);
        stopBtn.addEventListener('click', stopPurchase);
    }

    function dragStart(e) {
        modalState.initialX = e.clientX - modalState.xOffset;
        modalState.initialY = e.clientY - modalState.yOffset;

        if (e.target === e.currentTarget) {
            modalState.isDragging = true;
        }
    }

    function drag(e) {
        if (modalState.isDragging) {
            e.preventDefault();
            modalState.currentX = e.clientX - modalState.initialX;
            modalState.currentY = e.clientY - modalState.initialY;
            modalState.xOffset = modalState.currentX;
            modalState.yOffset = modalState.currentY;

            const modal = document.getElementById('avatar-purchaser-modal');
            modal.style.transform = `translate(calc(-50% + ${modalState.currentX}px), calc(-50% + ${modalState.currentY}px))`;
        }
    }

    function dragEnd(e) {
        modalState.isDragging = false;
    }

    async function loadAvatars() {
        const authorId = document.getElementById('author-id').value.trim();
        if (!authorId) {
            showStatus('Please enter an Author Profile ID', 'error');
            return;
        }

        showStatus('Loading avatars...', 'info');
        const loadBtn = document.getElementById('load-avatars-btn');
        loadBtn.disabled = true;
        loadBtn.style.opacity = '0.6';

        try {
            const avatars = await GetAvatars({
                author_profile_id: authorId,
                page: 1,
                count: 600
            });

            if (!avatars || avatars.length === 0) {
                showStatus('No avatars found for this author', 'error');
                loadBtn.disabled = false;
                loadBtn.style.opacity = '1';
                return;
            }

            modalState.avatarList = avatars;
            modalState.selectedAvatars.clear();
            avatars.forEach(avatar => modalState.selectedAvatars.add(avatar.id));

            document.getElementById('avatars-section').style.display = 'flex';
            document.getElementById('avatar-count').textContent = `${avatars.length} avatars loaded`;
            
            updateAvatarDisplay();
            showStatus(`Successfully loaded ${avatars.length} avatars!`, 'success');
        } catch (error) {
            Log('ERROR', error);
            showStatus('Failed to load avatars. Check console for details.', 'error');
        } finally {
            loadBtn.disabled = false;
            loadBtn.style.opacity = '1';
        }
    }

    function updateAvatarDisplay() {
        const grid = document.getElementById('avatar-grid');
        grid.innerHTML = '';

        modalState.avatarList.forEach((avatar, index) => {
            const item = document.createElement('div');
            item.className = `ap-avatar-item ${modalState.selectedAvatars.has(avatar.id) ? 'selected' : ''}`;
            const imageUrl = avatar.images?.large || avatar.image_large || 'https://via.placeholder.com/330x451?text=Avatar';
            const displayName = avatar.name || 'Unnamed Avatar';
            const price = avatar.price_gold || 0;
            
            item.innerHTML = `
                <div class="ap-avatar-img-container">
                    <img src="${imageUrl}" 
                         alt="${displayName}"
                         onerror="this.src='https://via.placeholder.com/330x451?text=Avatar'">
                    ${price > 0 ? `<div class="ap-avatar-price">${price}</div>` : ''}
                    <div class="ap-check">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                </div>
                <div class="ap-avatar-name" title="${displayName}">${displayName}</div>
            `;
            
            item.addEventListener('click', () => {
                if (modalState.selectedAvatars.has(avatar.id)) {
                    modalState.selectedAvatars.delete(avatar.id);
                    item.classList.remove('selected');
                } else {
                    modalState.selectedAvatars.add(avatar.id);
                    item.classList.add('selected');
                }
            });

            grid.appendChild(item);
        });
    }

    async function startPurchase() {
        if (modalState.isRunning) return;

        const pageData = parsePageData();
        if (!pageData) {
            showStatus('Could not find user data on this page', 'error');
            return;
        }

        const startIndex = parseInt(document.getElementById('start-index').value) || 0;
        const delay = parseInt(document.getElementById('delay-time').value) || 30000;
        const selectedIds = Array.from(modalState.selectedAvatars);

        if (selectedIds.length === 0) {
            showStatus('No avatars selected', 'error');
            return;
        }

        const gold = pageData.current_user.gold;
        const profileId = pageData.current_user.id;

        Log("INFO", `Starting purchase: ${selectedIds.length} avatars selected, starting from index ${startIndex}`);

        modalState.isRunning = true;
        document.getElementById('start-purchase-btn').style.display = 'none';
        document.getElementById('stop-purchase-btn').style.display = 'flex';

        let currentIndex = startIndex;

        async function purchaseNext() {
            if (!modalState.isRunning || currentIndex >= selectedIds.length) {
                stopPurchase();
                return;
            }

            const avatarId = selectedIds[currentIndex];
            showStatus(`Purchasing avatar ${currentIndex + 1}/${selectedIds.length}...`, 'info');

            try {
                await BuyAvatar(avatarId);
                const userData = await GetCurrentUserData(profileId);
                
                if (userData.data.gold < gold) {
                    showStatus('Gold decreased - stopping purchases', 'error');
                    stopPurchase();
                    return;
                }

                currentIndex++;
            } catch (error) {
                Log('ERROR', error);
                showStatus(`Error purchasing avatar: ${error.message}`, 'error');
            }
        }
        await purchaseNext();
        modalState.currentInterval = setInterval(purchaseNext, delay);
    }

    function stopPurchase() {
        modalState.isRunning = false;
        if (modalState.currentInterval) {
            clearInterval(modalState.currentInterval);
            modalState.currentInterval = null;
        }
        document.getElementById('start-purchase-btn').style.display = 'flex';
        document.getElementById('stop-purchase-btn').style.display = 'none';
        showStatus('Purchase stopped', 'info');
    }

    function showStatus(message, type) {
        const status = document.getElementById('status-message');
        status.textContent = message;
        status.className = `ap-status ${type}`;
    }
    function createToggleButton() {
        const btn = document.createElement('button');
        btn.className = 'ap-toggle-btn';
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="5"/>
                <path d="M20 21a8 8 0 1 0-16 0"/>
            </svg>
        `;
        btn.addEventListener('click', () => {
            const modal = document.getElementById('avatar-purchaser-modal');
            modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
        });
        document.body.appendChild(btn);
    }
    setTimeout(() => {
        createModal();
        createToggleButton();
        Log('INFO', 'Avatar Purchaser Pro loaded!');
    }, 1000);
})();
