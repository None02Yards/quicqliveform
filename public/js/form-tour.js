// public/js/form-tour.js
(function () {
  // Storage keys + cadence
  var LANG_KEY = "atlas.house.formTour.lang";            // "ar" | "en"
  var SHOWN_KEY = "atlas.house.formTour.lastShownAt";    // timestamp (ms)
  var EXPIRE_MS = 24 * 60 * 60 * 1000;                   // 24 hours

  function $(sel) { return document.querySelector(sel); }
  function getLang() {
    var saved = localStorage.getItem(LANG_KEY);
    return (saved === "en" || saved === "ar") ? saved : "ar"; // default AR
  }
  function setLang(lang) { localStorage.setItem(LANG_KEY, lang === "en" ? "en" : "ar"); }
  function isAR(lang) { return (lang || getLang()) === "ar"; }

  // ---------- Copy ----------
  function textBundle(ar) {
    return ar ? {
      introTitle: "مرحباً!",
      introBody: "هذا النموذج يجمع أهم البيانات لعرض عقارك مع Atlas House. سنشرح لك بسرعة كل خانة.",
      name: "اكتب اسمك الكامل.",
      phone: "رقم هاتفك الأساسي للتواصل السريع.",
      email: "البريد الإلكتروني (اختياري لكنه مفيد للإشعارات).",
      intent: "الهدف: هل تريد البيع أم الإيجار؟",
      type: "نوع العقار المناسب لقائمتك.",
      city: "المدينة (مثال: القاهرة).",
      neighborhood: "الحي/المنطقة (اختياري، لكنه يساعد على الاستهداف).",
      address: "العنوان التفصيلي (اختياري).",
      area: "المساحة بالمتر المربع. التقدير مقبول.",
      bedrooms: "عدد غرف النوم.",
      bathrooms: "عدد الحمّامات.",
      price: "السعر المطلوب (يمكن تعديله لاحقاً).",
      currency: "العملة الخاصة بالسعر.",
      furnished: "هل العقار مفروش؟ اختر الأنسب.",
      available: "تاريخ التوفر إذا كان معروفاً.",
      extra: "تفاصيل إضافية أو مميزات قريبة (اختياري).",
      message: "اكتب رسالتك لنا — السياق يساعدنا على الرد أسرع.",
      consent: "يرجى الموافقة لمعالجة البيانات بغرض الرد.",
      submit: "اضغط إرسال عند الانتهاء.",
      next: "التالي", prev: "السابق", done: "تم"
    } : {
      introTitle: "Welcome!",
      introBody: "This form collects the essentials to list your property with Atlas House. We’ll quickly explain each field.",
      name: "Enter your full name.",
      phone: "Primary phone number for fast follow-ups.",
      email: "Email (optional but helpful for updates).",
      intent: "Your objective: Sell or Rent?",
      type: "Choose the property category.",
      city: "City (e.g., Cairo).",
      neighborhood: "Neighborhood/District (optional).",
      address: "Street/Building/Unit (optional).",
      area: "Total area in m². Estimates are fine.",
      bedrooms: "Number of bedrooms.",
      bathrooms: "Number of bathrooms.",
      price: "Your asking price (adjust anytime).",
      currency: "Currency for the price.",
      furnished: "Is it furnished? Pick the closest.",
      available: "When will it be available? (optional)",
      extra: "Extra details or landmarks (optional).",
      message: "Tell us what’s on your mind—context helps.",
      consent: "Please consent so we can process and respond.",
      submit: "All set? Click Submit.",
      next: "Next", prev: "Back", done: "Got it"
    };
  }

  function buildSteps(T) {
    var steps = [];
    var card = $('#card') || document.body;

    steps.push({ element: card, title: T.introTitle, intro: T.introBody, position: "bottom" });

    function add(sel, text, pos) {
      if (pos === void 0) pos = "bottom";
      if ($(sel)) steps.push({ element: sel, intro: text, position: pos });
    }

    add('#name', T.name);
    add('#phone', T.phone);
    add('#email', T.email);
    add('#intent', T.intent);
    add('#type', T.type);
    add('#city', T.city);
    add('#neighborhood', T.neighborhood);
    add('#address', T.address);
    add('#area', T.area);
    add('#bedrooms', T.bedrooms);
    add('#bathrooms', T.bathrooms);
    add('#price', T.price);
    add('#currency', T.currency);
    add('#furnished', T.furnished);
    add('#available', T.available);

    var extraDetails = document.querySelector('textarea[name="message"]:not([required])');
    if (extraDetails) steps.push({ element: extraDetails, intro: T.extra, position: "bottom" });

    var requiredMessage = document.querySelector('textarea[name="message"][required]');
    if (requiredMessage) steps.push({ element: requiredMessage, intro: T.message, position: "bottom" });

    add('#consent', T.consent, "top");
    add('#submitBtn', T.submit, "left");

    return steps;
  }

  function mountLangToggle(currLang) {
    var old = document.querySelector(".form-tour-lang");
    if (old) old.remove();

    var wrap = document.createElement("div");
    wrap.className = "form-tour-lang";
    wrap.innerHTML =
      '<button type="button" data-lang="ar">العربية</button>' +
      '<button type="button" data-lang="en">English</button>';

    document.body.appendChild(wrap);

    var arBtn = wrap.querySelector('button[data-lang="ar"]');
    var enBtn = wrap.querySelector('button[data-lang="en"]');
    (currLang === "ar" ? arBtn : enBtn).classList.add("active");

    var click = function (lang) {
      if (lang === currLang) return;
      setLang(lang);
      if (window.introJs) { try { window.introJs().exit(); } catch (_) {} }
      startTour(lang, /*fromToggle*/true);
    };
    arBtn.addEventListener('click', function(){ click("ar"); });
    enBtn.addEventListener('click', function(){ click("en"); });

    return wrap;
  }
  function removeLangToggle() {
    var el = document.querySelector(".form-tour-lang");
    if (el) el.remove();
  }

  function startTour(lang, fromToggle) {
    if (!window.introJs) return false;

    var useLang = lang || getLang();
    var ar = isAR(useLang);
    var T = textBundle(ar);
    var steps = buildSteps(T);
    if (!steps.length) return false;

    var intro = window.introJs();
    intro.setOptions({
      steps: steps,
      showProgress: true,
      showBullets: false,
      nextLabel: T.next,
      prevLabel: T.prev,
      doneLabel: T.done,
      exitOnOverlayClick: false,
      scrollToElement: true,
      tooltipClass: "atlas-tour-tip" + (ar ? " ar" : "")
    });

    // Show the language pill during the tour
    mountLangToggle(useLang);

    intro.oncomplete(function () {
      if (!fromToggle) removeLangToggle(); // hide when tour ends
    });
    intro.onexit(function () {
      if (!fromToggle) removeLangToggle(); // hide when user closes
    });

    intro.start();
    return true;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var last = Number(localStorage.getItem(SHOWN_KEY) || 0);
    var now = Date.now();
    if (!last || (now - last) > EXPIRE_MS) {
      var started = startTour(getLang());
      if (started) localStorage.setItem(SHOWN_KEY, String(now));
    } else {
      removeLangToggle();
    }
  });

  window.restartFormTour = function () {
    startTour(getLang());
  };
})();
