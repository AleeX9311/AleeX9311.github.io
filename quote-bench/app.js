(function () {
  var studios = {
    paperlane: { name: "Paperlane", base: 640, perPage: 140, booking: 300, copyPerPage: 45, rush: 1.5 },
    northglass: { name: "Northglass", base: 900, perPage: 180, booking: 420, copyPerPage: 60, rush: 1.35 },
    holm: { name: "Holm & Co.", base: 1200, perPage: 220, booking: 560, copyPerPage: 80, rush: 1.25 }
  };

  var pages = document.getElementById("pages");
  var booking = document.getElementById("booking");
  var copy = document.getElementById("copy");
  var rush = document.getElementById("rush");
  var summary = document.getElementById("summary");
  if (!pages || !summary) return;

  var money = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  });

  function clamp(value) {
    var number = Math.round(Number(value));
    if (!number) number = 1;
    if (number < 1) number = 1;
    if (number > 20) number = 20;
    return number;
  }

  function quoteFor(studio, brief) {
    var subtotal = studio.base + studio.perPage * brief.pages;
    var lines = [
      ["Base", studio.base],
      [brief.pages === 1 ? "1 page" : brief.pages + " pages", studio.perPage * brief.pages]
    ];
    if (brief.booking) {
      subtotal += studio.booking;
      lines.push(["Booking or shop", studio.booking]);
    }
    if (brief.copy) {
      var copyCost = studio.copyPerPage * brief.pages;
      subtotal += copyCost;
      lines.push(["Copywriting", copyCost]);
    }
    var total = brief.rush ? Math.round(subtotal * studio.rush) : subtotal;
    if (brief.rush) lines.push(["Rush adjustment", total - subtotal]);
    return { total: total, lines: lines };
  }

  function render() {
    var brief = {
      pages: clamp(pages.value),
      booking: booking.checked,
      copy: copy.checked,
      rush: rush.checked
    };
    if (String(brief.pages) !== pages.value) pages.value = String(brief.pages);

    var computed = Object.keys(studios).map(function (key) {
      return { key: key, studio: studios[key], quote: quoteFor(studios[key], brief) };
    });
    var lowest = computed.reduce(function (min, item) {
      return item.quote.total < min ? item.quote.total : min;
    }, computed[0].quote.total);
    var leaders = computed.filter(function (item) { return item.quote.total === lowest; });

    summary.textContent = leaders.length === 1
      ? "Lowest sample quote: " + leaders[0].studio.name + ", " + money.format(lowest) + "."
      : "Lowest sample quote is shared, at " + money.format(lowest) + ".";

    computed.forEach(function (item) {
      var card = document.getElementById("quote-" + item.key);
      if (!card) return;
      card.classList.toggle("is-low", item.quote.total === lowest);
      var flag = card.querySelector("[data-flag]");
      if (flag) flag.hidden = item.quote.total !== lowest;
      var total = card.querySelector("[data-total]");
      if (total) total.textContent = money.format(item.quote.total);
      var list = card.querySelector("[data-lines]");
      if (!list) return;
      list.replaceChildren();
      item.quote.lines.forEach(function (line) {
        var row = document.createElement("div");
        row.className = "line";
        var term = document.createElement("dt");
        term.textContent = line[0];
        var value = document.createElement("dd");
        value.textContent = money.format(line[1]);
        row.append(term, value);
        list.append(row);
      });
    });
  }

  pages.addEventListener("input", render);
  booking.addEventListener("change", render);
  copy.addEventListener("change", render);
  rush.addEventListener("change", render);
  document.getElementById("pages-dec").addEventListener("click", function () {
    pages.value = String(clamp(Number(pages.value) - 1));
    render();
  });
  document.getElementById("pages-inc").addEventListener("click", function () {
    pages.value = String(clamp(Number(pages.value) + 1));
    render();
  });
  document.getElementById("brief").addEventListener("submit", function (event) {
    event.preventDefault();
    render();
  });

  render();
})();
