/* ============================================================
   Shared chrome: nav state, mobile menu, footer, report modal.
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
    buildNav();
    buildFooter();
    buildReportModal();
});

function currentPage() {
    var p = location.pathname.split("/").pop() || "index.html";
    return p.replace(".html", "") || "index";
}

function buildNav() {
    var host = el("nav");
    if (!host) return;

    var page = currentPage();
    var user = Session.get();

    var links = [
        { href: "index.html", label: "Home", key: "index" },
        { href: "dashboard.html", label: "Browse", key: "dashboard" },
        { href: "about.html", label: "About", key: "about" },
        { href: "safety.html", label: "Safety", key: "safety" }
    ];

    var linkHtml = links.map(function (l) {
        return '<a href="' + l.href + '"' + (page === l.key ? ' class="active"' : "") + ">" + l.label + "</a>";
    }).join("");

    var actions;
    if (user) {
        actions =
            '<span class="chip chip-grad">' + ico("user") + "@" + esc(user.username) + "</span>" +
            '<button class="btn btn-ghost btn-sm" id="navSignOut">' + ico("logout") + "Sign out</button>";
    } else {
        actions =
            '<a href="auth.html" class="btn btn-ghost btn-sm">Sign in</a>' +
            '<a href="auth.html#join" class="btn btn-primary btn-sm">Join Greets</a>';
    }

    host.className = "nav";
    host.innerHTML =
        '<div class="container nav-inner">' +
            '<a href="index.html" class="logo"><span class="logo-mark">G</span>Greets</a>' +
            '<div class="nav-links" id="navLinks">' + linkHtml + "</div>" +
            '<div class="nav-actions">' + actions +
                '<button class="nav-toggle" id="navToggle" aria-label="Menu" aria-expanded="false">' + ico("menu") + "</button>" +
            "</div>" +
        "</div>";

    var toggle = el("navToggle");
    if (toggle) {
        toggle.addEventListener("click", function () {
            var open = el("navLinks").classList.toggle("open");
            toggle.innerHTML = ico(open ? "close" : "menu");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    var out = el("navSignOut");
    if (out) {
        out.addEventListener("click", function () {
            Session.clear();
            location.href = "index.html";
        });
    }
}

function buildFooter() {
    var host = el("footer");
    if (!host) return;

    host.className = "footer";
    host.innerHTML =
        '<div class="container">' +
            '<div class="footer-grid">' +
                "<div>" +
                    '<a href="index.html" class="logo"><span class="logo-mark">G</span>Greets</a>' +
                    '<p class="footer-note">Book real time with the people you follow. Every meet happens inside Greets, on video or voice, and never over a phone number.</p>' +
                "</div>" +
                "<div>" +
                    "<h4>Explore</h4>" +
                    '<div class="footer-links">' +
                        '<a href="dashboard.html">Browse Greeties</a>' +
                        '<a href="about.html">About</a>' +
                        '<a href="auth.html#join">Get paid to be met</a>' +
                    "</div>" +
                "</div>" +
                "<div>" +
                    "<h4>Trust</h4>" +
                    '<div class="footer-links">' +
                        '<a href="safety.html">Safety and reporting</a>' +
                        '<a href="terms.html">Terms and conditions</a>' +
                        '<a href="privacy.html">Privacy policy</a>' +
                    "</div>" +
                "</div>" +
                "<div>" +
                    "<h4>Account</h4>" +
                    '<div class="footer-links">' +
                        '<a href="auth.html">Sign in</a>' +
                        '<a href="auth.html#join">Create an account</a>' +
                        '<a href="#" id="footReport">Report someone</a>' +
                    "</div>" +
                "</div>" +
            "</div>" +
            '<div class="footer-base">' +
                "<span>Copyright " + new Date().getFullYear() + " Greets.com. All rights reserved.</span>" +
                "<span>Greets is not a dating service.</span>" +
            "</div>" +
        "</div>";

    var r = el("footReport");
    if (r) {
        r.addEventListener("click", function (e) {
            e.preventDefault();
            openReport("");
        });
    }
}

/* ---------- Report modal ---------- */
function buildReportModal() {
    var box = document.createElement("div");
    box.className = "modal";
    box.id = "reportModal";
    box.innerHTML =
        '<div class="modal-bg" data-close="1"></div>' +
        '<div class="modal-box">' +
            '<div id="reportForm">' +
                '<div class="row between gap-4" style="align-items:flex-start;margin-bottom:.4rem;">' +
                    "<h3>Report a problem</h3>" +
                    '<button class="btn btn-ghost btn-sm" data-close="1" aria-label="Close" style="padding:.4rem;">' + ico("close") + "</button>" +
                "</div>" +
                '<p class="muted" style="font-size:.89rem;margin-bottom:1.4rem;">Reports go to the Greets safety team. We review every one, and we never tell the other person who reported them.</p>' +
                '<div class="field">' +
                    '<label class="label" for="reportWho">Who are you reporting</label>' +
                    '<input class="input" id="reportWho" placeholder="Name or username">' +
                "</div>" +
                '<div class="field">' +
                    '<label class="label" for="reportWhy">What happened</label>' +
                    '<select class="input" id="reportWhy">' +
                        "<option>Sexual content or a sexual request</option>" +
                        "<option>Harassment or abuse</option>" +
                        "<option>Threats or intimidation</option>" +
                        "<option>Asked me to move off Greets</option>" +
                        "<option>Asked for my phone number or address</option>" +
                        "<option>Did not show up for a paid meet</option>" +
                        "<option>Impersonating someone else</option>" +
                        "<option>Something else</option>" +
                    "</select>" +
                "</div>" +
                '<div class="field">' +
                    '<label class="label" for="reportMore">Anything you want to add</label>' +
                    '<textarea class="input" id="reportMore" rows="3" placeholder="Optional"></textarea>' +
                "</div>" +
                '<div class="notice warn mt-4">' + ico("shield") +
                    "<span>Anything sexual, abusive or threatening gets an account removed. Serious cases are passed to the authorities.</span>" +
                "</div>" +
                '<div class="row gap-3 mt-6">' +
                    '<button class="btn btn-primary full" id="reportSend">' + ico("flag") + "Send report</button>" +
                    '<button class="btn btn-ghost" data-close="1">Cancel</button>' +
                "</div>" +
            "</div>" +
            '<div id="reportDone" style="display:none;text-align:center;padding:1rem 0;">' +
                '<div class="modal-ico">' + ico("check") + "</div>" +
                "<h3>Report received</h3>" +
                '<p class="muted mt-2" style="font-size:.91rem;">The safety team will look at this. If you are in immediate danger, contact your local emergency services.</p>' +
                '<button class="btn btn-primary mt-6" data-close="1">Close</button>' +
            "</div>" +
        "</div>";
    document.body.appendChild(box);

    box.addEventListener("click", function (e) {
        var hit = e.target.closest ? e.target.closest("[data-close]") : null;
        if (hit) closeReport();
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeReport();
    });

    el("reportSend").addEventListener("click", function () {
        el("reportForm").style.display = "none";
        el("reportDone").style.display = "block";
    });
}

function openReport(name) {
    var m = el("reportModal");
    if (!m) return;
    el("reportForm").style.display = "block";
    el("reportDone").style.display = "none";
    el("reportWho").value = name || "";
    m.classList.add("open");
}

function closeReport() {
    var m = el("reportModal");
    if (m) m.classList.remove("open");
}
