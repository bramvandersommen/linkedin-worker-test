// ==UserScript==
// @name         OffhoursAI LinkedIn AI Commenter
// @namespace    https://offhoursai.com/
// @version      3.0
// @description  LinkedIn AI Post Commenter scraper with OffhoursAI branding.
// @match        https://www.linkedin.com/notifications/*
// @match        https://linkedin.com/notifications/*
// @match        *://www.linkedin.com/feed/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const targets = [document.documentElement, document.body];

    function isDarkTheme(element) {
        const bg = window.getComputedStyle(element).backgroundColor;
        if (!bg) return false;
        const rgb = bg.match(/\d+/g);
        if (!rgb || rgb.length < 3) return false;
        const [r, g, b] = rgb.map(Number);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
        return luminance < 128;
    }

    const darkDetected = targets.some(el => isDarkTheme(el));

    if (darkDetected) {
        const style = document.createElement("style");
        style.textContent = `body, html {background-color: #1c1c1c !important;}`;
        document.head.appendChild(style);
    }
    /**
 * LinkedIn AI Assistant - Unified Script
 * Handles: Notifications scraping, Post comment injection, Comment tracking
 * Version: 1.1.0 (Patched)
 */

    // ═════════════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═════════════════════════════════════════════════════════════════════════════

    const CONFIG = {
        WORKER_URL: 'https://bramvandersommen.github.io/linkedin-worker-test/linkedin_worker.html',
        N8N_TRACKER_WEBHOOK: 'https://your-n8n-instance.com/webhook/comment-tracker',
        VIP_LIST: [
            'Patrick Huijs',
            'Joshua van den Hemel',
            'https://www.linkedin.com/in/some-profile/'
        ]
    };

    // ═════════════════════════════════════════════════════════════════════════════
    // PAGE DETECTION
    // ═════════════════════════════════════════════════════════════════════════════

    const PAGE_TYPE = (() => {
        const path = window.location.pathname;
        const search = window.location.search;

        if (path.includes('/notifications')) return 'NOTIFICATIONS';
        if (path.includes('/feed/update/') || search.includes('highlightedUpdateUrn')) return 'POST';
        return 'OTHER';
    })();

    console.log(`[LinkedIn AI] Page type: ${PAGE_TYPE}`);

    // ═════════════════════════════════════════════════════════════════════════════
    // SHARED UTILITIES
    // ═════════════════════════════════════════════════════════════════════════════

    const Utils = {
        normalizeURL(url) {
            if (!url) return '';
            return url.toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
        },

        normalizeName(name) {
            if (!name) return '';
            return name.trim().toLowerCase();
        },

        randomPause(min = 800, max = 1500) {
            const ms = Math.random() * (max - min) + min;
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        extractPostID(url) {
            const match = url.match(/urn(?:%3A|:)li(?:%3A|:)activity(?:%3A|:)(\d+)/i);
            return match ? match[1] : null;
        },

        async trackComment(data) {
            try {
                await fetch(CONFIG.N8N_TRACKER_WEBHOOK, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        postID: data.postID,
                        vipName: data.vipName,
                        commentedAt: new Date().toISOString(),
                        draftUsed: data.draftIndex,
                        finalComment: data.finalComment,
                        manualEdits: data.manualEdits,
                        originalDraft: data.originalDraft
                    })
                });
                console.log('[LinkedIn AI] Comment tracked successfully');
            } catch (error) {
                console.warn('[LinkedIn AI] Failed to track comment:', error);
            }
        }
    };

    // ═════════════════════════════════════════════════════════════════════════════
    // NOTIFICATIONS PAGE - SCRAPER + ENHANCED UI
    // ═════════════════════════════════════════════════════════════════════════════

    if (PAGE_TYPE === 'NOTIFICATIONS') {

        let workerWindow = null;
        let statusOverlay = null;

        // ───────────────────────────────────────────────────────────────────────────
        // Particle Animation System (PATCH 1 APPLIED)
        // ───────────────────────────────────────────────────────────────────────────

        let particles = [];
        let particlesID = 0;
        const MAX_PARTICLES = 20;
        const EMIT_COUNT = 15;
        const GRAVITY = 0.1;
        const SPREAD = 5;

        function createParticles(container) {
            console.log('[LinkedIn AI] Creating particles in container:', container.id);

            // Create or get the particle wrapper (behind button with z-index: -1)
            let wrapper = container.querySelector('.particle-wrapper');
            if (!wrapper) {
                wrapper = document.createElement('div');
                wrapper.className = 'particle-wrapper';
                wrapper.style.cssText = 'position:absolute;inset:0;z-index:0;pointer-events:none;overflow:visible;';
                container.insertBefore(wrapper, container.firstChild);
                console.log('[LinkedIn AI] Created particle wrapper');
            }

            function rand(min, max) {
                return Math.random() * (max - min + 1) + min;
            }

            function emit() {
                if (particles.length < MAX_PARTICLES) {
                    particles.push({
                        id: particlesID,
                        x: 0,
                        y: 0,
                        rotation: 0,
                        life: 0,
                        death: rand(40, 70),
                        vector: {
                            x: rand(SPREAD * -1, SPREAD),
                            y: rand(-8, -3),
                            rotation: rand(-10, 10)
                        }
                    });

                    const particle = document.createElement('span');
                    particle.id = 'part-' + particlesID;
                    particle.className = 'particle';
                    particle.textContent = '⚡︎'; // CRITICAL: Symbol ⚡︎ not emoji ⚡
                    particle.style.cssText = 'position:absolute;left:42px;top:42px;width:40px;height:40px;font-size:52px;color:#d4ff00;display:block;pointer-events:none;font-family:Arial;';
                    wrapper.appendChild(particle);

                    particlesID++;
                }
            }

            function step() {
                particles.forEach((particle, index) => {
                    particle.life++;
                    if (particle.life > particle.death) {
                        particles.splice(index, 1);
                        const el = document.getElementById('part-' + particle.id);
                        if (el) el.remove();
                    } else {
                        particle.vector.y += GRAVITY;
                        particle.x += particle.vector.x;
                        particle.y += particle.vector.y;
                        particle.rotation += particle.vector.rotation;

                        const el = document.getElementById('part-' + particle.id);
                        if (el) {
                            const scale = 1 - (particle.life / particle.death);
                            el.style.transform = `translate3d(${particle.x}px, ${particle.y}px, 0) scale(${scale}) rotate(${particle.rotation}deg)`;
                            el.style.opacity = scale;
                        }
                    }
                });

                if (particles.length > 0) {
                    requestAnimationFrame(step);
                }
            }

            const bursts = 2;
            const delay = 300;

            for (let b = 0; b < bursts; b++) {
                setTimeout(() => {
                    for (let i = 0; i < EMIT_COUNT; i++) {
                        emit();
                    }
                    if (b === 0) step();
                }, b * delay);
            }
        }

        // ───────────────────────────────────────────────────────────────────────────
        // Scraper Logic
        // ───────────────────────────────────────────────────────────────────────────

        async function scrapeNotifications(onProgress) {
            const startTime = performance.now();
            const matches = [];
            const seenPostIDs = new Set();
            const warnings = [];

            onProgress?.('🔍 Starting scraper...');

            const parent = document.querySelector('.scaffold-finite-scroll');
            if (!parent) {
                onProgress?.('❌ Notification container not found');
                return { meta: { warnings: ['Container not found'], elapsed: 0 }, matches: [] };
            }

            for (let round = 1; round <= 5; round++) {
                onProgress?.(`📜 Round ${round}/5: Scrolling...`);

                const start = window.scrollY;
                const end = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;
                const duration = 200;
                const startT = performance.now();

                await new Promise(resolve => {
                    function animate(now) {
                        const progress = Math.min((now - startT) / duration, 1);
                        const ease = 1 - Math.pow(1 - progress, 3);
                        window.scrollTo(0, start + (end - start) * ease);
                        if (progress < 1) requestAnimationFrame(animate);
                        else resolve();
                    }
                    requestAnimationFrame(animate);
                });

                await Utils.randomPause();

                const showMoreBtn = parent.querySelector('button.scaffold-finite-scroll__load-button');
                if (showMoreBtn && !showMoreBtn.disabled && showMoreBtn.offsetParent !== null) {
                    onProgress?.('🖱️ Clicking "Show more"...');
                    showMoreBtn.click();
                    await Utils.randomPause();
                }
            }

            onProgress?.('🔎 Extracting VIP posts...');
            const allCards = document.querySelectorAll('[data-finite-scroll-hotkey-item]');

            allCards.forEach((card) => {
                try {
                    const profileLink = card.querySelector('a[href*="/in/"]');
                    const profileURL = profileLink?.getAttribute('href') || '';

                    const strongTag = card.querySelector('.nt-card__headline strong');
                    const nameText = strongTag?.textContent.trim() || '';

                    const headlineSpan = card.querySelector('.nt-card__headline span.nt-card__text--3-line');
                    const fullHeadline = headlineSpan?.textContent.trim() || '';

                    const postLink = card.querySelector('.nt-card__headline[href*="highlightedUpdateUrn"]');
                    const postURL = postLink?.getAttribute('href') || '';

                    const isVIP = CONFIG.VIP_LIST.some(vip => {
                        const vipStr = String(vip);
                        if (vipStr.includes('/')) {
                            return Utils.normalizeURL(vipStr) === Utils.normalizeURL(profileURL);
                        } else {
                            return Utils.normalizeName(vipStr) === Utils.normalizeName(nameText);
                        }
                    });

                    if (!isVIP) return;
                    if (!/posted:/i.test(fullHeadline)) return;

                    const postID = Utils.extractPostID(postURL);
                    if (!postID || seenPostIDs.has(postID)) return;

                    seenPostIDs.add(postID);

                    const contentMatch = fullHeadline.match(/posted:\s*(.+)$/is);
                    const postContent = contentMatch ? contentMatch[1].trim() : fullHeadline;

                    matches.push({
                        postID,
                        nameOfVIP: nameText,
                        urlToPost: postURL.startsWith('http') ? postURL : `https://www.linkedin.com${postURL}`,
                        postContent,
                        cardElement: card
                    });

                } catch (err) {
                    console.warn('[LinkedIn AI] Error extracting card:', err);
                }
            });

            const elapsed = Math.round(performance.now() - startTime);
            onProgress?.(`✅ Found ${matches.length} VIP posts in ${elapsed}ms`);

            return {
                meta: { totalCards: allCards.length, finalMatchCount: matches.length, elapsed: `${elapsed}ms`, warnings },
                matches
            };
        }

        // ───────────────────────────────────────────────────────────────────────────
        // Enhanced FAB Button
        // ───────────────────────────────────────────────────────────────────────────

        function createEnhancedFAB() {
            const container = document.createElement('div');
            container.id = 'ai-assistant-fab';
            container.style.cssText = 'position:fixed;bottom:45px;left:35px;z-index:99999;perspective:500px;isolation:isolate;';

            const btnBack = document.createElement('div');
            btnBack.className = 'btn-back';
            btnBack.style.cssText = 'position:absolute;inset:0;z-index:-1;width:85px;height:85px;border-radius:20px;background:linear-gradient(135deg, #d4ff00 -20%, #97b500 120%);box-shadow:16px 0 40px rgba(231,253,83,0.4);transition:transform 250ms;transform-style:preserve-3d;transform-origin:bottom right;transform:rotateZ(8deg);';

            const btnFront = document.createElement('div');
            btnFront.className = 'btn-front';
            btnFront.style.cssText = 'position:relative;width:85px;height:85px;border-radius:20px;background-color:rgba(255,255,255,0.2);backdrop-filter:blur(20px);cursor:pointer;transition:transform 250ms;transform-style:preserve-3d;transform-origin:top left;overflow:visible;display:flex;align-items:center;justify-content:center;';

            const ghostSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            ghostSVG.setAttribute('width', '45');
            ghostSVG.setAttribute('height', '45');
            ghostSVG.setAttribute('viewBox', '0 0 346.6 386.48');
            ghostSVG.style.cssText = 'mix-blend-mode:screen;filter:drop-shadow(0 3px 12px rgba(255,255,255,0.4));';

            const body = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            body.setAttribute('d', 'M307.69,183.8c-15.98-46.87-62.34-80.49-116.7-86.6l-4.51.02,1.34-32.72c.07-1.75,1.49-3.15,3.24-3.2l29.89-.81c2.2-.06,3.51-2.48,2.36-4.36L189.15.48c-.53-.87-1.87-.49-1.87.53v37.04c0,1.66-1.35,3.01-3.01,3.01h-31.07c-2,0-3.25,2.18-2.22,3.91l31.2,52.28-12.05.06c-53.91,2.24-102.73,34.52-121.01,79.51-15.16.79-29.86.63-40.18,12.41-19.52,22.28-6.29,68.06,32.07,63.83l.74,98.46c3.27,16.66,20.14,24.23,37.5,17.31,4.34-1.73,9.17-6.97,14.62-5.97,13.23,6.64,20.51,23.13,37.82,23.6,16.4.45,30.95-18.58,44.33-25.41l3.2-.15c19.76,6.95,38.43,34.69,62.3,18.47,4.89-3.32,14.29-17.56,18.77-19.12,8.09-2.81,19.29,11.25,34.28,8.7,20.83-3.54,20.43-20.08,20.91-34.82.86-26.34-1.64-53.05-1.43-79.49,46.39-6.81,42.21-71.03-6.36-70.85h0Z');
            body.setAttribute('fill', 'rgba(255,255,255,0.95)');

            const eyeRight = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            eyeRight.setAttribute('class', 'eye eye-right');
            eyeRight.setAttribute('cx', '229.7');
            eyeRight.setAttribute('cy', '242.16');
            eyeRight.setAttribute('rx', '32.5');
            eyeRight.setAttribute('ry', '37.5');
            eyeRight.setAttribute('fill', 'rgba(0,0,0,1)');
            eyeRight.style.cssText = 'mix-blend-mode:multiply;opacity:0.13;filter:blur(1px);transform-origin:50% 60%;';

            const eyeLeft = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            eyeLeft.setAttribute('class', 'eye eye-left');
            eyeLeft.setAttribute('cx', '124.18');
            eyeLeft.setAttribute('cy', '242.16');
            eyeLeft.setAttribute('rx', '32.5');
            eyeLeft.setAttribute('ry', '37.5');
            eyeLeft.setAttribute('fill', 'rgba(0,0,0,1)');
            eyeLeft.style.cssText = 'mix-blend-mode:multiply;opacity:0.13;filter:blur(1px);transform-origin:50% 60%;';

            ghostSVG.appendChild(body);
            ghostSVG.appendChild(eyeRight);
            ghostSVG.appendChild(eyeLeft);
            btnFront.appendChild(ghostSVG);

            if (!document.getElementById('ghost-blink-animation')) {
                const blinkStyle = document.createElement('style');
                blinkStyle.id = 'ghost-blink-animation';
                blinkStyle.textContent = '@keyframes blink{0%,38%,100%{transform:scaleY(1)}40%{transform:scaleY(0.05)}41.5%{transform:scaleY(1)}42.5%{transform:scaleY(0.05)}44%{transform:scaleY(1)}}.eye{animation:blink 7s infinite}';
                document.head.appendChild(blinkStyle);
            }

            statusOverlay = document.createElement('div');
            statusOverlay.className = 'status-overlay';
            statusOverlay.style.cssText = 'position:absolute;bottom:140px;left:0;width:320px;max-height:0;background:rgba(0,0,0,0.92);backdrop-filter:blur(20px);border:1px solid rgba(215,255,86,0.3);border-radius:12px;padding:0;overflow:hidden;opacity:0;transition:all 0.3s ease;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:13px;color:white;';

            container.addEventListener('mouseenter', () => {
                if (container.classList.contains('processing')) return;
                btnBack.style.transform = 'translateZ(12px) rotateZ(12deg) rotateX(-20deg) rotateY(-5deg)';
                btnFront.style.transform = 'translateZ(80px) translateY(-5px) rotateX(5deg) rotateY(10deg)';
            });

            container.addEventListener('mouseleave', () => {
                if (container.classList.contains('processing')) return;
                btnBack.style.transform = 'rotateZ(8deg) rotateY(0deg)';
                btnFront.style.transform = 'none';
            });

            // :active state - on press
            container.addEventListener('mousedown', () => {
                if (container.classList.contains('processing')) return;
                btnBack.style.transform = 'translateZ(20px) rotateZ(5deg) rotateX(-20deg) rotateY(-5deg)';
                btnFront.style.transform = 'translateZ(80px) translateY(-5px) rotateX(-5deg) rotateY(-10deg)';
            });

            // :active state - on release (back to hover state)
            container.addEventListener('mouseup', () => {
                if (container.classList.contains('processing')) return;
                btnBack.style.transform = 'translateZ(20px) rotateZ(8deg) rotateX(-20deg) rotateY(-5deg)';
                btnFront.style.transform = 'translateZ(80px) translateY(-5px) rotateX(5deg) rotateY(10deg)';
            });

            btnFront.addEventListener('click', () => {
                btnFront.style.pointerEvents = 'none';
                container.style.pointerEvents = 'none';

                createParticles(container); // PATCH 1: Uncommented

                setTimeout(() => {
                    btnFront.style.pointerEvents = 'auto';
                    container.style.pointerEvents = 'auto';
                    handleFABClick();
                }, 100);
            });

            container.appendChild(btnBack);
            container.appendChild(btnFront);
            container.appendChild(statusOverlay);
            document.body.appendChild(container);

            setTimeout(() => {
                container.style.opacity = '0';
                container.style.transform = 'translateX(200px)';
                container.style.transition = 'all 0.6s cubic-bezier(0.4,0,0.2,1)';
                setTimeout(() => {
                    container.style.opacity = '1';
                    container.style.transform = 'translateX(0)';
                }, 50);
            }, 100);
        }

        // ───────────────────────────────────────────────────────────────────────────
        // FAB Click Handler (PATCH 2 & 3 APPLIED)
        // ───────────────────────────────────────────────────────────────────────────

        async function handleFABClick() {
            const container = document.getElementById('ai-assistant-fab');
            container.classList.add('processing');

            statusOverlay.style.maxHeight = '300px';
            statusOverlay.style.opacity = '1';
            statusOverlay.style.padding = '16px';

            const logContainer = document.createElement('div');
            logContainer.style.cssText = 'line-height:1.6;';
            statusOverlay.innerHTML = '';
            statusOverlay.appendChild(logContainer);

            function updateStatus(msg) {
                const line = document.createElement('div');
                line.textContent = msg;
                line.style.cssText = 'margin-bottom:8px;opacity:0;animation:fadeIn 0.3s forwards;';
                logContainer.appendChild(line);
                logContainer.scrollTop = logContainer.scrollHeight;
            }

            if (!document.getElementById('status-fade-anim')) {
                const style = document.createElement('style');
                style.id = 'status-fade-anim';
                style.textContent = '@keyframes fadeIn{to{opacity:1}}@keyframes highlightPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.02)}}';
                document.head.appendChild(style);
            }

            try {
                const result = await scrapeNotifications(updateStatus);

                if (result.matches.length === 0) {
                    updateStatus('ℹ️ No new VIP posts found');
                    setTimeout(() => {
                        statusOverlay.style.maxHeight = '0';
                        statusOverlay.style.opacity = '0';
                        statusOverlay.style.padding = '0';
                        container.classList.remove('processing');
                    }, 3000);
                    return;
                }

                // PATCH 3: Scroll to top first
                updateStatus('📍 Scrolling to top...');
                await new Promise(resolve => {
                    const startY = window.scrollY;
                    const duration = 300;
                    const startTime = performance.now();

                    function animate(now) {
                        const progress = Math.min((now - startTime) / duration, 1);
                        const ease = 1 - Math.pow(1 - progress, 3);
                        window.scrollTo(0, startY * (1 - ease));

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            resolve();
                        }
                    }
                    requestAnimationFrame(animate);
                });

                // PATCH 3: Sequential reveal with scroll into view
                updateStatus(`✨ Revealing ${result.matches.length} matches...`);

                for (let i = 0; i < result.matches.length; i++) {
                    const match = result.matches[i];

                    await new Promise(resolve => setTimeout(resolve, 100));

                    if (match.cardElement) {
                        match.cardElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                            inline: 'nearest'
                        });

                        match.cardElement.style.cssText = `
            animation: highlightPulse 0.6s ease-out;
            border: 2px solid #D7FF56 !important;
            box-shadow: 0 0 20px rgba(215,255,86,0.5) !important;
            background: rgba(215,255,86,0.05) !important;
          `;
                    }
                }

                updateStatus('🚀 Opening worker...');
                await new Promise(resolve => setTimeout(resolve, 800));

                workerWindow = window.open(CONFIG.WORKER_URL, 'LinkedInAIWorker', 'width=600,height=800');

                if (!workerWindow) {
                    updateStatus('❌ Popup blocked. Allow popups and try again.');
                    return;
                }

                updateStatus('⏳ Waiting for worker...');

                // PATCH 2: Improved worker ready detection
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        window.removeEventListener('message', handler);
                        reject(new Error('Worker timeout'));
                    }, 10000);

                    const handler = (event) => {
                        if (event.origin !== new URL(CONFIG.WORKER_URL).origin) return;
                        if (event.data.type === 'WORKER_READY') {
                            clearTimeout(timeout);
                            window.removeEventListener('message', handler);
                            resolve();
                        }
                    };

                    window.addEventListener('message', handler);

                    const workerOrigin = new URL(CONFIG.WORKER_URL).origin;

                    const pingInterval = setInterval(() => {
                        if (workerWindow && !workerWindow.closed) {
                            workerWindow.postMessage({ type: 'PING' }, workerOrigin);
                        }
                    }, 200);

                    setTimeout(() => clearInterval(pingInterval), 10000);
                }).catch(err => {
                    updateStatus('⚠️ Worker slow to respond, sending anyway...');
                });

                const workerOrigin = new URL(CONFIG.WORKER_URL).origin;
                const serializablePosts = result.matches.map(({ cardElement, ...post }) => post);
                workerWindow.postMessage({
                    type: 'VIP_QUEUE',
                    posts: serializablePosts,
                    timestamp: Date.now()
                }, workerOrigin);
                console.log('[LinkedIn AI] Sent VIP_QUEUE with', serializablePosts.length, 'posts');
                console.log(serializablePosts);

                updateStatus('✅ Posts sent to worker!');

                setTimeout(() => {
                    statusOverlay.style.maxHeight = '0';
                    statusOverlay.style.opacity = '0';
                    statusOverlay.style.padding = '0';
                    container.classList.remove('processing');
                }, 2000);

            } catch (error) {
                updateStatus(`❌ Error: ${error.message}`);
                setTimeout(() => {
                    statusOverlay.style.maxHeight = '0';
                    statusOverlay.style.opacity = '0';
                    container.classList.remove('processing');
                }, 3000);
            }
        }

        window.addEventListener('message', (event) => {
            if (!event.origin.includes(new URL(CONFIG.WORKER_URL).origin)) return;
            if (event.data.type === 'AI_RESPONSES') {
                console.log('[LinkedIn AI] ✅ Received AI responses:', event.data.posts);
            }
        });

        createEnhancedFAB();
        console.log('[LinkedIn AI] 💡 Click the button to scan for VIP posts');
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // POST PAGE - COMMENT INJECTION + TRACKING
    // ═════════════════════════════════════════════════════════════════════════════

    if (PAGE_TYPE === 'POST') {
        // Wait for DOM to be fully ready
        if (document.readyState !== 'complete') {
            window.addEventListener('load', initPostPage);
        } else {
            initPostPage();
        }

        function initPostPage() {
            let currentDraftIndex = 0;
            let drafts = [];
            let postData = {};

            function parseDraftsFromURL() {
            // Try hash params first (new system)
            const hash = window.location.hash.slice(1);
            if (hash) {
                try {
                    const params = new URLSearchParams(hash);
                    const selected = parseInt(params.get('selected')) || 1;
                    drafts = [
                        params.get('draft1') ? JSON.parse(decodeURIComponent(params.get('draft1'))) : '',
                        params.get('draft2') ? JSON.parse(decodeURIComponent(params.get('draft2'))) : '',
                        params.get('draft3') ? JSON.parse(decodeURIComponent(params.get('draft3'))) : ''
                    ].filter(Boolean);

                    if (drafts.length > 0) {
                        currentDraftIndex = selected - 1;
                        postData.postID = Utils.extractPostID(window.location.href);
                        return drafts;
                    }
                } catch (e) {
                    console.error('[LinkedIn AI] Hash parse error:', e);
                }
            }

            // Fallback to query params (old system)
            const params = new URLSearchParams(window.location.search);
            const draft1 = params.get('draft1');
            const draft2 = params.get('draft2');
            const draft3 = params.get('draft3');

            if (!draft1) return null;

            drafts = [
                decodeURIComponent(draft1),
                draft2 ? decodeURIComponent(draft2) : null,
                draft3 ? decodeURIComponent(draft3) : null
            ].filter(Boolean);

            postData.postID = Utils.extractPostID(window.location.href);
            return drafts;
        }

        function highlightCommentBox() {
                const target = document.querySelector('.comments-comment-texteditor');
                if (!target) {
                    console.warn('Comment texteditor not found');
                    return;
                }

                // Create container
                const container = document.createElement('div');
                container.className = 'li-border-container';

                // Create glow layer only
                const glowLayer = document.createElement('div');
                glowLayer.className = 'li-border-glow';

                // Wrap target and add glow
                target.parentNode.insertBefore(container, target);
                container.appendChild(glowLayer);
                container.appendChild(target);

                // Trigger border color animation
                target.classList.add('li-border-active');

                // Inject CSS
                const style = document.createElement('style');
                style.textContent = `
                    /* Container */
                    .li-border-container {
                    position: relative;
                    width: 100%;
                    }

                    .li-border-container .li-border-animated {
                    display: none;
                    }

                    /* Glow layer - fades out after 2 cycles */
                    .li-border-glow {
                    position: absolute;
                    inset: -12px; /* Extend beyond border for glow effect */
                    border-radius: 8px;
                    overflow: hidden;
                    filter: blur(20px);
                    z-index: 0;
                    pointer-events: none;
                    animation: li-glow-fadeout 1s ease-out forwards; /* Fade out over 1s */
                    }

                    .li-border-glow:before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(0deg);
                    width: 200%;
                    height: 200%;
                    background: conic-gradient(
                        transparent,
                        #d4ff00,
                        transparent 20%
                    );
                    animation: li-border-rotate 0.7s ease 1;
                    }

                    /* Animate border color on texteditor */
                    .comments-comment-texteditor {
                    transition: border-color 1s ease;
                    }

                    .comments-comment-texteditor.li-border-active {
                    border-color: #d4ff00 !important;
                    animation: li-border-color-pulse 1s ease forwards;
                    }

                    /* Content stays on top */
                    .li-border-container > .comments-comment-texteditor {
                    position: relative;
                    z-index: 2;
                    }

                    /* Rotation animation */
                    @keyframes li-border-rotate {
                    100% {
                        transform: translate(-50%, -50%) rotate(360deg);
                    }
                    }

                    /* Glow fade out */
                    @keyframes li-glow-fadeout {
                    0% { opacity: 1; }
                    80% { opacity: 1; } /* Stay visible during rotation */
                    100% { opacity: 0; } /* Fade out at end */
                    }

                    /* Border color pulse */
                    @keyframes li-border-color-pulse {
                    0% { border-color: var(--color-border-low-emphasis); }
                    50% { border-color: #d4ff00; }
                    100% { border-color: var(--color-border-low-emphasis); }
                    }
                `;
                document.head.appendChild(style);
            }

            function waitForCommentBox() {
                return new Promise((resolve) => {
                    const check = setInterval(() => {
                        const commentBox = document.querySelector('.ql-editor[contenteditable="true"]') ||
                            document.querySelector('div[role="textbox"][contenteditable="true"]');

                        if (commentBox) {
                            clearInterval(check);
                            resolve(commentBox);
                        }
                    }, 100);

                    setTimeout(() => {
                        clearInterval(check);
                        resolve(null);
                    }, 5000);
                });
            }

            function injectDraft(commentBox, text) {
                // Clean up any \n + spaces patterns from GPT output
                const cleanedText = text.replace(/\n\s+\n/g, '\n\n').replace(/\n\s+/g, '\n');

                // Split by newlines and trim each line
                const lines = cleanedText.split('\n')
                .map(line => line.trim())
                .filter(line => line);

                // Wrap each line in <p> tags
                const htmlContent = lines.map(line => `<p>${line}</p>`).join('');

                if (commentBox.getAttribute('contenteditable') === 'true') {
                    commentBox.innerHTML = htmlContent;
                    commentBox.dispatchEvent(new Event('input', { bubbles: true }));
                } else {
                    commentBox.value = text;
                    commentBox.dispatchEvent(new Event('input', { bubbles: true }));
                }

                commentBox.focus();
                highlightCommentBox();
                console.log('[LinkedIn AI] Injected draft with', lines.length, 'lines');
            }

            function createCycleButton(commentBox) {
                if (drafts.length === 1) {
                    console.log('[LinkedIn AI] Only 1 draft, skipping button');
                    return;
                }

                // Find comment texteditor container for positioning reference
                const commentContainer = document.querySelector('.comments-comment-texteditor');
                if (!commentContainer) {
                    console.error('[LinkedIn AI] Comment container not found!');
                    return;
                }

                console.log('[LinkedIn AI] Comment container found:', commentContainer);
                console.log('[LinkedIn AI] Parent element:', commentContainer.parentElement);

                // Use DIV instead of BUTTON to avoid form submission
                const btn = document.createElement('div');
                btn.setAttribute('role', 'button');
                btn.setAttribute('aria-label', 'Cycle through AI draft comments');
                btn.setAttribute('data-ai-cycle-button', 'true');
                btn.innerHTML = `<span style="font-size: 16px; margin-right: 4px;">↻</span>${currentDraftIndex + 1}/${drafts.length}`;
                btn.style.cssText = `
        position: fixed;
        bottom: 50%;
        right: 24px;
        z-index: 99999;
        padding: 8px 16px;
        background: linear-gradient(135deg, #D7FF56 -20%, #97b500 120%);
        color: #1c1c1c;
        border: none;
        border-radius: 10px;
        font-family: 'JetBrains Mono', monospace;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(215, 255, 86, 0.4);
        transition: all 0.2s ease-out;
        display: flex;
        align-items: center;
        user-select: none;
        -webkit-user-select: none;
    `;

                // Hover effects
                btn.addEventListener('mouseenter', () => {
                    btn.style.transform = 'translateY(-2px) scale(1.05)';
                    btn.style.boxShadow = '0 6px 16px rgba(215, 255, 86, 0.5)';
                });

                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = 'translateY(0) scale(1)';
                    btn.style.boxShadow = '0 4px 12px rgba(215, 255, 86, 0.4)';
                });

                // Click handler with maximum safety
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    e.preventDefault();

                    if (e.target.closest('[data-ai-cycle-button]') !== btn) {
                        return;
                    }

                    currentDraftIndex = (currentDraftIndex + 1) % drafts.length;
                    injectDraft(commentBox, drafts[currentDraftIndex]);
                    btn.innerHTML = `<span style="font-size: 16px; margin-right: 4px;">↻</span>${currentDraftIndex + 1}/${drafts.length}`;

                    btn.style.transform = 'scale(1.15)';
                    setTimeout(() => btn.style.transform = 'scale(1)', 200);
                }, true);

                btn.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    e.preventDefault();
                }, true);

                btn.addEventListener('mouseup', (e) => {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    e.preventDefault();
                }, true);

                btn.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        e.preventDefault();

                        currentDraftIndex = (currentDraftIndex + 1) % drafts.length;
                        injectDraft(commentBox, drafts[currentDraftIndex]);
                        btn.innerHTML = `<span style="font-size: 16px; margin-right: 4px;">↻</span>${currentDraftIndex + 1}/${drafts.length}`;
                    }
                }, true);

                // Append directly to body for now (easier to debug)
                document.body.appendChild(btn);
                console.log('[LinkedIn AI] ✅ Cycle button created and appended to body');
            }

            function watchForPostSubmit(commentBox) {
                const observer = new MutationObserver(() => {
                    const postButton = document.querySelector('button[type="submit"]');
                    if (postButton && !postButton.hasAttribute('data-tracked')) {
                        postButton.setAttribute('data-tracked', 'true');
                        postButton.addEventListener('click', () => {
                            setTimeout(() => {
                                // Extract data
                                const finalComment = commentBox.innerText || commentBox.value || '';
                                const originalDraft = drafts[currentDraftIndex] || '';
                                const manualEdits = finalComment.trim() !== originalDraft.trim();

                                // Build query params
                                const params = new URLSearchParams({
                                    action: 'track',
                                    postId: postData.postID,
                                    draft: (currentDraftIndex + 1).toString(),
                                    original: encodeURIComponent(originalDraft),
                                    comment: encodeURIComponent(finalComment),
                                    edited: manualEdits.toString()
                                });

                                // Open worker in new window to process tracking
                                const workerUrl = `${CONFIG.WORKER_URL}?${params.toString()}`;
                                window.open(workerUrl, '_blank', 'width=400,height=300');

                                console.log('[LinkedIn AI] Opened worker for comment tracking');
                            }, 500);
                        });
                    }
                });

                observer.observe(document.body, { childList: true, subtree: true });
            }

            // Auto-click "Show more" button
            setTimeout(() => {
                const btn = document.querySelector('.feed-shared-inline-show-more-text__see-more-less-toggle, button[aria-label*="see more"]');
                if (btn) {
                    btn.click();
                    console.log('[LinkedIn AI] Clicked "Show more"');
                }
            }, 500);

            // Initialize injection
            (async () => {
                const parsedDrafts = parseDraftsFromURL();
                if (!parsedDrafts) {
                    console.log('[LinkedIn AI] No drafts in URL');
                    return;
                }

                console.log('[LinkedIn AI] Found', drafts.length, 'AI drafts');

                // Auto-click "Show more" FIRST and wait
                await new Promise(resolve => {
                    setTimeout(() => {
                        const btn = document.querySelector('.feed-shared-inline-show-more-text__see-more-less-toggle, button[aria-label*="see more"]');
                        if (btn) {
                            btn.click();
                            console.log('[LinkedIn AI] Clicked "Show more"');
                            setTimeout(resolve, 800); // Wait for expansion
                        } else {
                            resolve();
                        }
                    }, 1000);
                });

                const commentBox = await waitForCommentBox();
                if (!commentBox) {
                    console.warn('[LinkedIn AI] Comment box not found');
                    return;
                }

                injectDraft(commentBox, drafts[currentDraftIndex]);
                createCycleButton(commentBox);
                watchForPostSubmit(commentBox);

                const notification = document.createElement('div');
                notification.innerHTML = 'AI draft loaded';
                notification.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 99999;
    padding: 14px 24px;
    background: linear-gradient(135deg, #D7FF56 -20%, #97b500 120%);
    color: #1c1c1c;
    border-radius: 12px;
    font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-weight: 600;
    font-size: 14px;
    box-shadow: 0 4px 16px rgba(215, 255, 86, 0.4);
    backdrop-filter: blur(12px);
    animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

                if (!document.getElementById('notif-slide-anim')) {
                    const style = document.createElement('style');
                    style.id = 'notif-slide-anim';
                    style.textContent = '@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}';
                    document.head.appendChild(style);
                }

                document.body.appendChild(notification);
                setTimeout(() => notification.remove(), 3000);
            })();
        }
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // KEYBOARD SHORTCUT
    // ═════════════════════════════════════════════════════════════════════════════

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            if (PAGE_TYPE === 'NOTIFICATIONS') {
                document.getElementById('ai-assistant-fab')?.querySelector('.btn-front')?.click();
            }
        }
    });

    console.log(`[LinkedIn AI] Initialized on ${PAGE_TYPE} page. Worker: ${CONFIG.WORKER_URL}`);

})();
