const header = document.querySelector(".site-header");
const navLinks = Array.from(document.querySelectorAll(".site-nav a[href^='#']"));
const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function updatePageState() {
  header?.setAttribute("data-elevated", String(window.scrollY > 24));

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  document.documentElement.style.setProperty("--scroll-progress", `${Math.min(progress, 100)}%`);

  const activeSection = navSections
    .slice()
    .reverse()
    .find((section) => section.getBoundingClientRect().top <= 120);

  navLinks.forEach((link) => {
    const isActive = activeSection?.id && link.getAttribute("href") === `#${activeSection.id}`;
    link.setAttribute("data-active", String(Boolean(isActive)));
  });
}

updatePageState();
window.addEventListener("scroll", updatePageState, { passive: true });
window.addEventListener("resize", updatePageState);

function setupRevealAnimations() {
  const canAnimate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealTargets = document.querySelectorAll([
    ".section__heading",
    ".rabbi-copy",
    ".rabbi-photo-wrap",
    ".feature",
    ".calendar-card",
    ".calendar-copy",
    ".news-card",
    ".feed-preview",
    ".contact-copy",
    ".contact-list a",
    ".site-footer"
  ].join(", "));

  if (!canAnimate || !("IntersectionObserver" in window)) {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  revealTargets.forEach((target, index) => {
    target.classList.add("reveal-item");
    target.style.transitionDelay = `${Math.min(index % 6, 5) * 70}ms`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px"
  });

  revealTargets.forEach((target) => observer.observe(target));
}

setupRevealAnimations();

const parshaMap = new Map([
  ["Bereshit", "Берешит"],
  ["Noach", "Ноах"],
  ["Lech-Lecha", "Лех-Леха"],
  ["Vayera", "Вайера"],
  ["Chayei Sara", "Хаей Сара"],
  ["Toldot", "Толдот"],
  ["Vayetzei", "Вайеце"],
  ["Vayishlach", "Ваишлах"],
  ["Vayeshev", "Вайешев"],
  ["Miketz", "Микец"],
  ["Vayigash", "Ваигаш"],
  ["Vayechi", "Вайехи"],
  ["Shemot", "Шмот"],
  ["Vaera", "Ваэра"],
  ["Bo", "Бо"],
  ["Beshalach", "Бешалах"],
  ["Yitro", "Итро"],
  ["Mishpatim", "Мишпатим"],
  ["Terumah", "Трума"],
  ["Tetzaveh", "Тецаве"],
  ["Ki Tisa", "Ки Тиса"],
  ["Vayakhel", "Ваякгель"],
  ["Pekudei", "Пкудей"],
  ["Vayikra", "Ваикра"],
  ["Tzav", "Цав"],
  ["Shmini", "Шмини"],
  ["Tazria", "Тазриа"],
  ["Metzora", "Мецора"],
  ["Achrei Mot", "Ахарей Мот"],
  ["Kedoshim", "Кдошим"],
  ["Emor", "Эмор"],
  ["Behar", "Беар"],
  ["Bechukotai", "Бехукотай"],
  ["Bamidbar", "Бамидбар"],
  ["Nasso", "Насо"],
  ["Beha'alotcha", "Беаалотха"],
  ["Sh'lach", "Шлах"],
  ["Korach", "Корах"],
  ["Chukat", "Хукат"],
  ["Balak", "Балак"],
  ["Pinchas", "Пинхас"],
  ["Matot", "Матот"],
  ["Masei", "Масей"],
  ["Devarim", "Дварим"],
  ["Vaetchanan", "Ваэтханан"],
  ["Eikev", "Экев"],
  ["Re'eh", "Реэ"],
  ["Shoftim", "Шофтим"],
  ["Ki Teitzei", "Ки Теце"],
  ["Ki Tavo", "Ки Таво"],
  ["Nitzavim", "Ницавим"],
  ["Vayeilech", "Вайелех"],
  ["Ha'Azinu", "Аазину"],
  ["Vezot Haberakhah", "Везот а-Браха"]
]);

function formatDateTime(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Simferopol"
  }).format(date);
}

function localizeParsha(title = "") {
  const clean = title.replace(/^Parashat\s+/i, "").trim();
  if (!clean) return "Насо";
  return parshaMap.get(clean) || clean;
}

async function updateCalendar() {
  const candleTime = document.querySelector("#candle-time");
  const parshaName = document.querySelector("#parsha-name");
  const havdalahTime = document.querySelector("#havdalah-time");
  const note = document.querySelector("#calendar-note");
  const url = "https://www.hebcal.com/shabbat?cfg=json&latitude=44.61665&longitude=33.52537&tzid=Europe/Simferopol&M=on&b=18";

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Hebcal responded ${response.status}`);

    const data = await response.json();
    const candles = data.items?.find((item) => item.category === "candles");
    const parsha = data.items?.find((item) => item.category === "parashat");
    const havdalah = data.items?.find((item) => item.category === "havdalah");

    if (candles?.date && candleTime) candleTime.textContent = formatDateTime(candles.date);
    if (parshaName) parshaName.textContent = localizeParsha(parsha?.title || candles?.memo);
    if (havdalah?.date && havdalahTime) havdalahTime.textContent = formatDateTime(havdalah.date);
    if (note) note.textContent = "Обновлено автоматически через Hebcal для координат Севастополя.";
  } catch (error) {
    if (note) note.textContent = "Показаны сохраненные данные. Онлайн-обновление временно недоступно.";
  }
}

updateCalendar();
