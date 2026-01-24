// ==UserScript==
// @name         OffhoursAI LinkedIn AI Commenter (Dual Strategy)
// @namespace    https://offhoursai.com/
// @version      6.3
// @updateURL    https://offhoursai.com/client/phuys/m8kP3vN7xQ2wR9sL/linkedin-scraper.user.js
// @downloadURL  https://offhoursai.com/client/phuys/m8kP3vN7xQ2wR9sL/linkedin-scraper.user.js
// @description  LinkedIn AI Post Commenter scraper with VIP Search Results + Notifications fallback
// @match        *://*.linkedin.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ═════════════════════════════════════════════════════════════════════════════
    // Dark Theme Detection & Adjustment
    // ═════════════════════════════════════════════════════════════════════════════
    // const targets = [document.documentElement, document.body];

    // function isDarkTheme(element) {
    //     const bg = window.getComputedStyle(element).backgroundColor;
    //     if (!bg) return false;
    //     const rgb = bg.match(/\d+/g);
    //     if (!rgb || rgb.length < 3) return false;
    //     const [r, g, b] = rgb.map(Number);
    //     const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
    //     return luminance < 128;
    // }

    // const darkDetected = targets.some(el => isDarkTheme(el));

    // if (darkDetected) {
    //     const style = document.createElement("style");
    //     style.textContent = `body, html {background-color: #1c1c1c !important;}`;
    //     document.head.appendChild(style);
    // }

    // ═════════════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═════════════════════════════════════════════════════════════════════════════

    const CONFIG = {
        WORKER_URL: 'https://offhoursai.com/client/phuys/m8kP3vN7xQ2wR9sL/worker.html',
        N8N_TRACKER_WEBHOOK: 'https://your-n8n-instance.com/webhook/comment-tracker',
        MAX_POSTS: 10,  // Limit number of posts to scrape (for testing)
        ENABLE_NOTIFICATIONS_FALLBACK: false,  // Disable notifications scraping (VIP search only)
        VIP_LIST: [
            {
                name: 'Patrick Huijs',
                profileUrl: 'https://www.linkedin.com/in/patrick-huijs',
                profileId: 'patrick-huijs'
            },
            {
                name: 'Simon Sinek',
                profileUrl: 'https://www.linkedin.com/in/simonsinek',
                profileId: 'simonsinek'
            }
        ]
    };

    // ═════════════════════════════════════════════════════════════════════════════
    // PAGE DETECTION
    // ═════════════════════════════════════════════════════════════════════════════

    const PAGE_TYPE = (() => {
        const path = window.location.pathname;
        const search = window.location.search;

        if (path.includes('/search/results/content')) return 'VIP_SEARCH';
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

        extractProfileId(url) {
            if (!url) return null;
            const match = url.match(/\/in\/([^/?]+)/);
            return match ? decodeURIComponent(match[1]) : null;
        },

        cleanText(text) {
            return text?.trim().replace(/\s+/g, ' ') || '';
        },

        convertHtmlToText(html) {
            const temp = document.createElement('div');
            temp.innerHTML = html;

            // Preserve paragraph spacing
            temp.querySelectorAll('p').forEach((p, index) => {
                // Add double newline after each paragraph (except inline handling)
                if (p.nextSibling) {
                    p.insertAdjacentText('afterend', '\n\n');
                }
            });

            // Replace <br> with newlines BEFORE extracting text
            temp.querySelectorAll('br').forEach(br => {
                br.replaceWith('\n');
            });

            // Keep bold formatting with markdown-style **text**
            temp.querySelectorAll('strong, b').forEach(el => {
                el.replaceWith(`**${el.textContent}**`);
            });

            // Replace links but keep text content
            temp.querySelectorAll('a').forEach(a => {
                a.replaceWith(a.textContent);
            });

            // Get text content with preserved line breaks
            let text = temp.textContent;

            // Clean up HTML comments
            text = text.replace(/<!--.*?-->/g, '');

            // Preserve all intentional line breaks, only remove excessive spaces on same line
            text = text
                .split('\n')
                .map(line => line.trim())  // Trim each line individually
                .join('\n');               // Rejoin with newlines

            // Remove leading/trailing blank lines only
            text = text.replace(/^\n+/, '').replace(/\n+$/, '');

            return text;
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
    // SCRAPER PAGES - VIP_SEARCH + NOTIFICATIONS
    // ═════════════════════════════════════════════════════════════════════════════

    const shouldActivateScraper = PAGE_TYPE === 'VIP_SEARCH' ||
                                   (PAGE_TYPE === 'NOTIFICATIONS' && CONFIG.ENABLE_NOTIFICATIONS_FALLBACK);

    if (shouldActivateScraper) {

        let workerWindow = null;
        let statusOverlay = null;

        // ───────────────────────────────────────────────────────────────────────────
        // Particle Animation System
        // ───────────────────────────────────────────────────────────────────────────

        let particles = [];
        let particlesID = 0;
        const MAX_PARTICLES = 20;
        const EMIT_COUNT = 15;
        const GRAVITY = 0.1;
        const SPREAD = 5;

        function createParticles(container) {
            let wrapper = container.querySelector('.particle-wrapper');
            if (!wrapper) {
                wrapper = document.createElement('div');
                wrapper.className = 'particle-wrapper';
                wrapper.style.cssText = 'position:absolute;inset:0;z-index:0;pointer-events:none;overflow:visible;';
                container.insertBefore(wrapper, container.firstChild);
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
                    particle.textContent = '⚡︎';
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
        // Self-Healing Helper Functions
        // ───────────────────────────────────────────────────────────────────────────

        function extractProfileData(element) {
            const strategies = [
                (el) => {
                    const link = el.querySelector('a[href*="/in/"]');
                    if (link) return { url: link.getAttribute('href'), source: 'standard-link' };
                },
                (el) => {
                    const links = el.querySelectorAll('a[href]');
                    for (const link of links) {
                        const href = link.getAttribute('href');
                        if (href && href.includes('/in/')) {
                            return { url: href, source: 'permissive-link' };
                        }
                    }
                },
                (el) => {
                    const tracked = el.querySelector('[data-tracking-id*="profile"]');
                    if (tracked) {
                        const trackingId = tracked.getAttribute('data-tracking-id');
                        return { url: `/in/${trackingId}`, source: 'tracking-id' };
                    }
                },
                (el) => {
                    let current = el;
                    for (let i = 0; i < 5; i++) {
                        if (!current.parentElement) break;
                        current = current.parentElement;
                        const link = current.querySelector('a[href*="/in/"]');
                        if (link) return { url: link.getAttribute('href'), source: 'parent-walk' };
                    }
                },
                (el) => {
                    const strong = el.querySelector('strong, b, .nt-card__headline strong');
                    if (strong && strong.textContent.trim()) {
                        return { name: strong.textContent.trim(), source: 'strong-tag' };
                    }
                },
                (el) => {
                    const labeled = el.querySelector('[aria-label*="profile"], [aria-label*="Profile"]');
                    if (labeled) {
                        const label = labeled.getAttribute('aria-label');
                        return { name: label.split(' ')[0], source: 'aria-label' };
                    }
                }
            ];

            for (const strategy of strategies) {
                try {
                    const result = strategy(element);
                    if (result) {
                        return result;
                    }
                } catch (err) {
                    // Continue to next strategy
                }
            }

            return { source: 'none' };
        }

        function findPostsByPattern(container) {
            const postCards = [];
            const postPatterns = [/posted:/i, /shared this/i, /commented on this/i, /reposted this/i];

            const walker = document.createTreeWalker(
                container,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            const matchedElements = new Set();

            let node;
            while (node = walker.nextNode()) {
                const text = node.textContent.trim();

                if (postPatterns.some(pattern => pattern.test(text))) {
                    let current = node.parentElement;
                    let depth = 0;

                    while (current && depth < 10) {
                        if (current.hasAttribute('data-finite-scroll-hotkey-item') ||
                            current.classList.contains('nt-card') ||
                            current.tagName === 'ARTICLE' ||
                            current.hasAttribute('data-view-name')) {

                            if (!matchedElements.has(current)) {
                                matchedElements.add(current);
                                postCards.push(current);
                            }
                            break;
                        }
                        current = current.parentElement;
                        depth++;
                    }
                }
            }

            return postCards;
        }

        async function retryWithBackoff(fn, maxAttempts = 3, baseDelay = 2000) {
            let lastError;

            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    return await fn(attempt);
                } catch (error) {
                    lastError = error;
                    if (attempt < maxAttempts) {
                        const delay = baseDelay * Math.pow(2, attempt - 1);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }

            throw lastError;
        }

        function findNotificationContainer() {
            const containerSelectors = [
                '.scaffold-finite-scroll',
                '[role="main"] .scaffold-finite-scroll',
                '.notifications-container',
                '[data-view-name="notifications-list"]'
            ];

            for (const selector of containerSelectors) {
                const el = document.querySelector(selector);
                if (el) {
                    console.log(`[LinkedIn AI] Container found via selector: ${selector}`);
                    return el;
                }
            }

            const allElements = document.querySelectorAll('[role="main"] *, main *');
            let bestCandidate = null;
            let maxMatches = 0;

            for (const el of allElements) {
                const text = el.textContent || '';
                const matches = (text.match(/posted:/gi) || []).length;

                if (matches > maxMatches && matches >= 3) {
                    maxMatches = matches;
                    bestCandidate = el;
                }
            }

            if (bestCandidate) {
                return bestCandidate;
            }

            return null;
        }

        // ───────────────────────────────────────────────────────────────────────────
        // VIP SEARCH RESULTS SCRAPER (NEW - PRIMARY STRATEGY)
        // ───────────────────────────────────────────────────────────────────────────

        async function scrapeVIPSearchResults(onProgress) {
            const startTime = performance.now();
            const matches = [];
            const seenPostIDs = new Set();
            const warnings = [];

            onProgress?.('🎯 Scanning VIP search results...');

            // Find container with multiple fallback strategies
            const containerStrategies = [
                () => document.querySelector('[data-testid="lazy-column"]'), // New structure (most specific)
                () => document.querySelector('[data-component-type="LazyColumn"]'), // New structure alternative
                () => document.querySelector('.search-results-container'), // Old structure
                () => document.querySelector('.scaffold-finite-scroll__content'), // Old structure
                () => document.querySelector('[class*="search-results"]'), // Old structure
                () => {
                    // Last resort: find any container with posts
                    const elements = document.querySelectorAll('[class*="scroll"]');
                    return Array.from(elements).find(el =>
                        el.querySelectorAll('[data-view-name="feed-full-update"]').length > 0 ||
                        el.querySelectorAll('.feed-shared-update-v2').length > 0
                    );
                }
            ];

            let container = null;
            for (const strategy of containerStrategies) {
                try {
                    container = strategy();
                    if (container) {
                        console.log('[LinkedIn AI] VIP Search container found:', container);
                        break;
                    }
                } catch (err) {
                    console.warn('[LinkedIn AI] Container strategy failed:', err);
                    continue;
                }
            }

            if (!container) {
                console.error('[LinkedIn AI] ❌ No container found with any strategy');
                onProgress?.('❌ VIP search container not found');
                warnings.push('Container not found');
                return { meta: { warnings, elapsed: 0 }, matches: [] };
            }

            // Scroll to load all posts (infinite scroll handling)
            onProgress?.('📜 Loading all posts...');

            // Find the scrollable main element
            const scrollableMain = document.querySelector('main');
            if (!scrollableMain) {
                console.warn('[LinkedIn AI] No <main> element found for scrolling');
                onProgress?.('⚠️ Could not find scrollable container');
            }

            let previousHeight = 0;
            let stableCount = 0;
            const maxRounds = 10;

            for (let round = 1; round <= maxRounds; round++) {
                onProgress?.(`📜 Round ${round}/${maxRounds}: Scrolling...`);

                if (scrollableMain) {
                    // Smooth scroll main to bottom
                    const start = scrollableMain.scrollTop;
                    const end = scrollableMain.scrollHeight - scrollableMain.clientHeight;
                    const duration = 200;
                    const startT = performance.now();

                    await new Promise(resolve => {
                        function animate(now) {
                            const progress = Math.min((now - startT) / duration, 1);
                            const ease = 1 - Math.pow(1 - progress, 3);
                            scrollableMain.scrollTo(0, start + (end - start) * ease);
                            if (progress < 1) requestAnimationFrame(animate);
                            else resolve();
                        }
                        requestAnimationFrame(animate);
                    });
                }

                // Wait for content to load
                await Utils.randomPause(800, 1200);

                // Check if container height changed
                const currentHeight = container.scrollHeight;
                if (currentHeight === previousHeight) {
                    stableCount++;
                    if (stableCount >= 2) {
                        onProgress?.(`✓ All content loaded (round ${round})`);
                        break;
                    }
                } else {
                    stableCount = 0;
                    previousHeight = currentHeight;
                }

                if (round === maxRounds) {
                    onProgress?.('✓ Reached max scroll depth');
                }
            }

            // Scroll main back to top
            if (scrollableMain) {
                onProgress?.('📍 Scrolling to top...');
                await new Promise(resolve => {
                    const startY = scrollableMain.scrollTop;
                    const duration = 300;
                    const startTime = performance.now();

                    function animate(now) {
                        const progress = Math.min((now - startTime) / duration, 1);
                        const ease = 1 - Math.pow(1 - progress, 3);
                        scrollableMain.scrollTo(0, startY * (1 - ease));

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            resolve();
                        }
                    }
                    requestAnimationFrame(animate);
                });
            }

            // Find post cards
            onProgress?.('📋 Finding posts...');
            const cardStrategies = [
                () => {
                    // New structure: query listitems directly from container
                    // (container might BE the list, or contain the list)
                    const items = container.querySelectorAll('[role="listitem"]');
                    // Filter to only items that contain feed-full-update (actual posts, not ads/promos)
                    return Array.from(items).filter(item =>
                        item.querySelector('[data-view-name="feed-full-update"]')
                    );
                },
                () => container.querySelectorAll('.feed-shared-update-v2'), // Old selector (fallback)
                () => container.querySelectorAll('[data-urn*="activity"]') // Old selector (fallback)
            ];

            let allCards = [];
            for (const strategy of cardStrategies) {
                try {
                    allCards = Array.from(strategy());
                    if (allCards.length > 0) {
                        console.log(`[LinkedIn AI] Found ${allCards.length} post cards using strategy`);
                        break;
                    }
                } catch (err) {
                    console.warn('[LinkedIn AI] Card strategy failed:', err);
                    continue;
                }
            }

            if (allCards.length === 0) {
                console.error('[LinkedIn AI] ❌ No cards found. Container:', container);
                console.error('[LinkedIn AI] Tried to find: [role="listitem"], .feed-shared-update-v2, [data-urn*="activity"]');
                const listitems = container.querySelectorAll('[role="listitem"]');
                const feedUpdates = container.querySelectorAll('[data-view-name="feed-full-update"]');
                console.error(`[LinkedIn AI] Debug: Found ${listitems.length} listitems, ${feedUpdates.length} feed-full-updates`);
                onProgress?.('⚠️ No post cards found');
                warnings.push('No cards found');
                return { meta: { warnings, elapsed: 0 }, matches: [] };
            }

            onProgress?.(`🔎 Extracting ${allCards.length} posts...`);

            allCards.forEach((card) => {
                try {
                    // Extract post ID
                    let postID = null;
                    const idStrategies = [
                        () => {
                            // New structure: data-view-tracking-scope contains encoded URN
                            const trackingEl = card.querySelector('[data-view-tracking-scope]');
                            if (trackingEl) {
                                try {
                                    const tracking = trackingEl.getAttribute('data-view-tracking-scope');
                                    // Decode the JSON (it's HTML-encoded)
                                    const decoded = tracking.replace(/&quot;/g, '"');
                                    const data = JSON.parse(decoded);
                                    if (data[0]?.breadcrumb?.content?.data) {
                                        // Convert buffer array to string
                                        const str = String.fromCharCode(...data[0].breadcrumb.content.data);
                                        const match = str.match(/"updateUrn":"urn:li:activity:(\d+)"/);
                                        if (match) return match[1];
                                    }
                                } catch (e) {
                                    console.warn('[LinkedIn AI] Failed to parse tracking data:', e);
                                }
                            }
                        },
                        () => {
                            // Old structure fallback
                            const feedCard = card.querySelector('.feed-shared-update-v2') || card;
                            const urn = feedCard.getAttribute('data-urn');
                            if (urn) {
                                const match = urn.match(/activity:(\d+)/);
                                return match ? match[1] : null;
                            }
                        },
                        () => {
                            const link = card.querySelector('a[href*="activity"]');
                            return link ? Utils.extractPostID(link.href) : null;
                        }
                    ];

                    for (const strategy of idStrategies) {
                        try {
                            postID = strategy();
                            if (postID) break;
                        } catch (err) {
                            continue;
                        }
                    }

                    if (!postID || seenPostIDs.has(postID)) return;
                    seenPostIDs.add(postID);

                    // Extract author name
                    let nameText = '';
                    const nameStrategies = [
                        () => {
                            // New structure: Find profile link and get name from <p> inside
                            const profileLinks = card.querySelectorAll('a[href*="/in/"]');
                            for (const link of profileLinks) {
                                const nameP = link.querySelector('p');
                                if (nameP) {
                                    // Get first text, strip LinkedIn badge and connection degree
                                    const text = nameP.textContent.trim();
                                    const cleanName = text.split('\n')[0].split('•')[0].trim();
                                    if (cleanName && cleanName.length > 2) {
                                        return cleanName;
                                    }
                                }
                            }
                        },
                        () => {
                            // Old structure fallback
                            const titleDiv = card.querySelector('.update-components-actor__title');
                            if (titleDiv) {
                                const nameSpan = titleDiv.querySelector('span[aria-hidden="true"]') ||
                                                titleDiv.querySelector('span:first-child');
                                if (nameSpan) return nameSpan.textContent.trim();
                                // Fallback: get first line only
                                const fullText = titleDiv.textContent.trim();
                                return fullText.split('\n')[0].trim();
                            }
                        },
                        () => card.querySelector('.update-components-actor__name')?.textContent.trim(),
                        () => card.querySelector('[data-attributed-id*="profile"]')?.textContent.trim(),
                        () => {
                            const strong = card.querySelector('strong');
                            return strong?.textContent.trim();
                        }
                    ];

                    for (const strategy of nameStrategies) {
                        try {
                            nameText = strategy();
                            if (nameText) {
                                // Clean up any remaining duplicates or whitespace
                                nameText = nameText.replace(/\s+/g, ' ').trim();
                                // Remove duplicate names (e.g., "Patrick HuijsPatrick Huijs" -> "Patrick Huijs")
                                const words = nameText.split(' ');
                                if (words.length >= 4) {
                                    const firstHalf = words.slice(0, words.length / 2).join(' ');
                                    const secondHalf = words.slice(words.length / 2).join(' ');
                                    if (firstHalf === secondHalf) {
                                        nameText = firstHalf;
                                    }
                                }
                                break;
                            }
                        } catch (err) {
                            continue;
                        }
                    }

                    // Extract profile URL
                    let profileURL = '';
                    const urlStrategies = [
                        () => {
                            const actorContainer = card.querySelector('.update-components-actor__container');
                            const link = actorContainer?.querySelector('a[href*="/in/"]');
                            return link?.getAttribute('href') || '';
                        },
                        () => {
                            const link = card.querySelector('a[href*="/in/"]');
                            return link?.getAttribute('href') || '';
                        }
                    ];

                    for (const strategy of urlStrategies) {
                        try {
                            profileURL = strategy();
                            if (profileURL) break;
                        } catch (err) {
                            continue;
                        }
                    }

                    const profileId = Utils.extractProfileId(profileURL);

                    // No VIP matching needed - search page is already filtered by fromMember parameter
                    // N8N will handle relationship notes lookup via profileId

                    // Extract post content with HTML preservation
                    let postContent = '';
                    const contentStrategies = [
                        () => {
                            // New structure: data-view-name="feed-commentary"
                            const commentaryEl = card.querySelector('[data-view-name="feed-commentary"]');
                            if (commentaryEl) {
                                // Look for the expandable text box inside
                                const textBox = commentaryEl.querySelector('[data-testid="expandable-text-box"]');
                                if (textBox) {
                                    // Clone to avoid modifying DOM
                                    const clone = textBox.cloneNode(true);
                                    // Remove "... more" button
                                    const moreButton = clone.querySelector('[data-testid="expandable-text-button"]');
                                    if (moreButton) {
                                        moreButton.remove();
                                    }
                                    return Utils.convertHtmlToText(clone.innerHTML);
                                }
                                return Utils.convertHtmlToText(commentaryEl.innerHTML);
                            }
                        },
                        () => {
                            // Old structure fallback
                            const contentDiv = card.querySelector('.update-components-text .break-words > span[dir="ltr"]');
                            if (contentDiv) {
                                return Utils.convertHtmlToText(contentDiv.innerHTML);
                            }
                        },
                        () => {
                            const contentDiv = card.querySelector('.feed-shared-text');
                            return contentDiv?.textContent.trim() || '';
                        },
                        () => {
                            const contentDiv = card.querySelector('[data-test-id="main-feed-activity-card__commentary"]');
                            return contentDiv?.textContent.trim() || '';
                        }
                    ];

                    for (const strategy of contentStrategies) {
                        try {
                            postContent = strategy();
                            if (postContent) break;
                        } catch (err) {
                            continue;
                        }
                    }

                    // Build post URL
                    const urlToPost = profileURL && postID ?
                        `https://www.linkedin.com/feed/update/urn:li:activity:${postID}` :
                        '';

                    const matchData = {
                        postID,
                        nameOfVIP: nameText,
                        profileURL: profileURL.startsWith('http') ? profileURL : (profileURL ? `https://www.linkedin.com${profileURL}` : ''),
                        profileId: profileId || '',
                        urlToPost,
                        postContent,
                        cardElement: card,
                        partialData: false
                    };

                    const missingFields = [];
                    if (!profileId) missingFields.push('profileId');
                    if (!profileURL) missingFields.push('profileURL');
                    if (!nameText) missingFields.push('name');
                    if (!postContent) missingFields.push('content');

                    if (missingFields.length > 0) {
                        matchData.partialData = true;
                        console.warn(`[LinkedIn AI] ⚠️ Partial data for ${nameText || postID}: missing ${missingFields.join(', ')}`);
                        warnings.push(`Partial data: ${postID} (missing ${missingFields.join(', ')})`);
                    }

                    if (!nameText && !profileId && !profileURL) {
                        console.warn(`[LinkedIn AI] ❌ Skipping post ${postID}: no identifiers found`);
                        return;
                    }

                    matches.push(matchData);

                } catch (err) {
                    console.warn('[LinkedIn AI] Error extracting card:', err);
                }
            });

            const elapsed = Math.round(performance.now() - startTime);
            const partialMatches = matches.filter(m => m.partialData).length;

            let statusMsg = `✅ Found ${matches.length} VIP post${matches.length !== 1 ? 's' : ''} in ${elapsed}ms`;
            if (partialMatches > 0) {
                statusMsg += ` (${partialMatches} with partial data)`;
            }
            onProgress?.(statusMsg);

            if (warnings.length > 0) {
                onProgress?.(`⚠️ ${warnings.length} warning${warnings.length !== 1 ? 's' : ''} - see console`);
                console.warn('[LinkedIn AI] Warnings:', warnings);
            }

            // Apply MAX_POSTS limit if configured
            const limitedMatches = CONFIG.MAX_POSTS ? matches.slice(0, CONFIG.MAX_POSTS) : matches;

            console.log(`[LinkedIn AI] VIP Search scrape complete: ${limitedMatches.length} matches (${matches.length} total), ${partialMatches} partial, ${warnings.length} warnings, ${elapsed}ms`);

            return {
                meta: {
                    totalCards: allCards.length,
                    finalMatchCount: limitedMatches.length,
                    partialDataCount: partialMatches,
                    elapsed: `${elapsed}ms`,
                    warnings,
                    strategy: 'VIP_SEARCH'
                },
                matches: limitedMatches
            };
        }

        // ───────────────────────────────────────────────────────────────────────────
        // NOTIFICATIONS SCRAPER (FALLBACK STRATEGY)
        // ───────────────────────────────────────────────────────────────────────────

        async function scrapeNotifications(onProgress) {
            const startTime = performance.now();
            const matches = [];
            const seenPostIDs = new Set();
            const warnings = [];

            onProgress?.('🔍 Starting notifications scraper...');

            const parent = findNotificationContainer();

            if (!parent) {
                onProgress?.('❌ Notification container not found (tried selectors + patterns)');
                warnings.push('Container not found');
                return { meta: { warnings, elapsed: 0, strategy: 'NOTIFICATIONS' }, matches: [] };
            }

            // Find scrollable element (prefer <main>, fallback to parent)
            const scrollableEl = document.querySelector('main') || parent;

            for (let round = 1; round <= 5; round++) {
                onProgress?.(`📜 Round ${round}/5: Scrolling...`);

                const start = scrollableEl.scrollTop;
                const end = scrollableEl.scrollHeight - scrollableEl.clientHeight;
                const duration = 180;
                const startT = performance.now();

                await new Promise(resolve => {
                    function animate(now) {
                        const progress = Math.min((now - startT) / duration, 1);
                        const ease = 1 - Math.pow(1 - progress, 3);
                        scrollableEl.scrollTo(0, start + (end - start) * ease);
                        if (progress < 1) requestAnimationFrame(animate);
                        else resolve();
                    }
                    requestAnimationFrame(animate);
                });

                await Utils.randomPause(600, 1200);

                const showMoreBtn = parent.querySelector('button.scaffold-finite-scroll__load-button');
                if (showMoreBtn && !showMoreBtn.disabled && showMoreBtn.offsetParent !== null) {
                    onProgress?.('🖱️ Clicking "Show more"...');
                    showMoreBtn.click();
                    await Utils.randomPause(800, 1400);
                } else if (round > 2) {
                    onProgress?.(`✓ No more content to load (round ${round})`);
                    break;
                }
            }

            onProgress?.('🔎 Extracting VIP posts...');

            const cardSelectors = [
                '[data-finite-scroll-hotkey-item]',
                '.nt-card',
                '[data-view-name="notification-card-container"]',
                'article.nt-card'
            ];

            let allCards = [];
            for (const selector of cardSelectors) {
                allCards = Array.from(document.querySelectorAll(selector));
                if (allCards.length > 0) {
                    console.log(`[LinkedIn AI] Found ${allCards.length} cards via selector: ${selector}`);
                    break;
                }
            }

            if (allCards.length === 0) {
                onProgress?.('⚠️ Selectors failed, trying pattern-based detection...');
                allCards = findPostsByPattern(parent);
                if (allCards.length > 0) {
                    console.log(`[LinkedIn AI] Found ${allCards.length} cards via pattern matching`);
                    warnings.push(`Selector fallback: used pattern detection`);
                } else {
                    onProgress?.('⚠️ No notification cards found (tried selectors + patterns)');
                    warnings.push('No cards found');
                }
            }

            allCards.forEach((card) => {
                try {
                    const profileData = extractProfileData(card);

                    let profileURL = profileData.url || '';
                    let profileId = '';
                    let nameText = profileData.name || '';

                    if (profileURL) {
                        const profileIdMatch = profileURL.match(/\/in\/([^\/\?]+)/);
                        profileId = profileIdMatch ? decodeURIComponent(profileIdMatch[1]) : '';
                    }

                    if (!nameText) {
                        const strongTag = card.querySelector('.nt-card__headline strong, strong, b');
                        nameText = strongTag?.textContent.trim() || '';
                    }

                    const headlineSpan = card.querySelector('.nt-card__headline span.nt-card__text--3-line');
                    const fullHeadline = headlineSpan?.textContent.trim() || '';

                    const postLink = card.querySelector('.nt-card__headline[href*="highlightedUpdateUrn"]');
                    const postURL = postLink?.getAttribute('href') || '';

                    let matchedVIP = null;
                    let matchMethod = '';

                    const isVIP = CONFIG.VIP_LIST.some(vip => {
                        if (typeof vip === 'object') {
                            if (profileId && vip.profileId) {
                                if (profileId.toLowerCase() === vip.profileId.toLowerCase()) {
                                    matchedVIP = vip;
                                    matchMethod = 'profileId';
                                    return true;
                                }
                            }

                            if (profileURL && vip.profileUrl) {
                                if (Utils.normalizeURL(profileURL) === Utils.normalizeURL(vip.profileUrl)) {
                                    matchedVIP = vip;
                                    matchMethod = 'profileUrl';
                                    return true;
                                }
                            }

                            if (nameText && vip.name) {
                                if (Utils.normalizeName(nameText) === Utils.normalizeName(vip.name)) {
                                    matchedVIP = vip;
                                    matchMethod = 'name';
                                    return true;
                                }
                            }

                            return false;
                        }

                        const vipStr = String(vip);
                        if (vipStr.includes('/')) {
                            return Utils.normalizeURL(vipStr) === Utils.normalizeURL(profileURL);
                        } else {
                            return Utils.normalizeName(vipStr) === Utils.normalizeName(nameText);
                        }
                    });

                    if (!isVIP) return;

                    // VIP matched successfully

                    if (!/posted:/i.test(fullHeadline)) return;

                    const postID = Utils.extractPostID(postURL);
                    if (!postID || seenPostIDs.has(postID)) return;

                    seenPostIDs.add(postID);

                    const contentMatch = fullHeadline.match(/posted:\s*(.+)$/is);
                    const postContent = contentMatch ? contentMatch[1].trim() : fullHeadline;

                    const matchData = {
                        postID,
                        nameOfVIP: nameText,
                        profileURL: profileURL.startsWith('http') ? profileURL : (profileURL ? `https://www.linkedin.com${profileURL}` : ''),
                        profileId: profileId || '',
                        urlToPost: postURL.startsWith('http') ? postURL : `https://www.linkedin.com${postURL}`,
                        postContent,
                        cardElement: card,
                        partialData: false
                    };

                    const missingFields = [];
                    if (!profileId) missingFields.push('profileId');
                    if (!profileURL) missingFields.push('profileURL');
                    if (!nameText) missingFields.push('name');

                    if (missingFields.length > 0) {
                        matchData.partialData = true;
                        console.warn(`[LinkedIn AI] ⚠️ Partial data for ${nameText || postID}: missing ${missingFields.join(', ')}`);
                        warnings.push(`Partial data: ${postID} (missing ${missingFields.join(', ')})`);
                    }

                    if (!nameText && !profileId && !profileURL) {
                        console.warn(`[LinkedIn AI] ❌ Skipping post ${postID}: no identifiers found`);
                        return;
                    }

                    matches.push(matchData);

                } catch (err) {
                    console.warn('[LinkedIn AI] Error extracting card:', err);
                }
            });

            const elapsed = Math.round(performance.now() - startTime);
            const partialMatches = matches.filter(m => m.partialData).length;

            let statusMsg = `✅ Found ${matches.length} VIP post${matches.length !== 1 ? 's' : ''} in ${elapsed}ms`;
            if (partialMatches > 0) {
                statusMsg += ` (${partialMatches} with partial data)`;
            }
            onProgress?.(statusMsg);

            if (warnings.length > 0) {
                onProgress?.(`⚠️ ${warnings.length} warning${warnings.length !== 1 ? 's' : ''} - see console`);
                console.warn('[LinkedIn AI] Warnings:', warnings);
            }

            if (matches.length === 0 && allCards.length > 0) {
                console.warn('[LinkedIn AI] No VIP matches found. Checked', allCards.length, 'cards against', CONFIG.VIP_LIST.length, 'VIPs');
                console.log('[LinkedIn AI] VIP List:', CONFIG.VIP_LIST);
            }

            // Apply MAX_POSTS limit if configured
            const limitedMatches = CONFIG.MAX_POSTS ? matches.slice(0, CONFIG.MAX_POSTS) : matches;

            console.log(`[LinkedIn AI] Notifications scrape complete: ${limitedMatches.length} matches (${matches.length} total), ${partialMatches} partial, ${warnings.length} warnings, ${elapsed}ms`);

            return {
                meta: {
                    totalCards: allCards.length,
                    finalMatchCount: limitedMatches.length,
                    partialDataCount: partialMatches,
                    elapsed: `${elapsed}ms`,
                    warnings,
                    strategy: 'NOTIFICATIONS'
                },
                matches: limitedMatches
            };
        }

        // ───────────────────────────────────────────────────────────────────────────
        // DUAL STRATEGY ORCHESTRATOR
        // ───────────────────────────────────────────────────────────────────────────

        async function scrapeWithStrategy(onProgress) {
            if (PAGE_TYPE === 'VIP_SEARCH') {
                onProgress?.('🎯 Using VIP Search Results strategy...');
                try {
                    const result = await scrapeVIPSearchResults(onProgress);
                    if (result.matches.length > 0) {
                        return result;
                    }
                    // If no matches, check if fallback is enabled
                    if (CONFIG.ENABLE_NOTIFICATIONS_FALLBACK) {
                        throw new Error('No VIP posts found in search results');
                    } else {
                        return result; // Return empty result, no fallback
                    }
                } catch (err) {
                    if (CONFIG.ENABLE_NOTIFICATIONS_FALLBACK) {
                        console.warn('[LinkedIn AI] VIP Search strategy failed:', err.message);
                        onProgress?.('⚠️ VIP Search failed, trying Notifications fallback...');
                        return await scrapeNotifications(onProgress);
                    } else {
                        console.warn('[LinkedIn AI] VIP Search strategy failed (fallback disabled):', err.message);
                        throw err; // Re-throw error, no fallback
                    }
                }
            } else if (PAGE_TYPE === 'NOTIFICATIONS') {
                if (CONFIG.ENABLE_NOTIFICATIONS_FALLBACK) {
                    onProgress?.('📬 Using Notifications strategy...');
                    return await scrapeNotifications(onProgress);
                } else {
                    throw new Error('Notifications scraping is disabled');
                }
            } else {
                throw new Error('Unsupported page type');
            }
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

            container.addEventListener('mousedown', () => {
                if (container.classList.contains('processing')) return;
                btnBack.style.transform = 'translateZ(20px) rotateZ(5deg) rotateX(-20deg) rotateY(-5deg)';
                btnFront.style.transform = 'translateZ(80px) translateY(-5px) rotateX(-5deg) rotateY(-10deg)';
            });

            container.addEventListener('mouseup', () => {
                if (container.classList.contains('processing')) return;
                btnBack.style.transform = 'translateZ(20px) rotateZ(8deg) rotateX(-20deg) rotateY(-5deg)';
                btnFront.style.transform = 'translateZ(80px) translateY(-5px) rotateX(5deg) rotateY(10deg)';
            });

            btnFront.addEventListener('click', () => {
                btnFront.style.pointerEvents = 'none';
                container.style.pointerEvents = 'none';

                createParticles(container);

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
        // FAB Click Handler
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
                const result = await retryWithBackoff(async (attempt) => {
                    if (attempt > 1) {
                        updateStatus(`🔄 Retry attempt ${attempt}/3...`);
                    }
                    return await scrapeWithStrategy(updateStatus);
                }, 3, 2000);

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

                // Scroll to top first
                updateStatus('📍 Scrolling to top...');
                const scrollableMain = document.querySelector('main');
                if (scrollableMain) {
                    await new Promise(resolve => {
                        const startY = scrollableMain.scrollTop;
                        const duration = 300;
                        const startTime = performance.now();

                        function animate(now) {
                            const progress = Math.min((now - startTime) / duration, 1);
                            const ease = 1 - Math.pow(1 - progress, 3);
                            scrollableMain.scrollTo(0, startY * (1 - ease));

                            if (progress < 1) {
                                requestAnimationFrame(animate);
                            } else {
                                resolve();
                            }
                        }
                        requestAnimationFrame(animate);
                    });
                }

                // Sequential reveal with scroll into view
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
                console.log('Scraped: ', serializablePosts);

                updateStatus('✅ Posts sent to worker!');

                setTimeout(() => {
                    statusOverlay.style.maxHeight = '0';
                    statusOverlay.style.opacity = '0';
                    statusOverlay.style.padding = '0';
                    container.classList.remove('processing');
                }, 2000);

            } catch (error) {
                console.error('[LinkedIn AI] Scraper failed after retries:', error);
                updateStatus(`❌ Error: ${error.message}`);

                if (error.message.includes('Container not found')) {
                    updateStatus('💡 Tip: Make sure you\'re on the right LinkedIn page');
                } else if (error.message.includes('No cards found')) {
                    updateStatus('💡 Tip: Try scrolling manually, then retry');
                } else {
                    updateStatus('💡 Tip: Refresh the page and try again');
                }

                setTimeout(() => {
                    statusOverlay.style.maxHeight = '0';
                    statusOverlay.style.opacity = '0';
                    statusOverlay.style.padding = '0';
                    container.classList.remove('processing');
                }, 5000);
            }
        }

        window.addEventListener('message', (event) => {
            if (!event.origin.includes(new URL(CONFIG.WORKER_URL).origin)) return;
            if (event.data.type === 'AI_RESPONSES') {
                console.log('[LinkedIn AI] ✅ Received AI responses:', event.data.posts);
            }
        });

        createEnhancedFAB();
        console.log(`[LinkedIn AI] 💡 Click the button to scan for VIP posts (${PAGE_TYPE} mode)`);
    }

    // ═════════════════════════════════════════════════════════════════════════════
    // POST PAGE - COMMENT INJECTION + TRACKING
    // ═════════════════════════════════════════════════════════════════════════════

    if (PAGE_TYPE === 'POST') {
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

                const container = document.createElement('div');
                container.className = 'li-border-container';

                const glowLayer = document.createElement('div');
                glowLayer.className = 'li-border-glow';

                target.parentNode.insertBefore(container, target);
                container.appendChild(glowLayer);
                container.appendChild(target);

                target.classList.add('li-border-active');

                const style = document.createElement('style');
                style.textContent = `
                    .li-border-container {
                        position: relative;
                        width: 100%;
                    }

                    .li-border-container .li-border-animated {
                        display: none;
                    }

                    .li-border-glow {
                        position: absolute;
                        inset: -12px;
                        border-radius: 8px;
                        overflow: hidden;
                        filter: blur(20px);
                        z-index: 0;
                        pointer-events: none;
                        animation: li-glow-fadeout 1s ease-out forwards;
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
                            transparent 4%
                        );
                        animation: li-border-rotate 1s cubic-bezier(0.49, 0.002, 0.454, 1.001);
                    }

                    .comments-comment-texteditor {
                        transition: border-color 1s ease;
                    }

                    .comments-comment-texteditor.li-border-active {
                        border-color: #d4ff00 !important;
                        animation: li-border-color-pulse 1s ease forwards;
                    }

                    .li-border-container > .comments-comment-texteditor {
                        position: relative;
                        z-index: 2;
                    }

                    @keyframes li-border-rotate {
                        100% {
                            transform: translate(-50%, -50%) rotate(360deg);
                        }
                    }

                    @keyframes li-glow-fadeout {
                        0% { opacity: 1; }
                        80% { opacity: 1; }
                        100% { opacity: 0; }
                    }

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
                const cleanedText = text.replace(/\n\s+\n/g, '\n\n').replace(/\n\s+/g, '\n');

                const lines = cleanedText.split('\n')
                    .map(line => line.trim())
                    .filter(line => line);

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
            }

            function createCycleButton(commentBox) {
                if (drafts.length === 1) {
                    return;
                }

                const commentContainer = document.querySelector('.comments-comment-texteditor');
                if (!commentContainer) {
                    console.error('[LinkedIn AI] Comment container not found!');
                    return;
                }

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

                btn.addEventListener('mouseenter', () => {
                    btn.style.transform = 'translateY(-2px) scale(1.05)';
                    btn.style.boxShadow = '0 6px 16px rgba(215, 255, 86, 0.5)';
                });

                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = 'translateY(0) scale(1)';
                    btn.style.boxShadow = '0 4px 12px rgba(215, 255, 86, 0.4)';
                });

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

                document.body.appendChild(btn);
            }

            function watchForPostSubmit(commentBox) {
                const observer = new MutationObserver(() => {
                    // Find the button within the same comment box container
                    const container = commentBox.closest('.comments-comment-box--cr') || commentBox.closest('form');
                    const postButton = container?.querySelector('button.comments-comment-box__submit-button--cr');

                    if (postButton && !postButton.hasAttribute('data-tracked')) {
                        postButton.setAttribute('data-tracked', 'true');
                        console.log('[LinkedIn AI] 📌 Tracking comment button');
                        postButton.addEventListener('click', () => {
                            console.log('[LinkedIn AI] 🖱️ Comment button clicked');

                            setTimeout(() => {
                                const finalComment = commentBox.innerText || commentBox.value || '';
                                const originalDraft = drafts[currentDraftIndex] || '';
                                const manualEdits = finalComment.trim() !== originalDraft.trim();

                                if (!finalComment.trim()) {
                                    console.warn('[LinkedIn AI] Comment is empty');
                                    return;
                                }

                                console.log('[LinkedIn AI] 📊 Comment data:', {
                                    postID: postData.postID,
                                    selectedDraft: currentDraftIndex + 1,
                                    length: finalComment.length,
                                    manualEdits
                                });

                                // Build tracking URL (same as manual tracking)
                                const trackParams = new URLSearchParams({
                                    action: 'track',
                                    postId: postData.postID,
                                    draft: (currentDraftIndex + 1).toString(),
                                    original: encodeURIComponent(originalDraft),
                                    comment: encodeURIComponent(finalComment),
                                    edited: manualEdits.toString()
                                });

                                // Open worker window with tracking data
                                window.open(
                                    `${CONFIG.WORKER_URL}?${trackParams.toString()}`,
                                    '_blank',
                                    'width=400,height=300'
                                );
                                console.log('[LinkedIn AI] ✅ Opened tracking window');
                            }, 500);
                        });
                    }
                });

                observer.observe(document.body, { childList: true, subtree: true });
            }

            (async () => {
                const parsedDrafts = parseDraftsFromURL();
                if (!parsedDrafts) {
                    console.log('[LinkedIn AI] No drafts in URL');
                    return;
                }

                console.log('[LinkedIn AI] Found', drafts.length, 'AI drafts');

                await new Promise(resolve => {
                    setTimeout(() => {
                        const btn = document.querySelector('.feed-shared-inline-show-more-text__see-more-less-toggle, button[aria-label*="see more"]');
                        if (btn) {
                            btn.click();
                            console.log('[LinkedIn AI] Clicked "Show more"');
                            setTimeout(resolve, 800);
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
            if (shouldActivateScraper) {
                document.getElementById('ai-assistant-fab')?.querySelector('.btn-front')?.click();
            }
        }
    });

    console.log(`[LinkedIn AI] v4.0 Initialized on ${PAGE_TYPE} page. Worker: ${CONFIG.WORKER_URL}`);

})();
