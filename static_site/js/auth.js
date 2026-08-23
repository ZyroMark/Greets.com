/* ============================================================
   Sign in and join.
   Both paths end at the dashboard, which is the bug that was
   in the old build: signing in only swapped a sidebar panel.
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
    /* Already signed in, no reason to sit on this page. */
    if (Session.isIn()) {
        location.replace("dashboard.html");
        return;
    }

    wireTabs();
    wireRolePicker();
    wireCallPicker();
    wireRateHint();
    wireSignin();
    wireJoin();

    if (location.hash === "#join") showTab("join");
});

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
        : "One account lets you book meets as a fan, or take bookings and get paid for your time. You can do both from the same login.";
}

function wireTabs() {
    el("tabSignin").addEventListener("click", function () { showTab("signin"); });
    el("tabJoin").addEventListener("click", function () { showTab("join"); });
    el("goJoin").addEventListener("click", function (e) { e.preventDefault(); showTab("join"); });
    el("goSignin").addEventListener("click", function (e) { e.preventDefault(); showTab("signin"); });
}

/* ---------- Role and call pickers ---------- */
function pickOne(segId, attr, onPick) {
    var seg = el(segId);
    if (!seg) return;
    Array.prototype.forEach.call(seg.querySelectorAll(".opt"), function (opt) {
        opt.addEventListener("click", function () {
            Array.prototype.forEach.call(seg.querySelectorAll(".opt"), function (o) {
                o.classList.remove("sel");
            });
            opt.classList.add("sel");
            opt.querySelector("input").checked = true;
            if (onPick) onPick(opt.getAttribute(attr));
        });
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
        var hour = Math.round(v * 6 * 0.9);
        el("rateHint").textContent = "A 1 hour meet would cost a Greeter about $" + hour + ".";
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

        /* Demo sign in. Any valid looking details work until there is a backend. */
        Session.set({
            role: "greeter",
            username: email.split("@")[0].replace(/[^a-z0-9_]/gi, "").toLowerCase() || "greeter",
            email: email
        });
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
