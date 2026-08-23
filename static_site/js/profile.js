/* ============================================================
   Greetie profile and the booking flow.
   ============================================================ */

var G = null;
var pickedMins = 30;
var pickedCall = "video";

document.addEventListener("DOMContentLoaded", function () {
    var id = new URLSearchParams(location.search).get("id");
    G = findGreetie(id);

    if (!G) {
        el("profileRoot").innerHTML =
            '<div class="panel center" style="padding:4rem 1.5rem;">' +
                "<h2>We could not find that profile</h2>" +
                '<p class="muted mt-2">It may have been taken down, or the link is wrong.</p>' +
                '<a href="dashboard.html" class="btn btn-primary mt-6">Browse everyone</a>' +
            "</div>";
        return;
    }

    document.title = "Meet " + G.name + " - Greets.com";
    pickedCall = G.call === "voice" ? "voice" : "video";
    renderProfile();
});

function renderProfile() {
    el("profileRoot").innerHTML =
        '<div class="p-cover"><img src="' + G.photo + '" alt="" onerror="this.style.display=\'none\'"></div>' +

        '<div class="p-head">' +
            '<img class="p-avatar" src="' + G.photo + '" alt="' + esc(G.name) + '" onerror="this.src=FALLBACK_IMG">' +
            '<div class="p-id">' +
                "<h1>" + esc(G.name) + ' <span class="verified" title="Identity verified">&check;</span></h1>' +
                '<p class="muted">' + esc(G.category) + " in " + esc(G.country) + "</p>" +
                '<div class="row gap-2 wrap mt-4">' +
                    (G.live ? '<span class="chip chip-lime"><span class="dot-live"></span>Available now</span>' : '<span class="chip">Replies within a day</span>') +
                    '<span class="chip">' + callLabel(G.call) + "</span>" +
                    '<span class="chip">&#9733; ' + G.rating.toFixed(1) + "</span>" +
                "</div>" +
            "</div>" +
        "</div>" +

        '<div class="p-layout">' +
            "<div>" +
                '<div class="panel">' +
                    "<h3>About " + esc(G.name.split(" ")[0]) + "</h3>" +
                    '<p class="muted">' + esc(G.bio) + "</p>" +
                    '<div class="stats mt-8">' +
                        '<div><div class="stat-v">' + G.meets + '</div><div class="stat-l">Meets done</div></div>' +
                        '<div><div class="stat-v">' + G.rating.toFixed(1) + '</div><div class="stat-l">Rating</div></div>' +
                        '<div><div class="stat-v">' + G.response + '%</div><div class="stat-l">Response rate</div></div>' +
                    "</div>" +
                "</div>" +

                '<div class="panel">' +
                    "<h3>Good things to talk about</h3>" +
                    '<div class="tags">' +
                        G.talks.map(function (t) { return '<span class="chip">' + esc(t) + "</span>"; }).join("") +
                    "</div>" +
                "</div>" +

                '<div class="panel">' +
                    "<h3>How the meet works</h3>" +
                    '<ul class="prose" style="margin:0 0 0 1.1rem;display:grid;gap:.5rem;">' +
                        "<li>The call opens inside Greets at the time you agree. There is nothing to install.</li>" +
                        "<li>No phone numbers, addresses or outside apps are shared by either side.</li>" +
                        "<li>You are charged when you book. If " + esc(G.name.split(" ")[0]) + " does not show up, you get all of it back.</li>" +
                        "<li>Greets is not a dating service. Anything sexual ends the meet and the account.</li>" +
                    "</ul>" +
                    '<button class="btn btn-danger btn-sm mt-6" id="reportBtn">Report ' + esc(G.name.split(" ")[0]) + "</button>" +
                "</div>" +
            "</div>" +

            '<aside class="book">' + bookingPanel() + "</aside>" +
        "</div>";

    wireProfile();
}

function bookingPanel() {
    var callOpts = "";
    if (G.call === "both") {
        callOpts =
            '<label class="label mt-6">Video or voice</label>' +
            '<div class="seg seg-2" id="callSeg">' +
                '<label class="opt' + (pickedCall === "video" ? " sel" : "") + '" data-call="video">' +
                    '<span class="opt-title">Video</span>' +
                "</label>" +
                '<label class="opt' + (pickedCall === "voice" ? " sel" : "") + '" data-call="voice">' +
                    '<span class="opt-title">Voice</span>' +
                "</label>" +
            "</div>";
    } else {
        callOpts =
            '<label class="label mt-6">Call type</label>' +
            '<div class="notice"><span>&#10003;</span><span>' + esc(G.name.split(" ")[0]) +
            " takes " + (G.call === "video" ? "video calls only" : "voice calls only") + ".</span></div>";
    }

    return (
        '<div class="panel" id="bookPanel">' +
            "<h3>Book a meet</h3>" +
            '<label class="label">How long do you want</label>' +
            '<div class="seg" id="durSeg">' +
                DURATIONS.map(function (d) {
                    return (
                        '<label class="opt' + (d.mins === pickedMins ? " sel" : "") + '" data-mins="' + d.mins + '">' +
                            '<span class="opt-title">' + d.label + "<span>$" + priceFor(G, d.mins) + "</span></span>" +
                            '<span class="opt-desc">' + d.note + "</span>" +
                        "</label>"
                    );
                }).join("") +
            "</div>" +
            callOpts +
            '<div class="price-row">' +
                '<div><div class="stat-l">Total</div><div class="muted" style="font-size:.82rem;" id="sumLine"></div></div>' +
                '<div class="price-total" id="total"></div>' +
            "</div>" +
            '<button class="btn btn-primary full btn-lg mt-6" id="bookBtn">Request this meet</button>' +
            '<p class="hint center mt-4">You are not charged until ' + esc(G.name.split(" ")[0]) + " accepts.</p>" +
        "</div>"
    );
}

function wireProfile() {
    updateTotal();

    bindSeg("durSeg", "data-mins", function (v) {
        pickedMins = parseInt(v, 10);
        updateTotal();
    });

    bindSeg("callSeg", "data-call", function (v) {
        pickedCall = v;
        updateTotal();
    });

    el("bookBtn").addEventListener("click", confirmBooking);
    el("reportBtn").addEventListener("click", function () { openReport(G.name); });
}

function bindSeg(segId, attr, onPick) {
    var seg = el(segId);
    if (!seg) return;
    Array.prototype.forEach.call(seg.querySelectorAll(".opt"), function (opt) {
        opt.addEventListener("click", function () {
            Array.prototype.forEach.call(seg.querySelectorAll(".opt"), function (o) { o.classList.remove("sel"); });
            opt.classList.add("sel");
            onPick(opt.getAttribute(attr));
        });
    });
}

function durationLabel(mins) {
    var d = DURATIONS.filter(function (x) { return x.mins === mins; })[0];
    return d ? d.label : mins + " minutes";
}

function activeCall() {
    return G.call === "both" ? pickedCall : G.call;
}

function updateTotal() {
    el("total").textContent = "$" + priceFor(G, pickedMins);
    el("sumLine").textContent = durationLabel(pickedMins) + " on " + (activeCall() === "video" ? "video" : "voice");
}

function confirmBooking() {
    /* Booking needs an account, so send them to sign in and come back. */
    if (!Session.isIn()) {
        sessionStorage.setItem("greets.next", location.href);
        location.href = "auth.html";
        return;
    }

    var price = priceFor(G, pickedMins);
    Bookings.add({
        id: G.id,
        name: G.name,
        duration: durationLabel(pickedMins),
        call: activeCall() === "video" ? "video" : "voice",
        price: price
    });

    el("bookPanel").innerHTML =
        '<div class="center" style="padding:.5rem 0;">' +
            '<div class="card-icon" style="margin:0 auto 1.2rem;">&#10003;</div>' +
            "<h3>Request sent</h3>" +
            '<p class="muted mt-2" style="font-size:.92rem;">' +
                esc(G.name) + " has " + durationLabel(pickedMins).toLowerCase() +
                " on " + (activeCall() === "video" ? "video" : "voice") + " waiting to be accepted." +
            "</p>" +
            '<div class="price-row" style="text-align:left;">' +
                '<div><div class="stat-l">Held for this meet</div><div class="muted" style="font-size:.82rem;">Released after the call</div></div>' +
                '<div class="price-total">$' + price + "</div>" +
            "</div>" +
            '<div class="notice mt-6" style="text-align:left;">' +
                "<span>&#10003;</span><span>The call opens inside Greets. You will never see or need a phone number.</span>" +
            "</div>" +
            '<a href="dashboard.html" class="btn btn-primary full mt-6">Back to browse</a>' +
        "</div>";

    window.scrollTo({ top: 0, behavior: "smooth" });
}
