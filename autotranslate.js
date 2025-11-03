(function () {
  var userLang = (navigator.languages && navigator.languages[0]) || navigator.language || "";
  if (!userLang || userLang.toLowerCase().indexOf("en") === 0) return;

  var KEY = "atlas.translate.nudge.dismissedAt";
  var DISMISS_DAYS = 30;
  var last = Number(localStorage.getItem(KEY) || 0);
  if (last && (Date.now() - last) < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;

  var bar = document.createElement("div");
  bar.setAttribute("role", "region");
  bar.setAttribute("aria-label", "Translation hint");
  bar.className = "fixed inset-x-0 bottom-4 mx-auto max-w-md px-4 z-[9999]";

  var html =
    '<div class="rounded-xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5 p-3 flex items-start gap-3">' +
      '<div class="shrink-0">' +
        '<span aria-hidden="true" class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700">Lang</span>' +
      '</div>' +
      '<div class="text-sm text-gray-700 leading-5">' +
        '<strong class="block text-gray-900">Translate with your browser</strong>' +
        '<span class="block mt-0.5">Your browser can translate this page automatically. ' +
          '<span class="hidden sm:inline">Use the translate option in the address bar or page menu.</span>' +
        '</span>' +
        '<div class="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">' +
          '<span data-hint="chrome" class="hidden">Chrome: Tap the <em>Translate</em> icon in the address bar.</span>' +
          '<span data-hint="edge" class="hidden">Edge: Tap the <em>Translate</em> icon in the address bar.</span>' +
          '<span data-hint="safari" class="hidden">Safari: Tap the <em>aA</em> button &rarr; <em>Translate Website</em>.</span>' +
          '<span data-hint="firefox" class="hidden">Firefox: Use the built-in Translate panel or the page menu.</span>' +
        '</div>' +
      '</div>' +
      '<button type="button" aria-label="Dismiss" ' +
        'class="ml-auto shrink-0 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50">' +
        'Dismiss' +
      '</button>' +
    '</div>';

  bar.innerHTML = html;

  var ua = (navigator.userAgent || "").toLowerCase();
  var show = function (sel) {
    var el = bar.querySelector('[data-hint="' + sel + '"]');
    if (el) el.classList.remove("hidden");
  };
  if (ua.indexOf("edg/") !== -1) show("edge");
  else if (ua.indexOf("chrome/") !== -1) show("chrome");
  else if (ua.indexOf("safari/") !== -1 && ua.indexOf("chrome/") === -1) show("safari");
  else if (ua.indexOf("firefox/") !== -1) show("firefox");

  var btn = bar.querySelector("button");
  if (btn) {
    btn.addEventListener("click", function () {
      localStorage.setItem(KEY, String(Date.now()));
      bar.remove();
    });
  }

  requestAnimationFrame(function () {
    document.body.appendChild(bar);
  });
})();
