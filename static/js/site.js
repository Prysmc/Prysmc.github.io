(() => {
    const SONGS = [
        { title: 'POST CURE', src: '/static/audio/post-cure.mp3' },
        { title: 'PARK BENCH', src: '/static/audio/park-bench.mp3' },
        { title: 'WAVES', src: '/static/audio/waves.mp3' }
    ];
    const svg = path => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
    const PLAY_ICON = svg('M8 5v14l11-7z');
    const PAUSE_ICON = svg('M6 5h4v14H6zM14 5h4v14h-4z');
    const PREV_ICON = svg('M6 6h2v12H6zM9.5 12 18 6v12z');
    const NEXT_ICON = svg('M16 6h2v12h-2zM6 18l8.5-6L6 6z');
    const CONTACT_ICONS = {
        email: svg('M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z'),
        linkedin: svg('M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z'),
        github: svg('M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57l-.02-2.04c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .31.21.69.82.57A12 12 0 0 0 12 .3')
    };

    let navToken = 0;

    async function loadTemplate(url, placeholderId) {
        const el = document.getElementById(placeholderId);
        if (!el) return;
        const res = await fetch(url);
        el.outerHTML = await res.text();
    }

    function normalisePath(path) {
        return path.replace(/index\.html$/, '');
    }

    function setActiveLink() {
        const current = normalisePath(window.location.pathname);
        document.querySelectorAll('.aero-nav .nav-link').forEach(link => {
            const isActive = normalisePath(new URL(link.href).pathname) === current;
            link.classList.toggle('active', isActive);
            if (isActive) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });
    }

    function startVideos(root) {
        root.querySelectorAll('video[autoplay]').forEach(video => {
            video.muted = true;
            video.play().catch(() => {});
        });
    }

    function formatTime(seconds) {
        if (!isFinite(seconds)) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function initPlayer() {
        const audio = document.getElementById('audio-player');
        if (!audio) return;
        const playBtn = document.getElementById('mp-play');
        const prevBtn = document.getElementById('mp-prev');
        const nextBtn = document.getElementById('mp-next');
        prevBtn.innerHTML = PREV_ICON;
        nextBtn.innerHTML = NEXT_ICON;
        const trackLabel = document.getElementById('mp-track');
        const timeLabel = document.getElementById('mp-time');
        const progress = document.getElementById('mp-progress');
        const fill = document.getElementById('mp-progress-fill');
        let index = 0;

        function load(i, autoplay) {
            index = (i + SONGS.length) % SONGS.length;
            audio.src = SONGS[index].src;
            trackLabel.textContent = SONGS[index].title;
            if (autoplay) audio.play().catch(() => {});
        }

        function render() {
            const playing = !audio.paused;
            playBtn.innerHTML = playing ? PAUSE_ICON : PLAY_ICON;
            playBtn.classList.toggle('is-playing', playing);
            playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
        }

        function seekTo(ratio) {
            if (isFinite(audio.duration)) audio.currentTime = Math.min(Math.max(ratio, 0), 1) * audio.duration;
        }

        playBtn.addEventListener('click', () => (audio.paused ? audio.play().catch(() => {}) : audio.pause()));
        prevBtn.addEventListener('click', () => load(index - 1, true));
        nextBtn.addEventListener('click', () => load(index + 1, true));
        audio.addEventListener('play', render);
        audio.addEventListener('pause', render);
        audio.addEventListener('ended', () => load(index + 1, true));
        audio.addEventListener('timeupdate', () => {
            const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
            fill.style.width = `${pct}%`;
            progress.setAttribute('aria-valuenow', Math.round(pct));
            timeLabel.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
        });
        audio.addEventListener('loadedmetadata', () => {
            timeLabel.textContent = `0:00 / ${formatTime(audio.duration)}`;
        });
        progress.addEventListener('click', e => {
            const rect = progress.getBoundingClientRect();
            seekTo((e.clientX - rect.left) / rect.width);
        });
        progress.addEventListener('keydown', e => {
            if (e.key === 'ArrowRight') audio.currentTime += 5;
            if (e.key === 'ArrowLeft') audio.currentTime -= 5;
        });

        load(0, false);
        render();
    }

    // Swap only #main-content so the footer (and its audio) survives navigation.
    async function navigate(url, push) {
        const token = ++navToken;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(res.status);
            const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
            const incoming = doc.getElementById('main-content');
            if (!incoming) throw new Error('No main content');
            if (token !== navToken) return;

            const current = document.getElementById('main-content');
            current.querySelectorAll('video').forEach(v => {
                v.pause();
                v.removeAttribute('src');
                v.load();
            });
            const fresh = document.importNode(incoming, true);
            current.replaceWith(fresh);
            document.title = doc.title;

            if (push) history.pushState({}, '', url);
            window.scrollTo(0, 0);
            setActiveLink();
            startVideos(fresh);

            const collapse = document.getElementById('navbarNav');
            if (collapse && collapse.classList.contains('show') && window.bootstrap) {
                bootstrap.Collapse.getOrCreateInstance(collapse).hide();
            }
        } catch {
            window.location.href = url;
        }
    }

    function isInternalPageLink(a, e) {
        if (!a || e.defaultPrevented || e.button !== 0) return false;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
        if (a.target && a.target !== '_self') return false;
        if (a.hasAttribute('download')) return false;
        const url = new URL(a.href, window.location.href);
        if (url.origin !== window.location.origin) return false;
        if (url.pathname.startsWith('/static/')) return false;
        if (url.pathname === window.location.pathname && url.hash) return false;
        return true;
    }

    document.addEventListener('click', e => {
        const a = e.target.closest('a[href]');
        if (!isInternalPageLink(a, e)) return;
        e.preventDefault();
        if (a.href === window.location.href) return;
        navigate(a.href, true);
    });

    window.addEventListener('popstate', () => navigate(window.location.href, false));

    document.addEventListener('DOMContentLoaded', async () => {
        await loadTemplate('/templates/navBar.html', 'navbar-placeholder');
        document.querySelectorAll('[data-icon]').forEach(el => {
            el.innerHTML = CONTACT_ICONS[el.dataset.icon] || '';
        });
        setActiveLink();
        initPlayer();
        startVideos(document);
    });
})();
