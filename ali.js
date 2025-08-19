// Loading Animation - Only show if actual resources are loading
        let resourcesLoaded = 0;
        let totalResources = 0;
        (function(){
        const overlay = document.getElementById('loadingOverlay');
        const loader = document.getElementById('pageLoader');
        const intro = document.getElementById('introLogo');
        const navLogo = document.getElementById('navLogo');

        // Minimum time to show loader (ms) for smooth UX
        const MIN_LOADER_MS = 800;

        // start time (so we can guarantee minimal loader display)
        const loaderShownAt = performance.now();

        // Safety fallback if load doesn't fire
        const MAX_WAIT = 8000;
        let fallbackTimeout = setTimeout(() => {
            // if window.load didn't happen, force start the sequence
            startSequence();
        }, MAX_WAIT);

        // When the page (all resources) finished loading
        window.addEventListener('load', () => {
            const elapsed = performance.now() - loaderShownAt;
            const wait = Math.max(0, MIN_LOADER_MS - elapsed);
            setTimeout(() => {
            clearTimeout(fallbackTimeout);
            startSequence();
            }, wait);
        });

        window.addEventListener('beforeunload', function() {
            window.scrollTo(0, 0);
        });

        // Start the sequence: hide loader, show intro logo, then animate logo -> nav + slide overlay
        function startSequence(){
            if (!overlay) return;
            // 1) fade out loader element softly
            if (loader) {
            loader.classList.add('hide');
            }

            // 2) after the loader fade, show intro logo
            setTimeout(() => {
            if (intro) intro.style.opacity = '1';

            // short pause so user senses the logo
            setTimeout(() => {
                animateLogoAndReveal();
            }, 530);
            }, 350);
        }

        function animateLogoAndReveal(){
            if (!overlay) return;

            // If navLogo or intro missing, just slide overlay away
            if (!intro || !navLogo) {
            // simple slide down and remove overlay
            overlay.animate([
                { transform: 'translateY(0%)' },
                { transform: 'translateY(100%)' }
            ], {
                duration: 900,
                easing: 'cubic-bezier(0.22,0.9,0.29,1)',
                fill: 'forwards'
            }).finished.then(() => {
                overlay.style.display = 'none';
                if (navLogo) navLogo.style.opacity = '1';
            });
            return;
            }

            // compute positions (centers)
            const introRect = intro.getBoundingClientRect();
            const targetRect = navLogo.getBoundingClientRect();
            const introCenterX = introRect.left + introRect.width / 2;
            const introCenterY = introRect.top + introRect.height / 2;
            const targetCenterX = targetRect.left + targetRect.width / 2;
            const targetCenterY = targetRect.top + targetRect.height / 2;

            const deltaX = targetCenterX - introCenterX;
            const deltaY = targetCenterY - introCenterY;

            // compute final scale (nav width / intro width)
            const finalScale = (targetRect.width / introRect.width) * 0.98; // tiny adjustment

            // animate logo: move + scale + soft rotate (subtle)
            const logoAnim = intro.animate([
            { transform: 'translate(-50%,-50%) scale(1) rotate(0deg)', opacity: 1 },
            { transform: `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px)) scale(${finalScale}) rotate(6deg)`, opacity: 1 },
            { transform: `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px)) scale(${finalScale}) rotate(6deg)`, opacity: 0.98 }
            ], {
            duration: 1000,
            easing: 'cubic-bezier(0.22,0.9,0.29,1)',
            fill: 'forwards'
            });

            // animate overlay: تنزل لتكشف الصفحة بسلاسة
            const overlayAnim = overlay.animate([
            { transform: 'translateY(0%)' },
            { transform: 'translateY(100%)' }
            ], {
            duration: 1000,
            easing: 'cubic-bezier(0.22,0.9,0.29,1)',
            fill: 'forwards'
            });

            // عند انتهاء كلا الأنميشنين
            Promise.all([logoAnim.finished, overlayAnim.finished]).then(() => {
            // نظهر الشعار الصغير في الـ navbar
            navLogo.style.opacity = '1';

            // نزيل الـ overlay و العنصر المؤقت
            overlay.style.display = 'none';
            try { intro.remove(); } catch(e){ /* ignore */ }
            });
        }
        })();

        // Page Navigation
        function showPage(pageId) {
            // Hide all pages
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => page.classList.remove('active'));
            
            // Show selected page
            document.getElementById(pageId).classList.add('active');
            
            // Update nav buttons
            const buttons = document.querySelectorAll('.nav-button');
            buttons.forEach(button => button.classList.remove('active'));
            event.target.classList.add('active');
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Trigger animations for new page
            setTimeout(() => {
                observeElements();
            }, 100);

              document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
  
            // إضافة الإضاءة للزر الذي ضغطت عليه
            document.querySelector(`.nav-button[onclick="showPage('${pageId}')"]`).classList.add('active');
        }

        // Intersection Observer for animations
        function observeElements() {
            const sections = document.querySelectorAll('.section');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            sections.forEach(section => {
                section.classList.remove('visible');
                observer.observe(section);
            });
        }

        // Initialize animations
        document.addEventListener('DOMContentLoaded', function() {
            observeElements();
            
            // Add stagger effect to service cards
            const serviceCards = document.querySelectorAll('.service-card');
            serviceCards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
            });
            
            // Add parallax effect to profile image
            window.addEventListener('scroll', function() {
                const scrolled = window.pageYOffset;
                const profileImage = document.querySelector('.profile-image');
                if (profileImage) {
                    profileImage.style.transform = `translateY(${scrolled * 0.1}px) rotate(${scrolled * 0.05}deg)`;
                }
            });
        });

        // Add smooth hover effects
        document.addEventListener('mousemove', function(e) {
            const cards = document.querySelectorAll('.service-card, .project-card, .contact-card, .feature-card');
            
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                card.style.setProperty('--mouse-x', x + 'px');
                card.style.setProperty('--mouse-y', y + 'px');
            });
        });

        // Add ripple effect to buttons
        document.querySelectorAll('.nav-button').forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.style.position = 'absolute';
                ripple.style.borderRadius = '50%';
                ripple.style.background = 'rgba(255,255,255,0.6)';
                ripple.style.transform = 'scale(0)';
                ripple.style.animation = 'ripple 0.6s linear';
                ripple.style.pointerEvents = 'none';
                
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });

        // Add typing animation to hero text
        function typeWriter(element, text, speed = 50) {
            let i = 0;
            element.innerHTML = '';
            
            function type() {
                if (i < text.length) {
                    element.innerHTML += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                }
            }
            type();
        }

        // Initialize typing animation after loading
        setTimeout(() => {
            const heroTitle = document.querySelector('.profile-text h1');
            if (heroTitle) {
                const originalText = heroTitle.textContent;
                typeWriter(heroTitle, originalText, 100);
            }
        }, 2000);

        // Add magnetic effect to nav buttons
        document.querySelectorAll('.nav-button').forEach(button => {
            button.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                this.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1.1)`;
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
        });

        // Add particle animation background
        function createParticles() {
            const particleContainer = document.createElement('div');
            particleContainer.style.position = 'fixed';
            particleContainer.style.top = '0';
            particleContainer.style.left = '0';
            particleContainer.style.width = '100%';
            particleContainer.style.height = '100%';
            particleContainer.style.pointerEvents = 'none';
            particleContainer.style.zIndex = '1';
            document.body.appendChild(particleContainer);

            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.style.position = 'absolute';
                particle.style.width = Math.random() * 4 + 1 + 'px';
                particle.style.height = particle.style.width;
                particle.style.background = 'rgba(255,255,255,0.1)';
                particle.style.borderRadius = '50%';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animation = `float ${Math.random() * 10 + 5}s linear infinite`;
                particle.style.animationDelay = Math.random() * 5 + 's';
                
                particleContainer.appendChild(particle);
            }
        }

        // Initialize particles
        setTimeout(createParticles, 1500);

        // Add 3D tilt effect to cards
        document.querySelectorAll('.service-card, .project-card, .feature-card').forEach(card => {
            card.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.02)`;
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
        });

        // Add scroll-triggered counter animation for stats
        function animateCounters() {
            const stats = [
                { element: '.projects-completed', target: 150, suffix: '+' },
                { element: '.years-experience', target: 15, suffix: ' Years' },
                { element: '.happy-clients', target: 300, suffix: '+' },
                { element: '.awards-won', target: 25, suffix: ' Awards' }
            ];

            stats.forEach(stat => {
                const element = document.querySelector(stat.element);
                if (element) {
                    let current = 0;
                    const increment = stat.target / 50;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= stat.target) {
                            current = stat.target;
                            clearInterval(timer);
                        }
                        element.textContent = Math.floor(current) + stat.suffix;
                    }, 50);
                }
            });
        }

        // Add CSS animations for ripple effect
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
            
            .nav-button {
                position: relative;
                overflow: hidden;
            }
            
            /* Enhanced particle animation */
            @keyframes floatParticles {
                0% {
                    transform: translateY(100vh) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100px) rotate(360deg);
                    opacity: 0;
                }
            }
            
            /* Glowing border animation */
            @keyframes glow {
                0%, 100% { box-shadow: 0 0 20px rgba(255, 127, 80, 0.4); }
                50% { box-shadow: 0 0 40px rgba(135, 206, 235, 0.6); }
            }
            
            .service-card:hover, .project-card:hover, .feature-card:hover {
                animation: glow 2s ease-in-out infinite;
            }
            
            /* Enhanced loading animation */
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
        `;
        document.head.appendChild(style);

        // Enhanced scroll animations with different directions
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const slideInObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    entry.target.style.animationDelay = `${index * 0.2}s`;
                    entry.target.classList.add('slide-in-visible');
                }
            });
        }, observerOptions);

        // Apply different animations to different elements
        setTimeout(() => {
            document.querySelectorAll('.service-card').forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = `translateX(${index % 2 === 0 ? '-' : ''}100px)`;
                card.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                slideInObserver.observe(card);
            });

            document.querySelectorAll('.project-card').forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8) rotate(5deg)';
                card.style.transition = 'all 0.6s ease-out';
                slideInObserver.observe(card);
            });

            document.querySelectorAll('.feature-card').forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(50px)';
                card.style.transition = `all 0.8s ease-out ${index * 0.1}s`;
                slideInObserver.observe(card);
            });
        }, 100);

        // Add slide-in-visible styles
        const slideStyles = document.createElement('style');
        slideStyles.textContent = `
            .slide-in-visible {
                opacity: 1 !important;
                transform: none !important;
            }
        `;
        document.head.appendChild(slideStyles);



let next = document.querySelector('.next');
let prev = document.querySelector('.prev');
let slide = document.querySelector('.slide');

next.addEventListener('click', function(){
    let items = document.querySelectorAll('.item');
    // آخر عنصر ما يختفي، ينضاف بعد الأخير
    slide.appendChild(items[0]); 
});

prev.addEventListener('click', function(){
    let items = document.querySelectorAll('.item');
    // أول عنصر ما يختفي، ينضاف قبل الأول
    slide.insertBefore(items[items.length - 1], items[0]);
});


document.querySelectorAll('.certificate-image,.certificate-image_1').forEach(container => {
  const imgs = container.querySelectorAll('img');
  if (imgs.length < 2) return; // ما يشتغل إلا إذا في أكثر من صورة

  let index = 0;

  setInterval(() => {
    imgs[index].classList.remove('active');
    index = (index + 1) % imgs.length;
    imgs[index].classList.add('active');
  }, 5000); // كل 5 ثواني
});


