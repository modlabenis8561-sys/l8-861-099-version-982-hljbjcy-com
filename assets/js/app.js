(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = document.querySelector('[data-menu-button]');
    var menuPanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && menuPanel) {
        menuButton.addEventListener('click', function () {
            menuPanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero-carousel]');

    if (hero) {
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var current = 0;

        function setSlide(index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                setSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                setSlide((current + 1) % slides.length);
            }, 5200);
        }
    }

    selectAll('[data-hero-search]').forEach(function (heroForm) {
        heroForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = heroForm.querySelector('input');
            var query = input ? input.value.trim() : '';
            var target = 'search.html';

            if (query) {
                target += '?q=' + encodeURIComponent(query);
            }

            window.location.href = target;
        });
    });

    var filterPanel = document.querySelector('[data-filter-panel]');

    if (filterPanel) {
        var searchInput = filterPanel.querySelector('[data-filter-search]');
        var regionSelect = filterPanel.querySelector('[data-filter-region]');
        var typeSelect = filterPanel.querySelector('[data-filter-type]');
        var yearSelect = filterPanel.querySelector('[data-filter-year]');
        var cards = selectAll('.filter-card');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (searchInput && initialQuery) {
            searchInput.value = initialQuery;
        }

        function normalize(text) {
            return (text || '').toString().toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(searchInput && searchInput.value);
            var region = regionSelect ? regionSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matched = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (region && card.getAttribute('data-region') !== region) {
                    matched = false;
                }
                if (type && card.getAttribute('data-type') !== type) {
                    matched = false;
                }
                if (year && card.getAttribute('data-year') !== year) {
                    matched = false;
                }

                card.classList.toggle('hidden-by-filter', !matched);
            });
        }

        [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    }
}());

function startMoviePlayer(streamUrl) {
    var video = document.getElementById('moviePlayer');
    var cover = document.querySelector('[data-player-cover]');
    var trigger = document.querySelector('[data-player-trigger]');
    var loaded = false;
    var hlsPlayer = null;

    if (!video) {
        return;
    }

    function attachStream() {
        if (loaded) {
            return;
        }

        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && Hls.isSupported()) {
            hlsPlayer = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsPlayer.loadSource(streamUrl);
            hlsPlayer.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function playStream() {
        attachStream();
        video.controls = true;

        if (cover) {
            cover.classList.add('is-hidden');
        }

        var playResult = video.play();

        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener('click', playStream);
    }

    if (trigger) {
        trigger.addEventListener('click', playStream);
    }

    video.addEventListener('click', function () {
        if (!loaded || video.paused) {
            playStream();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsPlayer) {
            hlsPlayer.destroy();
        }
    });
}
