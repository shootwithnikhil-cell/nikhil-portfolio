document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Video Grid Generation ---
    const videoGrid = document.getElementById('video-grid');

    // Utility function to extract YouTube video ID from various URL formats
    function extractYouTubeId(url) {
        if (!url) return null;
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    // Function to construct thumbnail URL
    function getThumbnailUrl(videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    // Render video cards
    if (typeof videoData !== 'undefined' && videoGrid) {
        videoData.forEach((data, index) => {
            const videoId = extractYouTubeId(data.url);
            // Use the explicit image filename defined in data.js
            // If it doesn't exist yet, it will fallback to the aesthetic placeholder using the onerror event.
            const localThumbnailUrl = `public/${data.image}`;
            const fallbackThumbnailUrl = `https://picsum.photos/seed/${index + 101}/640/360`;

            const cardHTML = `
                <div class="video-card" data-index="${index}" data-video-id="${videoId || ''}">
                    <div class="thumbnail-container">
                         <img src="${localThumbnailUrl}" onerror="this.onerror=null; this.src='${fallbackThumbnailUrl}';" alt="${data.project} Thumbnail" loading="lazy">
                    </div>
                    <div class="video-info">
                        <span class="video-role">${data.role}</span>
                        <span class="video-project">- ${data.project}</span>
                    </div>
                </div>
            `;
            videoGrid.insertAdjacentHTML('beforeend', cardHTML);
        });
    }

    // --- 2. Lightbox Modal Logic ---
    const modal = document.getElementById('video-modal');
    const closeBtn = document.querySelector('.close-btn');
    const iframe = document.getElementById('youtube-iframe');

    function openModal(videoId) {
        if (!videoId || videoId === 'null') return;

        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        
        modal.style.display = 'block';
        
        const wrapper = modal.querySelector('.video-wrapper');
        wrapper.innerHTML = `
            <iframe 
                id="youtube-iframe" 
                width="100%" 
                height="100%" 
                src="${embedUrl}" 
                title="YouTube video player"
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerpolicy="no-referrer-when-downgrade" 
                allowfullscreen>
            </iframe>`;
        
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            // Clear the iframe to kill audio immediately
            const wrapper = modal.querySelector('.video-wrapper');
            wrapper.innerHTML = ''; 
        }, 300);
    }

    // Event Delegation for dynamically created video cards
    videoGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.video-card');
        if (card) {
            const videoId = card.getAttribute('data-video-id');
            openModal(videoId);
        }
    });

    closeBtn.addEventListener('click', closeModal);

    // Close modal if clicking outside the video content
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // --- 3. Smooth Scrolling for Navigation ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');

            if (href === '#home') {
                // WORK link: scroll all the way to the top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    // Manual offset calculation to account for the sticky header
                    const headerOffset = 120; // Safe distance for the sticky nav
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // --- 4. Navigation & Header Scroll Logic ---
    const mainHeader = document.getElementById('main-header');
    const navLinks = document.querySelectorAll('.site-nav a[data-section]');
    const sections = document.querySelectorAll('section[id]');
    let isScrolledData = false;

    const updateActiveNav = () => {
        // 1. Header Sticky Styling (Hysteresis)
        if (window.scrollY > 80 && !isScrolledData) {
            mainHeader.classList.add('scrolled');
            isScrolledData = true;
        } else if (window.scrollY <= 10 && isScrolledData) {
            mainHeader.classList.remove('scrolled');
            isScrolledData = false;
        }

        // 2. Active Section Highlighting
        // We use a scroll offset (e.g., 30% of viewport) to trigger the next section early
        const scrollPos = window.scrollY + (window.innerHeight * 0.3);
        let currentSectionId = 'work'; // Default to work

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const id = section.getAttribute('id');
            
            if (scrollPos >= sectionTop) {
                // Map 'home' and 'work' both to the "WORK" navigation link
                if (id === 'home' || id === 'work') {
                    currentSectionId = 'work';
                } else {
                    currentSectionId = id;
                }
            }
        });

        // 3. Force-activate "Let's Collaborate" when at the absolute bottom
        const atBottom = (window.innerHeight + window.scrollY) >= document.body.scrollHeight - 100;
        if (atBottom) {
            currentSectionId = 'contact';
        }

        // Apply classes
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === currentSectionId) {
                link.classList.add('active');
            }
        });
    };

    // Listen for scroll events
    window.addEventListener('scroll', updateActiveNav);
    
    // Initial call to set state on load
    updateActiveNav();

    // --- 5. Hamburger Menu Logic ---
    const hamburger = document.getElementById('hamburger');
    const navUl = document.getElementById('nav-ul');

    if (hamburger && navUl) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navUl.classList.toggle('active');
        });

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navUl.classList.remove('active');
            });
        });
    }

});
