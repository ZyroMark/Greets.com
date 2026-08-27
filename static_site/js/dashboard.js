/* ============================================================
   Browse page. Also carries the two inboxes:
   what a Greeter requested, and what a Greetie has to answer.
   ============================================================ */

var activeCat = "All";
var activeQuery = "";

document.addEventListener("DOMContentLoaded", function () {
    el("searchIcon").innerHTML = ico("search");
    greetUser();
    renderInbox();
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
        link.innerHTML = ico("wallet") + "You take bookings at $" + user.rate + " / 10 min";
        link.className = "chip chip-grad";
        link.removeAttribute("href");
    }
}

/* ---------- Inbox ---------- */
function renderInbox() {
    var user = Session.get();
    var host = el("bookingStrip");
    host.innerHTML = "";
    if (!user) return;

    if (user.role === "greetie") renderGreetieInbox(user, host);
    else renderGreeterInbox(user, host);
}

/* The Greetie side: requests waiting to be accepted or declined. */
function renderGreetieInbox(user, host) {
    if (!user.greetieId) {
        host.innerHTML =
            '<div class="notice mt-4" style="margin-bottom:2.2rem;">' + ico("clock") +
            "<span>Your Greetie profile is still being set up, so no requests can reach you yet. " +
            "Sign in against an existing profile to see the request inbox.</span></div>";
        return;
    }

    var list = Bookings.forGreetie(user.greetieId);
    var pending = list.filter(function (b) { return b.status === "pending"; });
    var settled = list.filter(function (b) { return b.status !== "pending"; });

    if (!list.length) {
        host.innerHTML =
            '<div class="notice" style="margin-bottom:2.2rem;">' + ico("message") +
            "<span>No requests yet. When a Greeter books you, it lands here for you to accept or decline.</span></div>";
        return;
    }

    host.innerHTML =
        '<div class="panel" style="margin-bottom:2.2rem;">' +
            '<div class="row between wrap gap-3" style="margin-bottom:.4rem;">' +
                "<h3 style='margin:0;'>Requests for you</h3>" +
                (pending.length ? '<span class="chip chip-grad">' + pending.length + " waiting</span>" : "") +
            "</div>" +
            (pending.length ? pending.map(requestRow).join("") : '<p class="muted mt-4" style="font-size:.9rem;">Nothing waiting on you right now.</p>') +
            (settled.length ? '<div class="mt-8"><div class="stat-l" style="margin-bottom:.6rem;">Already answered</div>' + settled.map(settledRow).join("") + "</div>" : "") +
        "</div>";

    Array.prototype.forEach.call(host.querySelectorAll("[data-accept]"), function (b) {
        b.addEventListener("click", function () {
            Bookings.setStatus(b.getAttribute("data-accept"), "accepted");
            renderInbox();
        });
    });
    Array.prototype.forEach.call(host.querySelectorAll("[data-decline]"), function (b) {
        b.addEventListener("click", function () {
            Bookings.setStatus(b.getAttribute("data-decline"), "declined");
            renderInbox();
        });
    });
}

function requestRow(b) {
    return (
        '<div style="padding:1.1rem 0;border-top:1px solid var(--line);">' +
            '<div class="row between wrap gap-4">' +
                "<div>" +
                    '<div style="font-weight:500;">@' + esc(b.greeter) + " wants to meet you</div>" +
                    '<div class="muted row gap-2 wrap" style="font-size:.85rem;display:flex;margin-top:.2rem;">' +
                        ico(b.call === "voice" ? "mic" : "video") + esc(b.duration) + " on " + esc(b.call) +
                        '<span style="color:var(--muted-2);">Ref ' + esc(b.ref) + "</span>" +
                    "</div>" +
                "</div>" +
                '<div class="row gap-3 wrap">' +
                    '<span class="price-total grad-text" style="font-size:1.3rem;">$' + b.price + "</span>" +
                "</div>" +
            "</div>" +
            '<div class="row gap-3 wrap mt-4">' +
                '<button class="btn btn-primary btn-sm" data-accept="' + esc(b.ref) + '">' + ico("check") + "Accept</button>" +
                '<button class="btn btn-ghost btn-sm" data-decline="' + esc(b.ref) + '">' + ico("close") + "Decline</button>" +
            "</div>" +
        "</div>"
    );
}

function settledRow(b) {
    return (
        '<div class="row between wrap gap-3" style="padding:.7rem 0;border-top:1px solid var(--line);">' +
            '<div class="muted" style="font-size:.88rem;">@' + esc(b.greeter) + ", " + esc(b.duration) + "</div>" +
            '<div class="row gap-3 wrap">' + joinBtn(b) + statusChip(b.status) + "</div>" +
        "</div>"
    );
}

/* An accepted booking has to lead somewhere, so both sides get the
   same way into the meet room. */
function joinBtn(b) {
    if (b.status !== "accepted") return "";
    return '<a class="btn btn-primary btn-sm" href="meet.html?ref=' + encodeURIComponent(b.ref) + '">' +
        ico(b.call === "voice" ? "mic" : "video") + "Join meet</a>";
}

/* The Greeter side: what they asked for and where it stands. */
function renderGreeterInbox(user, host) {
    var list = Bookings.forGreeter(user.username);
    if (!list.length) return;

    host.innerHTML =
        '<div class="panel" style="margin-bottom:2.2rem;">' +
            "<h3>Your meets</h3>" +
            list.slice(0, 5).map(function (b) {
                return (
                    '<div class="row between wrap gap-4" style="padding:.85rem 0;border-top:1px solid var(--line);">' +
                        "<div>" +
                            '<div style="font-weight:500;">' + esc(b.name) + "</div>" +
                            '<div class="muted row gap-2" style="font-size:.85rem;display:flex;margin-top:.2rem;">' +
                                ico(b.call === "voice" ? "mic" : "video") + esc(b.duration) + " on " + esc(b.call) +
                            "</div>" +
                        "</div>" +
                        '<div class="row gap-3 wrap">' +
                            '<span class="chip chip-grad">$' + b.price + "</span>" +
                            statusChip(b.status) +
                            joinBtn(b) +
                        "</div>" +
                    "</div>"
                );
            }).join("") +
        "</div>";
}

function statusChip(status) {
    var icon = status === "accepted" ? "check" : status === "declined" ? "close" : "clock";
    var style = status === "accepted"
        ? ' style="border-color:rgba(22,163,74,.45);color:#0f7a36;"'
        : status === "declined"
            ? ' style="border-color:rgba(179,38,30,.35);color:#8a2019;"'
            : "";
    return '<span class="chip"' + style + ">" + ico(icon) + (STATUS_LABEL[status] || status) + "</span>";
}

/* ---------- Filters and grid ---------- */
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
    el("resultCount").textContent = list.length + (list.length === 1 ? " person" : " people");

    grid.innerHTML = list.map(greetieCard).join("");

    Array.prototype.forEach.call(grid.querySelectorAll(".g-card"), function (card) {
        card.addEventListener("click", function () {
            location.href = "profile.html?id=" + card.getAttribute("data-id");
        });
    });
}
