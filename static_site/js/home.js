/* ============================================================
   Home page: hero details, marquee, bento tiles, cards, map.
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
    renderHeroBits();
    renderMarquee();
    renderSides();
    renderRules();
    renderFeatured();
    watchMap();
});

function debounce(fn, wait) {
    var t;
    return function () {
        clearTimeout(t);
        t = setTimeout(fn, wait);
    };
}

/* ---------- Hero ---------- */
function renderHeroBits() {
    var tick = el("pillTick");
    if (tick) tick.innerHTML = ico("check");

    var stats = [
        { icon: "clock", v: "10 min to 2 hrs", l: "You choose the length" },
        { icon: "video", v: "Video or voice", l: "They choose the format" },
        { icon: "phoneOff", v: "In app only", l: "No phone numbers" }
    ];
    var host = el("heroStats");
    if (host) {
        host.innerHTML = stats.map(function (s) {
            return '<div><div class="v">' + ico(s.icon) + s.v + '</div><div class="l">' + s.l + "</div></div>";
        }).join("");
    }

    var seeAll = el("seeAll");
    if (seeAll) seeAll.innerHTML = "See everyone" + ico("arrowRight");
}

/* ---------- Marquee ---------- */
function renderMarquee() {
    var host = el("marquee");
    if (!host) return;

    var items = [
        { icon: "sparkle", t: "Musicians" }, { icon: "zap", t: "Founders" },
        { icon: "star", t: "Actors" }, { icon: "heart", t: "Creators" },
        { icon: "globe", t: "Athletes" }, { icon: "message", t: "Writers" },
        { icon: "video", t: "Photographers" }, { icon: "users", t: "Coaches" },
        { icon: "sparkle", t: "Chefs" }, { icon: "zap", t: "Producers" }
    ];

    var one = items.map(function (i) {
        return '<span class="marquee-item">' + ico(i.icon) + i.t + "</span>";
    }).join("");

    /* Doubled so the loop has something to scroll into. */
    host.innerHTML = one + one;
}

/* ---------- Bento: two sides ---------- */
function renderSides() {
    var host = el("sidesBento");
    if (!host) return;

    host.innerHTML =
        '<div class="tile tile-grad tile-tall b-3">' +
            '<div>' +
                '<div class="tile-ico">' + ico("star", "ico-lg") + "</div>" +
                "<h3>Greeties get paid</h3>" +
                "<p>The person being met. Set your own rate, say whether you want video or voice, and pick the hours you are free. " +
                "You keep control of who you accept. Musicians, athletes, actors, founders, creators and anyone else with something people want to hear.</p>" +
            "</div>" +
            '<a href="auth.html#join" class="btn btn-solid btn-sm mt-6" style="align-self:flex-start;">Become a Greetie' + ico("arrowRight") + "</a>" +
        "</div>" +

        '<div class="tile tile-tall b-3">' +
            '<div>' +
                '<div class="tile-ico">' + ico("heart", "ico-lg") + "</div>" +
                "<h3>Greeters book the meet</h3>" +
                "<p>The fan doing the booking. Browse who is available, choose ten minutes for a quick hello or two hours to really get into something, and pay once. " +
                "You sign up under a username, so your real name is never shown to anyone.</p>" +
            "</div>" +
            '<a href="dashboard.html" class="btn btn-solid btn-sm mt-6" style="align-self:flex-start;">Find someone to meet' + ico("arrowRight") + "</a>" +
        "</div>";
}

/* ---------- Bento: ground rules ---------- */
function renderRules() {
    var host = el("rulesBento");
    if (!host) return;

    var tiles = [
        { span: "b-4", icon: "ban", h: "Nothing sexual, ever", p: "Sexual requests, sexual content and nudity are banned for everyone on both sides. One report is enough for us to look, and confirmed cases end the account.", grad: true },
        { span: "b-2", icon: "phoneOff", h: "No phone numbers", p: "Calls run inside Greets. No numbers, no addresses, no outside apps." },
        { span: "b-2", icon: "flag", h: "Report in one tap", p: "A report control on every profile and every page footer. Reports stay confidential." },
        { span: "b-2", icon: "eyeOff", h: "Fans stay anonymous", p: "Greeters sign up with a username. Your legal name is never shown." },
        { span: "b-2", icon: "idCard", h: "Greeties are verified", p: "Anyone taking money uses their real name and passes identity checks first." },
        { span: "b-6", icon: "wallet", h: "Money is held until the meet happens", p: "Payment is taken at booking and released to the Greetie afterwards. No show, no charge, refunded in full." }
    ];

    host.innerHTML = tiles.map(function (t) {
        return (
            '<div class="tile ' + t.span + (t.grad ? " tile-grad" : "") + '">' +
                '<div class="tile-ico">' + ico(t.icon, "ico-lg") + "</div>" +
                "<h3>" + t.h + "</h3>" +
                "<p>" + t.p + "</p>" +
            "</div>"
        );
    }).join("");
}

/* ---------- Featured ---------- */
function renderFeatured() {
    var host = el("featured");
    if (!host) return;
    host.innerHTML = GREETIES.slice(0, 4).map(greetieCard).join("");
    bindCards(host);
}

function bindCards(host) {
    Array.prototype.forEach.call(host.querySelectorAll(".g-card"), function (card) {
        card.addEventListener("click", function () {
            location.href = "profile.html?id=" + card.getAttribute("data-id");
        });
    });
}

/* ---------- Map ---------- */
function watchMap() {
    var view = el("mapView");
    var container = el("nodes-container");
    if (!view || !container) return;

    var tries = 0;
    function attempt() {
        renderNodes();
        if (container.children.length) return;
        if (++tries < 25) setTimeout(attempt, 120);
    }

    var draw = debounce(renderNodes, 120);

    if (typeof ResizeObserver === "function") {
        new ResizeObserver(function () {
            if (view.clientWidth && view.clientHeight) draw();
        }).observe(view);
    } else {
        window.addEventListener("resize", draw);
    }

    window.addEventListener("load", draw);
    attempt();
}

function renderNodes() {
    var container = el("nodes-container");
    var view = el("mapView");
    if (!container || !view) return;

    container.innerHTML = "";
    var w = view.clientWidth;
    var h = view.clientHeight;
    if (!w || !h) return;

    var padX = 70;
    var padY = 62;
    var people = GREETIES.slice(0, 9);
    var placed = [];

    people.forEach(function (g, i) {
        /* Loose grid then jitter, so nodes never stack on each other. */
        var cols = 3;
        var rows = Math.ceil(people.length / cols);
        var cw = (w - padX * 2) / cols;
        var ch = (h - padY * 2) / rows;
        var x = padX + cw * (i % cols) + cw / 2 + (Math.random() - 0.5) * cw * 0.42;
        var y = padY + ch * Math.floor(i / cols) + ch / 2 + (Math.random() - 0.5) * ch * 0.42;

        var node = document.createElement("div");
        node.className = "map-node";
        node.style.left = x + "px";
        node.style.top = y + "px";
        node.innerHTML =
            '<img src="' + g.photo + '" alt="' + esc(g.name) + '" onerror="this.src=FALLBACK_IMG">' +
            '<div class="node-info">' +
                '<span class="node-name">' + esc(g.name) + "</span>" +
                '<span class="node-cat">' + esc(g.category) + " in " + esc(g.country) + "</span>" +
            "</div>";
        node.addEventListener("click", function () {
            location.href = "profile.html?id=" + g.id;
        });

        container.appendChild(node);
        placed.push({ x: x, y: y });
    });

    drawConnections(placed);
}

function drawConnections(points) {
    var canvas = el("connections-canvas");
    var view = el("mapView");
    if (!canvas || !view) return;

    var ratio = window.devicePixelRatio || 1;
    canvas.width = view.clientWidth * ratio;
    canvas.height = view.clientHeight * ratio;

    var ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, view.clientWidth, view.clientHeight);
    ctx.lineWidth = 1.4;

    for (var i = 0; i < points.length; i++) {
        for (var j = i + 1; j < points.length; j++) {
            var dx = points[i].x - points[j].x;
            var dy = points[i].y - points[j].y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist >= 330) continue;

            /* Fade with distance, and run the line through the brand gradient. */
            var alpha = (1 - dist / 330) * 0.55;
            var grad = ctx.createLinearGradient(points[i].x, points[i].y, points[j].x, points[j].y);
            grad.addColorStop(0, "rgba(163, 204, 20, " + alpha.toFixed(3) + ")");
            grad.addColorStop(1, "rgba(22, 163, 74, " + alpha.toFixed(3) + ")");
            ctx.strokeStyle = grad;
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
        }
    }
}
