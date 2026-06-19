const menuToggle = document.querySelector('[data-menu-toggle]');
const navLinks = document.querySelector('[data-nav-links]');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('is-open');
        document.body.classList.toggle('menu-open', navLinks.classList.contains('is-open'));
    });
}

const currentFile = window.location.pathname.split('/').pop() || 'index.html';
for (const link of document.querySelectorAll('.nav-links a')) {
    const href = link.getAttribute('href') || '';
    if (href.endsWith(currentFile)) {
        link.classList.add('is-active');
    }
}

const hero = document.querySelector('[data-hero-carousel]');
if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;

    const showSlide = (nextIndex) => {
        activeIndex = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, index) => slide.classList.toggle('is-active', index === activeIndex));
        dots.forEach((dot, index) => dot.classList.toggle('is-active', index === activeIndex));
    };

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });

    if (slides.length > 1) {
        setInterval(() => showSlide(activeIndex + 1), 5600);
    }
}

const normalizeText = (value) => (value || '').toString().trim().toLowerCase();

for (const input of document.querySelectorAll('[data-page-filter]')) {
    const scope = document.querySelector('[data-filter-scope]');
    if (!scope) {
        continue;
    }

    input.addEventListener('input', () => {
        const query = normalizeText(input.value);
        for (const item of scope.children) {
            const haystack = normalizeText(item.dataset.search || item.textContent);
            item.classList.toggle('is-hidden-by-filter', query.length > 0 && !haystack.includes(query));
        }
    });
}

const searchParams = new URLSearchParams(window.location.search);
const initialQuery = normalizeText(searchParams.get('q'));
const globalSearchInput = document.querySelector('[data-global-search-input]');
const globalResults = document.querySelector('[data-search-results]');
const searchTitle = document.querySelector('[data-search-title]');

if (globalSearchInput && initialQuery) {
    globalSearchInput.value = initialQuery;
}

if (globalResults && initialQuery) {
    let visible = 0;
    for (const item of globalResults.children) {
        const haystack = normalizeText(item.dataset.search || item.textContent);
        const match = haystack.includes(initialQuery);
        item.classList.toggle('is-hidden-by-filter', !match);
        if (match) {
            visible += 1;
        }
    }
    if (searchTitle) {
        searchTitle.textContent = `“${searchParams.get('q')}”相关影片`;
    }
}

let hlsLibraryPromise = null;
const loadHlsLibrary = () => {
    if (!hlsLibraryPromise) {
        hlsLibraryPromise = import('./assets/vendor/hls-dru42stk.js').then((module) => module.H);
    }
    return hlsLibraryPromise;
};

const startPlayer = async (shell) => {
    const video = shell.querySelector('video[data-hls-src]');
    const errorText = shell.querySelector('[data-player-error]');
    const source = video ? video.dataset.hlsSrc : '';

    if (!video || !source) {
        return;
    }

    const showError = () => {
        if (errorText) {
            errorText.hidden = false;
            errorText.textContent = '播放暂时无法启动，请稍后再试。';
        }
    };

    try {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (!video.src) {
                video.src = source;
            }
            shell.classList.add('is-ready');
            await video.play();
            return;
        }

        const Hls = await loadHlsLibrary();
        if (Hls && Hls.isSupported()) {
            if (!shell.hlsInstance) {
                const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
                shell.hlsInstance = hls;
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    shell.classList.add('is-ready');
                    video.play().catch(showError);
                });
                hls.on(Hls.Events.ERROR, (eventName, data) => {
                    if (data && data.fatal) {
                        showError();
                    }
                });
            } else {
                shell.classList.add('is-ready');
                await video.play();
            }
            return;
        }

        showError();
    } catch (error) {
        showError();
    }
};

for (const shell of document.querySelectorAll('[data-player]')) {
    const video = shell.querySelector('video');
    const button = shell.querySelector('[data-play-button]');

    if (button) {
        button.addEventListener('click', () => startPlayer(shell));
    }

    if (video) {
        video.addEventListener('play', () => shell.classList.add('is-playing'));
        video.addEventListener('pause', () => shell.classList.remove('is-playing'));
        video.addEventListener('click', () => {
            if (!video.src) {
                startPlayer(shell);
            }
        });
    }
}

const backTop = document.querySelector('[data-back-top]');
if (backTop) {
    window.addEventListener('scroll', () => {
        backTop.classList.toggle('is-visible', window.scrollY > 540);
    }, { passive: true });

    backTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
