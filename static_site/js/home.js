/* ============================================================
   Home page: featured cards and the world map.
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
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

/* The map needs a laid out container before it can place anything.
   Watching the element covers first layout and every resize after it,
   rather than guessing when the stylesheet has landed. */
function watchMap() {
    var view = el("mapView");
    if (!view) return;

    var draw = debounce(renderNodes, 120);

    if (typeof ResizeObserver === "function") {
        new ResizeObserver(function () {
            if (view.clientWidth && view.clientHeight) draw();
        }).observe(view);
    } else {
        window.addEventListener("resize", draw);
        window.addEventListener("load", renderNodes);
    }

    renderNodes();
}

/* ---------- Featured ---------- */
function renderFeatured() {
    var host = el("featured");
    if (!host) return;
    host.innerHTML = GREETIES.slice(0, 4).map(greetieCard).join("");
    bindCards(host);
}

function greetieCard(g) {
    return (
        '<article class="g-card" data-id="' + g.id + '">' +
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
                '<div class="g-rate">&#9733; ' + g.rating.toFixed(1) + "</div>" +
            "</div>" +
        "</article>"
    );
}

function bindCards(host) {
    Array.prototype.forEach.call(host.querySelectorAll(".g-card"), function (card) {
        card.addEventListener("click", function () {
            location.href = "profile.html?id=" + card.getAttribute("data-id");
        });
    });
}

/* ---------- Map ---------- */
function renderNodes() {
    var container = el("nodes-container");
    var view = el("mapView");
    if (!container || !view) return;

    container.innerHTML = "";
    var w = view.clientWidth;
    var h = view.clientHeight;
    if (!w || !h) return;

    var padX = 70;
    var padY = 60;
    var people = GREETIES.slice(0, 9);
    var placed = [];

    people.forEach(function (g, i) {
        /* Spread the nodes over a loose grid, then jitter, so they never stack. */
        var cols = 3;
        var rows = Math.ceil(people.length / cols);
        var cw = (w - padX * 2) / cols;
        var ch = (h - padY * 2) / rows;
        var cx = padX + cw * (i % cols) + cw / 2;
        var cy = padY + ch * Math.floor(i / cols) + ch / 2;

        var x = cx + (Math.random() - 0.5) * cw * 0.42;
        var y = cy + (Math.random() - 0.5) * ch * 0.42;

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
    ctx.lineWidth = 1;

    for (var i = 0; i < points.length; i++) {
        for (var j = i + 1; j < points.length; j++) {
            var dx = points[i].x - points[j].x;
            var dy = points[i].y - points[j].y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 330) {
                /* Nearer nodes get a brighter line. */
                var alpha = (1 - dist / 330) * 0.35;
                ctx.strokeStyle = "rgba(212, 255, 63, " + alpha.toFixed(3) + ")";
                ctx.beginPath();
                ctx.moveTo(points[i].x, points[i].y);
                ctx.lineTo(points[j].x, points[j].y);
                ctx.stroke();
            }
        }
    }
}
