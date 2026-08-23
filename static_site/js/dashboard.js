/* ============================================================
   Browse page: search, category filters, card grid.
   ============================================================ */

var activeCat = "All";
var activeQuery = "";

document.addEventListener("DOMContentLoaded", function () {
    greetUser();
    showBookings();
    buildFilters();
    wireSearch();
    render();
});

function greetUser() {
    var user = Session.get();
    if (!user) return;

    el("greeting").textContent = "Welcome back, " + (user.role === "greetie" ? user.name : "@" + user.username);

    if (user.role === "greetie") {
        var link = el("earnLink");
        link.textContent = "You take bookings at $" + user.rate + " / 10 min";
        link.classList.add("chip-lime");
        link.removeAttribute("href");
        link.style.cursor = "default";
    }
}

function showBookings() {
    var list = Bookings.all();
    var host = el("bookingStrip");
    if (!list.length) return;

    host.innerHTML =
        '<div class="panel" style="margin-bottom:2rem;">' +
            '<h3>Your upcoming meets</h3>' +
            list.slice(0, 3).map(function (b) {
                return (
                    '<div class="row gap-4 wrap" style="justify-content:space-between;padding:.7rem 0;border-top:1px solid var(--border);">' +
                        "<div>" +
                            '<div style="font-weight:700;">' + esc(b.name) + "</div>" +
                            '<div class="muted" style="font-size:.85rem;">' + esc(b.duration) + " on " + esc(b.call) + "</div>" +
                        "</div>" +
                        '<div class="row gap-3">' +
                            '<span class="chip chip-lime">$' + b.price + "</span>" +
                            '<span class="chip">Awaiting confirmation</span>' +
                        "</div>" +
                    "</div>"
                );
            }).join("") +
        "</div>";
}

function buildFilters() {
    var host = el("filters");
    host.innerHTML = CATEGORIES.map(function (c) {
        return '<button class="filter' + (c === activeCat ? " active" : "") + '" data-cat="' + c + '">' + c + "</button>";
    }).join("");

    Array.prototype.forEach.call(host.querySelectorAll(".filter"), function (btn) {
        btn.addEventListener("click", function () {
            activeCat = btn.getAttribute("data-cat");
            Array.prototype.forEach.call(host.querySelectorAll(".filter"), function (b) {
                b.classList.toggle("active", b === btn);
            });
            render();
        });
    });
}

function wireSearch() {
    el("searchInput").addEventListener("input", function (e) {
        activeQuery = e.target.value.trim().toLowerCase();
        render();
    });
    el("clearAll").addEventListener("click", function () {
        activeQuery = "";
        activeCat = "All";
        el("searchInput").value = "";
        buildFilters();
        render();
    });
}

function matches(g) {
    if (activeCat !== "All" && g.category !== activeCat) return false;
    if (!activeQuery) return true;
    var hay = (g.name + " " + g.category + " " + g.country + " " + g.talks.join(" ")).toLowerCase();
    return hay.indexOf(activeQuery) !== -1;
}

function render() {
    var list = GREETIES.filter(matches);
    var grid = el("grid");

    el("empty").style.display = list.length ? "none" : "block";
    grid.style.display = list.length ? "grid" : "none";

    grid.innerHTML = list.map(function (g, i) {
        return (
            '<article class="g-card rise" data-id="' + g.id + '" style="animation-delay:' + (i * 0.04).toFixed(2) + 's">' +
                '<div class="g-media">' +
                    '<img src="' + g.photo + '" alt="' + esc(g.name) + '" loading="lazy" onerror="this.src=FALLBACK_IMG">' +
                    '<div class="g-shade"></div>' +
                    '<div class="g-badges">' +
                        (g.live ? '<span class="g-badge live"><span class="dot-live"></span>Available now</span>' : "") +
                        '<span class="g-badge">' + callLabel(g.call) + "</span>" +
                    "</div>" +
                    '<div class="g-meta">' +
                        '<div class="g-name">' + esc(g.name) + ' <span class="verified">&check;</span></div>' +
                        '<div class="g-cat">' + esc(g.category) + " in " + esc(g.country) + "</div>" +
                    "</div>" +
                "</div>" +
                '<div class="g-foot">' +
                    '<div class="g-price">$' + priceFor(g, 10) + ' <span>/ 10 min</span></div>' +
                    '<div class="g-rate">&#9733; ' + g.rating.toFixed(1) + " (" + g.meets + ")</div>" +
                "</div>" +
            "</article>"
        );
    }).join("");

    Array.prototype.forEach.call(grid.querySelectorAll(".g-card"), function (card) {
        card.addEventListener("click", function () {
            location.href = "profile.html?id=" + card.getAttribute("data-id");
        });
    });
}
