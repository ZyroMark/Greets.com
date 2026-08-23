/* ============================================================
   Sign in and join.
   Both paths end on the dashboard. Signing in as a Greetie lands
   you on the request inbox, so a booking can actually be accepted.
   ============================================================ */

var siRole = "greeter";

document.addEventListener("DOMContentLoaded", function () {
    if (Session.isIn()) {
        location.replace("dashboard.html");
        return;
    }

    renderAsidePoints();
    fillGreetieSelect();
    wireTabs();
    wireSigninRole();
    wireRolePicker();
    wireCallPicker();
    wireRateHint();
    wireSignin();
    wireJoin();

    el("idNotice").innerHTML = ico("idCard") +
        "<span>Before your first payout we check your identity against the name above. You can set up your profile straight away.</span>";

    if (location.hash === "#join") showTab("join");
});

function renderAsidePoints() {
    var points = [
        "Fans sign up with a username. Your real name is never shown.",
        "Greeties use their real name and get verified before taking money.",
        "Every call happens inside Greets, on video or voice.",
        "No phone numbers are shared with anyone at any point.",
        "Nothing sexual is allowed. Report anyone in one tap."
    ];
    el("asidePoints").innerHTML = points.map(function (p) {
        return '<li><span class="tick">' + ico("check") + "</span><span>" + p + "</span></li>";
    }).join("");
}

function fillGreetieSelect() {
    var sel = el("siGreetie");
    if (!sel) return;
    sel.innerHTML = GREETIES.map(function (g) {
        return '<option value="' + g.id + '">' + esc(g.name) + " (" + esc(g.category) + ")</option>";
    }).join("");
}

/* ---------- Tabs ---------- */
function showTab(which) {
    var join = which === "join";
    el("tabSignin").classList.toggle("active", !join);
    el("tabJoin").classList.toggle("active", join);
    el("formSignin").style.display = join ? "none" : "block";
    el("formJoin").style.display = join ? "block" : "none";
    el("asideTitle").textContent = join
        ? "Join Greets in under a minute"
        : "Book time with the people you follow";
    el("asideCopy").textContent = join
        ? "Pick the side you are on now. Fans stay anonymous behind a username, and anyone taking money signs up under their real name."
        : "One account lets you book meets as a fan, or take bookings and get paid for your time.";
}

function wireTabs() {
    el("tabSignin").addEventListener("click", function () { showTab("signin"); });
    el("tabJoin").addEventListener("click", function () { showTab("join"); });
    el("goJoin").addEventListener("click", function (e) { e.preventDefault(); showTab("join"); });
    el("goSignin").addEventListener("click", function (e) { e.preventDefault(); showTab("signin"); });
}

/* ---------- Segment helper ---------- */
function pickOne(segId, attr, onPick) {
    var seg = el(segId);
    if (!seg) return;
    Array.prototype.forEach.call(seg.querySelectorAll(".opt"), function (opt) {
        opt.addEventListener("click", function () {
            Array.prototype.forEach.call(seg.querySelectorAll(".opt"), function (o) {
                o.classList.remove("sel");
            });
            opt.classList.add("sel");
            var input = opt.querySelector("input");
            if (input) input.checked = true;
            if (onPick) onPick(opt.getAttribute(attr));
        });
    });
}

function wireSigninRole() {
    pickOne("siRoleSeg", "data-role", function (role) {
        siRole = role;
        el("siGreetiePick").style.display = role === "greetie" ? "block" : "none";
    });
}

function wireRolePicker() {
    pickOne("roleSeg", "data-role", function (role) {
        var greetie = role === "greetie";
        el("greetieFields").style.display = greetie ? "block" : "none";
        el("greeterFields").style.display = greetie ? "none" : "block";
        el("idNotice").style.display = greetie ? "flex" : "none";
    });
}

function wireCallPicker() {
    pickOne("callSeg", "data-call", null);
}

function wireRateHint() {
    var rate = el("jRate");
    if (!rate) return;
    rate.addEventListener("input", function () {
        var v = parseInt(rate.value, 10);
        if (!v || v < 1) {
            el("rateHint").textContent = "Set a rate for a 10 minute meet.";
            return;
        }
        /* Mirrors priceFor: 1 hour is 6 units with a 10 percent discount. */
        el("rateHint").textContent = "A 1 hour meet would cost a Greeter about $" + Math.round(v * 6 * 0.9) + ".";
    });
}

/* ---------- Sign in ---------- */
function wireSignin() {
    el("formSignin").addEventListener("submit", function (e) {
        e.preventDefault();
        var email = el("siEmail").value.trim();
        var pass = el("siPass").value;
        var err = el("siError");

        if (!isEmail(email)) { err.textContent = "Enter a valid email address."; return; }
        if (pass.length < 1) { err.textContent = "Enter your password."; return; }
        err.textContent = "";

        if (siRole === "greetie") {
            var g = findGreetie(el("siGreetie").value);
            if (!g) { err.textContent = "Pick which Greetie profile you are signing in as."; return; }
            Session.set({
                role: "greetie",
                greetieId: g.id,
                name: g.name,
                username: g.name.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
                email: email,
                category: g.category,
                call: g.call,
                rate: g.rate
            });
        } else {
            Session.set({
                role: "greeter",
                username: email.split("@")[0].replace(/[^a-z0-9_]/gi, "").toLowerCase() || "greeter",
                email: email
            });
        }

        goNext();
    });
}

/* ---------- Join ---------- */
function wireJoin() {
    el("formJoin").addEventListener("submit", function (e) {
        e.preventDefault();
        var err = el("jError");
        var role = document.querySelector('input[name="role"]:checked').value;
        var email = el("jEmail").value.trim();
        var pass = el("jPass").value;

        if (role === "greeter") {
            var uname = el("jUsername").value.trim();
            if (uname.length < 3) { err.textContent = "Pick a username of at least 3 characters."; return; }
            if (!/^[a-z0-9_.]+$/i.test(uname)) { err.textContent = "Usernames can use letters, numbers, dots and underscores."; return; }
        } else {
            var real = el("jRealName").value.trim();
            if (real.split(" ").filter(Boolean).length < 2) {
                err.textContent = "Greeties are paid, so we need your full legal name.";
                return;
            }
            var rate = parseInt(el("jRate").value, 10);
            if (!rate || rate < 5) { err.textContent = "Set a rate of at least $5 per 10 minutes."; return; }
        }

        if (!isEmail(email)) { err.textContent = "Enter a valid email address."; return; }
        if (pass.length < 8) { err.textContent = "Use a password of at least 8 characters."; return; }
        if (!el("jTerms").checked) { err.textContent = "You need to accept the terms and the privacy policy."; return; }
        if (!el("jRules").checked) { err.textContent = "Please confirm you have read the conduct rules."; return; }
        err.textContent = "";

        var user;
        if (role === "greetie") {
            var name = el("jRealName").value.trim();
            user = {
                role: "greetie",
                greetieId: null,
                name: name,
                username: name.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
                email: email,
                category: el("jCategory").value,
                call: document.querySelector('input[name="call"]:checked').value,
                rate: parseInt(el("jRate").value, 10)
            };
        } else {
            user = {
                role: "greeter",
                username: el("jUsername").value.trim(),
                email: email
            };
        }

        Session.set(user);
        goNext();
    });
}

/* Where to land after auth. Booking sends people here and expects a way back. */
function goNext() {
    var next = sessionStorage.getItem("greets.next");
    sessionStorage.removeItem("greets.next");
    location.href = next || "dashboard.html";
}

function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}
