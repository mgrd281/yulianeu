(() => {
  const root = document.querySelector('[data-legal-layout]');
  if (!root) return;

  const rte = root.querySelector('[data-legal-rte]');
  const tocLists = root.querySelectorAll('[data-legal-toc-list]');
  if (!rte || !tocLists.length) return;

  const slugify = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[\u2010-\u2015]/g, '-')
      .replace(/[^a-z0-9\-äöüß]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const headings = Array.from(rte.querySelectorAll('h2, h3')).filter((h) => h.textContent.trim().length);
  if (!headings.length) {
    tocLists.forEach((list) => (list.innerHTML = ''));
    const toc = root.querySelector('[data-legal-toc]');
    if (toc) toc.style.display = 'none';
    return;
  }

  const used = new Map();
  const items = headings.map((h) => {
    const level = h.tagName === 'H2' ? 2 : 3;
    const base = slugify(h.textContent);
    let id = base || `section-${Math.random().toString(16).slice(2)}`;

    const count = used.get(id) || 0;
    used.set(id, count + 1);
    if (count > 0) id = `${id}-${count + 1}`;

    if (!h.id) h.id = id;

    return {
      id: h.id,
      level,
      text: h.textContent.trim(),
      el: h
    };
  });

  const render = () => {
    const html = items
      .map((item) => {
        return `<a class="legal-center__toc-link" data-level="${item.level}" href="#${encodeURIComponent(item.id)}">${item.text}</a>`;
      })
      .join('');

    tocLists.forEach((list) => {
      list.innerHTML = html;
    });
  };

  const setActive = (id) => {
    tocLists.forEach((list) => {
      const links = list.querySelectorAll('.legal-center__toc-link');
      links.forEach((a) => {
        const isActive = a.getAttribute('href') === `#${encodeURIComponent(id)}`;
        a.classList.toggle('is-active', isActive);
      });
    });
  };

  const smoothScroll = (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const hash = decodeURIComponent(a.getAttribute('href').slice(1));
    const target = document.getElementById(hash);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.pushState(null, '', `#${hash}`);

    const details = root.querySelector('[data-legal-toc-mobile]');
    if (details && details.open) details.open = false;
  };

  render();

  tocLists.forEach((list) => list.addEventListener('click', smoothScroll));

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      setActive(visible.target.id);
    },
    {
      rootMargin: '-20% 0px -70% 0px',
      threshold: [0.1, 0.25, 0.5, 0.75, 1]
    }
  );

  items.forEach((item) => observer.observe(item.el));

  if (window.location.hash) {
    const initialId = decodeURIComponent(window.location.hash.slice(1));
    setActive(initialId);
  } else {
    setActive(items[0].id);
  }
})();
