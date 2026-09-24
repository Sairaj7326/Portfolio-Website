/**
 * SAIRAJ AMAR PAWAR // PORTFOLIO SCRIPT ENGINE
 * Dynamic & Movable Interactive Background Canvas, Mouse Spotlight,
 * Physics Particle Mesh, Custom Cursor, Dynamic Typing & HUD Controls.
 */

(function () {
    'use strict';

    // Mark body as JS-loaded for scroll-reveal animations
    document.body.classList.add('js-loaded');

    // =========================================================================
    // 1. DYNAMIC & MOVABLE INTERACTIVE BACKGROUND CANVAS (OPTIMIZED)
    // =========================================================================
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d', { alpha: true });
        let width = 0;
        let height = 0;
        const isMobile = window.innerWidth <= 768 || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        let dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 2);
        let isRunning = true;

        // Mouse physics coordinates
        const mouse = {
            x: -1000,
            y: -1000,
            targetX: -1000,
            targetY: -1000,
            radius: isMobile ? 110 : 160,
            isActive: false
        };

        // Click shockwaves pool
        const shockwaves = [];

        // Particles collection
        const particles = [];
        const PARTICLE_COUNT = isMobile 
            ? Math.min(24, Math.floor((window.innerWidth * window.innerHeight) / 32000))
            : Math.min(55, Math.floor((window.innerWidth * window.innerHeight) / 18000));

        // Geometric tech floating shapes
        const techShapes = [];
        const SHAPE_COUNT = isMobile ? 2 : 5;

        const colorPalette = [
            { r: 99, g: 102, b: 241 },   // Indigo
            { r: 14, g: 165, b: 233 },   // Cyan / Azure
            { r: 139, g: 92, b: 246 },  // Violet
            { r: 16, g: 185, b: 129 }   // Emerald
        ];

        class Particle {
            constructor() {
                this.init(true);
            }

            init(randomY = false) {
                this.x = Math.random() * width;
                this.y = randomY ? Math.random() * height : height + 10;
                this.baseX = this.x;
                this.baseY = this.y;

                // 3D Depth layering (0.4 to 1.0)
                this.depth = 0.4 + Math.random() * 0.6;
                this.size = (1.2 + Math.random() * 2.0) * this.depth;

                // Smooth drifting velocities
                this.vx = (Math.random() - 0.5) * 0.5 * this.depth;
                this.vy = -(0.2 + Math.random() * 0.4) * this.depth;

                // Color from curated palette
                this.color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
                this.alpha = 0.3 + Math.random() * 0.4;
                this.baseAlpha = this.alpha;

                // Pulse phase
                this.pulsePhase = Math.random() * Math.PI * 2;
                this.pulseSpeed = 0.02 + Math.random() * 0.03;

                // Elastic displacement
                this.dx = 0;
                this.dy = 0;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Soft breathing pulse
                this.pulsePhase += this.pulseSpeed;
                this.alpha = this.baseAlpha + Math.sin(this.pulsePhase) * 0.12;

                // Screen wrapping with buffer
                if (this.x < -20) this.x = width + 20;
                if (this.x > width + 20) this.x = -20;
                if (this.y < -20) {
                    this.y = height + 20;
                    this.x = Math.random() * width;
                }

                // Interactive Mouse Physics
                if (mouse.isActive) {
                    const diffX = mouse.x - this.x;
                    const diffY = mouse.y - this.y;
                    const dist = Math.hypot(diffX, diffY);

                    if (dist < mouse.radius && dist > 0) {
                        const force = (1 - dist / mouse.radius);
                        const angle = Math.atan2(diffY, diffX);
                        const pushStrength = force * 5.0 * this.depth;

                        this.dx -= Math.cos(angle) * pushStrength;
                        this.dy -= Math.sin(angle) * pushStrength;
                    }
                }

                // Shockwave reaction
                for (let i = 0; i < shockwaves.length; i++) {
                    const sw = shockwaves[i];
                    const distToWave = Math.hypot(sw.x - this.x, sw.y - this.y);
                    const waveDistDiff = Math.abs(distToWave - sw.radius);

                    if (waveDistDiff < 20) {
                        const waveForce = (1 - sw.radius / sw.maxRadius) * 3;
                        const angle = Math.atan2(this.y - sw.y, this.x - sw.x);
                        this.dx += Math.cos(angle) * waveForce;
                        this.dy += Math.sin(angle) * waveForce;
                    }
                }

                this.x += this.dx;
                this.y += this.dy;
                this.dx *= 0.88;
                this.dy *= 0.88;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, Math.max(0.6, this.size), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${Math.max(0, this.alpha)})`;
                ctx.fill();
            }
        }

        // Floating geometric wireframe polygon nodes
        class TechShape {
            constructor() {
                this.init();
            }

            init() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = 16 + Math.random() * 24;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotSpeed = (Math.random() - 0.5) * 0.006;
                this.vx = (Math.random() - 0.5) * 0.25;
                this.vy = (Math.random() - 0.5) * 0.2;
                this.sides = Math.random() > 0.5 ? 3 : 6;
                this.color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
                this.alpha = 0.08 + Math.random() * 0.1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.rotation += this.rotSpeed;

                if (this.x < -40) this.x = width + 40;
                if (this.x > width + 40) this.x = -40;
                if (this.y < -40) this.y = height + 40;
                if (this.y > height + 40) this.y = -40;
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.beginPath();

                for (let i = 0; i < this.sides; i++) {
                    const angle = (i * 2 * Math.PI) / this.sides;
                    const px = Math.cos(angle) * this.size;
                    const py = Math.sin(angle) * this.size;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }

                ctx.closePath();
                ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`;
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha * 1.5})`;
                ctx.fill();

                ctx.restore();
            }
        }

        // Click Shockwave
        class Shockwave {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.radius = 0;
                this.maxRadius = isMobile ? 140 : 220;
                this.speed = isMobile ? 6 : 7;
                this.alpha = 0.5;
            }

            update() {
                this.radius += this.speed;
                this.alpha = 0.5 * (1 - this.radius / this.maxRadius);
            }

            draw() {
                if (this.alpha <= 0) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(56, 189, 248, ${this.alpha})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        }

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            const mobileCheck = width <= 768;
            dpr = Math.min(window.devicePixelRatio || 1, mobileCheck ? 1.25 : 2);

            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';

            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
        }

        function initParticles() {
            particles.length = 0;
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push(new Particle());
            }

            techShapes.length = 0;
            for (let i = 0; i < SHAPE_COUNT; i++) {
                techShapes.push(new TechShape());
            }
        }

        // Connective dynamic neural energy filaments
        function drawConnectiveWeb() {
            const maxDist = isMobile ? 75 : 110;
            const mouseMaxDist = isMobile ? 90 : 135;

            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

                    if (dist < maxDist) {
                        const alpha = (1 - dist / maxDist) * 0.18 * Math.min(p1.alpha, p2.alpha);
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
                        ctx.lineWidth = 0.65;
                        ctx.stroke();
                    }
                }

                if (mouse.isActive) {
                    const distToMouse = Math.hypot(p1.x - mouse.x, p1.y - mouse.y);
                    if (distToMouse < mouseMaxDist) {
                        const alpha = (1 - distToMouse / mouseMaxDist) * 0.28;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.strokeStyle = `rgba(14, 165, 233, ${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }
        }

        // Main animation loop
        function animate() {
            if (!isRunning) return;

            ctx.clearRect(0, 0, width, height);

            mouse.x += (mouse.targetX - mouse.x) * 0.12;
            mouse.y += (mouse.targetY - mouse.y) * 0.12;

            for (let i = 0; i < techShapes.length; i++) {
                techShapes[i].update();
                techShapes[i].draw();
            }

            drawConnectiveWeb();

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }

            for (let i = shockwaves.length - 1; i >= 0; i--) {
                const sw = shockwaves[i];
                sw.update();
                sw.draw();
                if (sw.radius >= sw.maxRadius) {
                    shockwaves.splice(i, 1);
                }
            }

            requestAnimationFrame(animate);
        }

        // Pause canvas when user switches tabs to conserve mobile battery & memory
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                isRunning = false;
            } else {
                isRunning = true;
                requestAnimationFrame(animate);
            }
        });

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                resize();
                initParticles();
            }, 150);
        }, { passive: true });

        // Pointer / Touch tracking
        let rafMouse;
        function updateCssVars(x, y) {
            if (rafMouse) cancelAnimationFrame(rafMouse);
            rafMouse = requestAnimationFrame(() => {
                document.documentElement.style.setProperty('--mouse-x', `${(x / window.innerWidth) * 100}%`);
                document.documentElement.style.setProperty('--mouse-y', `${(y / window.innerHeight) * 100}%`);
            });
        }

        window.addEventListener('mousemove', (e) => {
            mouse.targetX = e.clientX;
            mouse.targetY = e.clientY;
            mouse.isActive = true;
            updateCssVars(e.clientX, e.clientY);
        }, { passive: true });

        window.addEventListener('mouseleave', () => {
            mouse.isActive = false;
            mouse.targetX = -1000;
            mouse.targetY = -1000;
        });

        window.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches[0]) {
                mouse.targetX = e.touches[0].clientX;
                mouse.targetY = e.touches[0].clientY;
                mouse.isActive = true;
            }
        }, { passive: true });

        window.addEventListener('touchend', () => {
            mouse.isActive = false;
        }, { passive: true });

        // Click shockwave trigger
        window.addEventListener('pointerdown', (e) => {
            if (!e.target.closest('button, a, input, textarea')) {
                shockwaves.push(new Shockwave(e.clientX, e.clientY));
            }
        }, { passive: true });

        resize();
        initParticles();
        animate();
    }

    // =========================================================================
    // 2. DYNAMIC MOVABLE SPOTLIGHT GLOW (DESKTOP ONLY)
    // =========================================================================
    const mouseGlow = document.getElementById('mouseGlow');
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

    if (mouseGlow && hasFinePointer) {
        let glowX = window.innerWidth / 2;
        let glowY = window.innerHeight / 2;
        let targetX = glowX;
        let targetY = glowY;

        window.addEventListener('mousemove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
        }, { passive: true });

        function updateGlow() {
            glowX += (targetX - glowX) * 0.08;
            glowY += (targetY - glowY) * 0.08;
            mouseGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`;
            requestAnimationFrame(updateGlow);
        }
        updateGlow();
    }

    // =========================================================================
    // 3. CUSTOM GLOWING CURSOR (DESKTOP ONLY)
    // =========================================================================
    const cursorDot = document.getElementById('cursorDot');
    const cursorOutline = document.getElementById('cursorOutline');

    if (cursorDot && cursorOutline && hasFinePointer) {
        let cursorX = window.innerWidth / 2;
        let cursorY = window.innerHeight / 2;
        let mouseX = cursorX;
        let mouseY = cursorY;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        }, { passive: true });

        function animateOutline() {
            cursorX += (mouseX - cursorX) * 0.18;
            cursorY += (mouseY - cursorY) * 0.18;
            cursorOutline.style.left = `${cursorX}px`;
            cursorOutline.style.top = `${cursorY}px`;
            requestAnimationFrame(animateOutline);
        }
        animateOutline();

        // Cursor hover scale on interactive elements
        const hoverTargets = document.querySelectorAll('a, button, input, textarea, .tilt-card, .contact-card');
        hoverTargets.forEach((el) => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }

    // =========================================================================
    // 4. HERO SECTION DYNAMIC TYPEWRITER EFFECT
    // =========================================================================
    const typedTextEl = document.getElementById('typedText');
    if (typedTextEl) {
        const phrases = [
            'Software Developer',
            'Full Stack Web Engineer',
            'Database & Systems Specialist',
            'Algorithmic Problem Solver'
        ];

        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingDelay = 80;

        function typeLoop() {
            const currentPhrase = phrases[phraseIndex];

            if (isDeleting) {
                typedTextEl.textContent = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
                typingDelay = 40;
            } else {
                typedTextEl.textContent = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
                typingDelay = 80;
            }

            if (!isDeleting && charIndex === currentPhrase.length) {
                typingDelay = 1800; // Pause at full word
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typingDelay = 400; // Pause before next word
            }

            setTimeout(typeLoop, typingDelay);
        }

        setTimeout(typeLoop, 500);
    }

    // =========================================================================
    // 5. LIVE SYSTEM CLOCK (IST)
    // =========================================================================
    const clockTime = document.getElementById('clockTime');
    if (clockTime) {
        function updateClock() {
            const now = new Date();
            // Format to IST
            const options = {
                timeZone: 'Asia/Kolkata',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            };
            const timeStr = now.toLocaleTimeString('en-US', options);
            clockTime.textContent = timeStr;
        }
        setInterval(updateClock, 1000);
        updateClock();
    }

    // =========================================================================
    // 6. CARD INTERACTIONS (STEADY TEMPLATE - CURSOR TILT DISABLED)
    // =========================================================================
    // Card tilt on cursor movement has been disabled to keep the template steady.

    // =========================================================================
    // 7. MOBILE NAVIGATION DRAWER
    // =========================================================================
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');

    if (mobileMenuBtn && mobileDrawer) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = mobileDrawer.classList.toggle('open');
            mobileMenuBtn.classList.toggle('active', isOpen);
        });

        // Close on navigation link click
        mobileDrawer.querySelectorAll('.mobile-nav-link').forEach((link) => {
            link.addEventListener('click', () => {
                mobileDrawer.classList.remove('open');
                mobileMenuBtn.classList.remove('active');
            });
        });
    }

    // =========================================================================
    // 8. TOAST NOTIFICATIONS & COPY EMAIL ACTION
    // =========================================================================
    const toastContainer = document.getElementById('toastContainer');

    function showToast(message, icon = 'fas fa-check-circle') {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'cyber-toast';
        toast.innerHTML = `<i class="${icon}"></i> <span>${message}</span>`;
        toastContainer.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => toast.classList.add('visible'));

        // Auto remove
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 400);
        }, 3200);
    }

    const copyEmailCard = document.getElementById('copyEmailCard');
    const copyEmailBtn = document.getElementById('copyEmailBtn');
    const emailVal = document.getElementById('emailVal');

    function copyEmail() {
        const textToCopy = emailVal ? emailVal.textContent.trim() : 'sairaj7326@gmail.com';
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast('Email address copied to clipboard!', 'fas fa-copy');
            }).catch(() => {
                showToast('Email: sairaj7326@gmail.com', 'fas fa-envelope');
            });
        } else {
            showToast('Email: sairaj7326@gmail.com', 'fas fa-envelope');
        }
    }

    if (copyEmailCard) copyEmailCard.addEventListener('click', copyEmail);
    if (copyEmailBtn) copyEmailBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyEmail();
    });

    const copyPhoneCard = document.getElementById('copyPhoneCard');
    const copyPhoneBtn = document.getElementById('copyPhoneBtn');
    const phoneVal = document.getElementById('phoneVal');

    function copyPhone() {
        const textToCopy = phoneVal ? phoneVal.textContent.replace('+91', '').trim() : '8484873166';
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast('Mobile number copied: ' + textToCopy, 'fas fa-phone-alt');
            }).catch(() => {
                showToast('Mobile: 8484873166', 'fas fa-phone-alt');
            });
        } else {
            showToast('Mobile: 8484873166', 'fas fa-phone-alt');
        }
    }

    if (copyPhoneCard) copyPhoneCard.addEventListener('click', copyPhone);
    if (copyPhoneBtn) copyPhoneBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyPhone();
    });

    // =========================================================================
    // 9. CONTACT FORM INTERACTION
    // =========================================================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="btn-content"><i class="fas fa-spinner fa-spin"></i> TRANSMITTING...</span>';
            }

            setTimeout(() => {
                showToast('Transmission received! Sairaj will respond shortly.', 'fas fa-paper-plane');
                contactForm.reset();
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<span class="btn-glow"></span><span class="btn-content"><i class="fas fa-satellite-dish"></i> SEND TRANSMISSION</span>';
                }
            }, 1000);
        });
    }

    // =========================================================================
    // 10. BACK TO TOP BUTTON
    // =========================================================================
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // =========================================================================
    // 11. CANDIDATE RESUME MODAL CONTROLS (INTERVIEWS & RECRUITERS)
    // =========================================================================
    const resumeModalOverlay = document.getElementById('resumeModalOverlay');
    const openResumeTriggers = [
        document.getElementById('navResumeBtn'),
        document.getElementById('heroResumeBtn'),
        document.getElementById('mobileResumeBtn')
    ];
    const closeResumeBtn = document.getElementById('closeResumeBtn');
    const modalDismissBtn = document.getElementById('modalDismissBtn');
    const printResumeBtn = document.getElementById('printResumeBtn');

    function openResumeModal() {
        if (!resumeModalOverlay) return;
        resumeModalOverlay.classList.add('active');
        resumeModalOverlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeResumeModal() {
        if (!resumeModalOverlay) return;
        resumeModalOverlay.classList.remove('active');
        resumeModalOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    openResumeTriggers.forEach((btn) => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openResumeModal();
            });
        }
    });

    if (closeResumeBtn) closeResumeBtn.addEventListener('click', closeResumeModal);
    if (modalDismissBtn) modalDismissBtn.addEventListener('click', closeResumeModal);

    if (resumeModalOverlay) {
        resumeModalOverlay.addEventListener('click', (e) => {
            if (e.target === resumeModalOverlay) {
                closeResumeModal();
            }
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && resumeModalOverlay && resumeModalOverlay.classList.contains('active')) {
            closeResumeModal();
        }
    });

    if (printResumeBtn) {
        printResumeBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // =========================================================================
    // 12. HERO NAME CYBER GLOW & SCROLL TOPIC ELEVATION OBSERVER
    // =========================================================================
    // A. Hero Name Cyber Glow Interactive Trigger
    const heroName = document.getElementById('heroCandidateName');
    if (heroName) {
        heroName.addEventListener('click', () => {
            heroName.classList.remove('cyber-pulse', 're-popup');
            void heroName.offsetWidth; // force reflow
            heroName.classList.add('cyber-pulse', 're-popup');
        });
    }

    // B. Scroll Topic Elevation & Floating Active Topic HUD
    const sectionHeaders = document.querySelectorAll('.section-header');
    const scrollTopicHud = document.getElementById('scrollTopicHud');
    const hudTopicName = document.getElementById('hudTopicName');

    const topicLabels = {
        'about': 'About Candidate',
        'education': 'Educational Timeline',
        'skills': 'Technical Skills',
        'projects': 'Featured Projects',
        'contact': 'Transmission Uplink'
    };

    if ('IntersectionObserver' in window) {
        // Section Header Scroll Elevation Observer
        const headerObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('topic-revealed', 'topic-popped');
                    
                    const parentSec = entry.target.closest('section');
                    if (parentSec && parentSec.id && topicLabels[parentSec.id]) {
                        updateTopicHud(topicLabels[parentSec.id]);
                    }
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
        });

        sectionHeaders.forEach((header) => headerObserver.observe(header));

        // Active Section Tracker for Floating HUD
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const secId = entry.target.id;
                    if (secId === 'hero') {
                        if (scrollTopicHud) scrollTopicHud.classList.remove('visible');
                    } else if (topicLabels[secId]) {
                        updateTopicHud(topicLabels[secId]);
                    }
                }
            });
        }, {
            threshold: 0.2
        });

        document.querySelectorAll('section[id]').forEach((sec) => sectionObserver.observe(sec));
    } else {
        sectionHeaders.forEach((header) => header.classList.add('topic-revealed', 'topic-popped'));
    }

    let lastTopic = '';
    function updateTopicHud(topicName) {
        if (!scrollTopicHud || !hudTopicName) return;
        scrollTopicHud.classList.add('visible');
        if (lastTopic !== topicName) {
            lastTopic = topicName;
            hudTopicName.textContent = topicName;
            scrollTopicHud.classList.remove('hud-active', 'hud-pop');
            void scrollTopicHud.offsetWidth;
            scrollTopicHud.classList.add('hud-active', 'hud-pop');
        }
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY < 180 && scrollTopicHud) {
            scrollTopicHud.classList.remove('visible');
        }
    }, { passive: true });

})();
