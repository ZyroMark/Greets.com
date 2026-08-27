/* ============================================================
   The meet room.
   This is where the browser actually asks for the camera and the
   microphone. Nothing is requested until the person presses the
   button, so the desktop permission prompt never arrives cold.

   There is no signalling server behind this yet, so the far tile is
   a placeholder. Everything on your own side is real: real devices,
   real permission, real tracks, really released when you hang up.
   ============================================================ */

var B = null;          /* the booking being joined */
var G = null;          /* the Greetie on the other side */
var ME = null;         /* who is watching this page */
var stream = null;     /* the live MediaStream, or null */
var wantsVideo = true; /* false for a voice booking */
var camOn = true;
var micOn = true;
var endsAt = 0;
var tick = null;

document.addEventListener("DOMContentLoaded", function () {
    ME = Session.get();
    if (!ME) {
        sessionStorage.setItem("greets.next", location.href);
        location.replace("auth.html");
        return;
    }

    var ref = new URLSearchParams(location.search).get("ref") || "";
    B = Bookings.byRef(ref);

    if (!B) {
        dead("This meet link has expired",
            "We cannot find a booking with that reference. Open it again from your dashboard.");
        return;
    }
    if (B.status !== "accepted") {
        dead(
            B.status === "declined" ? "This request was declined" : "Not accepted yet",
            B.status === "declined"
                ? "Nothing was charged. You can book someone else whenever you like."
                : "You can join as soon as " + B.name + " accepts. We will hold the slot until then."
        );
        return;
    }

    G = findGreetie(B.greetieId);
    wantsVideo = B.call !== "voice";

    header();
    lobby();

    /* Leaving the page with the camera still open is the one thing
       that would genuinely spook someone, so let it go on the way out. */
    window.addEventListener("pagehide", stopTracks);
});

/* ---------- Header ---------- */
function header() {
    var other = ME.role === "greetie" ? "@" + B.greeter : B.name;
    el("meetTitle").textContent = "Meet with " + other;
    el("meetSub").textContent = B.duration + " on " + (wantsVideo ? "video" : "voice") + ", reference " + B.ref;
    el("meetChips").innerHTML =
        '<span class="chip">' + ico(wantsVideo ? "video" : "mic") + callLabel(B.call) + "</span>" +
        '<span class="chip chip-grad">$' + B.price + "</span>";
}

/* ---------- States ---------- */

/* Before anything is requested. Says plainly what the browser is
   about to ask for, so the prompt is expected rather than a surprise. */
function lobby() {
    var kit = wantsVideo ? "camera and microphone" : "microphone";

    el("stage").innerHTML =
        '<div class="stage-pad"><div>' +
            '<div class="stage-ico">' + ico(wantsVideo ? "video" : "mic") + "</div>" +
            "<h3>Ready when you are</h3>" +
            "<p>Greets needs your " + kit + " for this meet. Your browser will ask you first, " +
            "and nothing turns on until you say yes.</p>" +
            '<ul class="how-to">' +
                "<li>The prompt comes from the browser, not from us.</li>" +
                "<li>Choose Allow to see yourself before you join.</li>" +
                "<li>You can mute or turn the camera off at any point.</li>" +
            "</ul>" +
        "</div></div>";

    el("meetBar").innerHTML =
        '<button class="btn btn-primary" id="ask">' + ico("shield") + "Allow " + kit + "</button>" +
        '<a class="btn btn-ghost" href="dashboard.html">' + ico("arrowLeft") + "Back</a>";

    el("meetFoot").innerHTML = note("lock",
        "Nothing is recorded, and no phone numbers are exchanged. Report anyone in one tap during the meet.");

    el("ask").addEventListener("click", ask);
}

/* The actual request. */
function ask() {
    /* getUserMedia only exists on https or localhost. Opening the file
       straight off disk gives you no camera at all, and no prompt to
       explain why, so say it rather than looking broken. */
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        blocked(
            "This browser will not hand over a camera here",
            location.protocol === "file:"
                ? "Cameras are only released over https or on localhost. Run the site through a local server rather than opening the file directly."
                : "Your browser does not support camera access on this page, or the page is not being served securely."
        );
        return;
    }

    el("stage").innerHTML =
        '<div class="stage-pad"><div>' +
            '<div class="spin"></div>' +
            "<h3>Waiting on you</h3>" +
            "<p>Your browser is asking whether Greets can use your " +
            (wantsVideo ? "camera and microphone" : "microphone") +
            ". Look for the prompt near the address bar.</p>" +
        "</div></div>";

    el("meetBar").innerHTML = '<button class="btn btn-ghost" id="cancel">' + ico("close") + "Cancel</button>";
    el("cancel").addEventListener("click", lobby);

    navigator.mediaDevices.getUserMedia({
        video: wantsVideo ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" } : false,
        audio: true
    }).then(function (s) {
        stream = s;
        camOn = wantsVideo;
        micOn = true;
        preview();
    }).catch(onDenied);
}

/* Every way this can fail reads differently to the person, so they
   are not all funnelled into one useless message. */
function onDenied(err) {
    var name = err && err.name ? err.name : "Error";

    if (name === "NotAllowedError" || name === "SecurityError") {
        blocked("Access was blocked",
            "Your browser is holding the " + (wantsVideo ? "camera and microphone" : "microphone") +
            " back. Click the camera or lock icon in the address bar, set Greets to Allow, then try again.");
        return;
    }
    if (name === "NotFoundError" || name === "OverconstrainedError") {
        blocked("No " + (wantsVideo ? "camera" : "microphone") + " found",
            wantsVideo
                ? "Your computer is not reporting a camera. Plug one in, or join on voice instead."
                : "Your computer is not reporting a microphone. Plug one in and try again.",
            wantsVideo);
        return;
    }
    if (name === "NotReadableError" || name === "AbortError") {
        blocked("Your camera is busy",
            "Another app has hold of it. Close anything else using the camera, then try again.");
        return;
    }
    blocked("Something went wrong",
        "We could not reach your devices. " + (err && err.message ? err.message : ""));
}

function blocked(title, body, offerVoice) {
    el("stage").innerHTML =
        '<div class="stage-pad"><div>' +
            '<div class="stage-ico bad">' + ico("ban") + "</div>" +
            "<h3>" + esc(title) + "</h3>" +
            "<p>" + esc(body) + "</p>" +
        "</div></div>";

    el("meetBar").innerHTML =
        '<button class="btn btn-primary" id="retry">' + ico("refresh") + "Try again</button>" +
        (offerVoice ? '<button class="btn btn-ghost" id="voice">' + ico("mic") + "Join on voice</button>" : "") +
        '<a class="btn btn-ghost" href="dashboard.html">Back</a>';

    el("retry").addEventListener("click", ask);

    var v = el("voice");
    if (v) {
        v.addEventListener("click", function () {
            wantsVideo = false;
            ask();
        });
    }
}

/* Self view before joining, so nobody appears mid sentence at a bad angle. */
function preview() {
    el("stage").innerHTML =
        '<div class="tile-self full" id="selfTile">' +
            '<video id="selfVid" autoplay playsinline muted></video>' +
            '<span class="self-tag">You</span>' +
        "</div>" +
        '<div class="stage-top">' +
            '<span class="live-pill">' + ico("eyeOff") + "Only you can see this</span><span></span>" +
        "</div>";

    attach();

    el("meetBar").innerHTML =
        ctlBtn("micBtn", micOn ? "mic" : "micOff", !micOn, "Mute") +
        (wantsVideo ? ctlBtn("camBtn", camOn ? "video" : "videoOff", !camOn, "Turn camera off") : "") +
        '<button class="btn btn-primary" id="join">' + ico("check") + "Join meet</button>" +
        '<button class="btn btn-ghost" id="leave">Cancel</button>';

    el("meetFoot").innerHTML = note("check",
        "Your " + (wantsVideo ? "camera and microphone are" : "microphone is") +
        " live on this page only. Nobody sees this until you join.");

    wireToggles();
    el("join").addEventListener("click", live);
    el("leave").addEventListener("click", function () {
        stopTracks();
        lobby();
    });
}

/* In the meet. */
function live() {
    var mins = minutesOf(B.duration);
    endsAt = Date.now() + mins * 60000;

    el("stage").innerHTML =
        '<div class="tile-remote">' +
            "<div>" +
                remoteFace() +
                '<div class="remote-name">' + esc(ME.role === "greetie" ? "@" + B.greeter : B.name) + "</div>" +
                '<div class="remote-note">Waiting for them to join</div>' +
            "</div>" +
        "</div>" +
        '<div class="stage-top">' +
            '<span class="live-pill"><span class="dot-rec"></span>Live</span>' +
            '<span class="clock-pill" id="clock"></span>' +
        "</div>" +
        '<div class="tile-self" id="selfTile">' +
            '<video id="selfVid" autoplay playsinline muted></video>' +
            '<span class="self-tag">You</span>' +
        "</div>";

    attach();

    el("meetBar").innerHTML =
        ctlBtn("micBtn", micOn ? "mic" : "micOff", !micOn, "Mute") +
        (wantsVideo ? ctlBtn("camBtn", camOn ? "video" : "videoOff", !camOn, "Turn camera off") : "") +
        '<button class="ctl end" id="hang">' + ico("phoneOff") + "End meet</button>" +
        '<button class="ctl" id="rep" title="Report" aria-label="Report">' + ico("flag") + "</button>";

    el("meetFoot").innerHTML = note("shield",
        "Anything sexual, abusive or threatening ends the account. Use the flag to report without the other person knowing.");

    wireToggles();
    el("hang").addEventListener("click", function () { ended("You ended the meet"); });
    el("rep").addEventListener("click", function () {
        openReport(ME.role === "greetie" ? B.greeter : B.name);
    });

    clock();
    tick = setInterval(clock, 1000);
}

/* Whoever is on the far side, which is not always the Greetie. A fan is
   anonymous by design and has no photo to show, so they get a plain mark
   rather than the Greetie's own face staring back at them. */
function remoteFace() {
    if (ME.role === "greetie") {
        return '<div class="anon-face">' + ico("user") + "</div>";
    }
    return G ? '<img src="' + G.photo + '" alt="" onerror="this.src=FALLBACK_IMG">' : "";
}

function clock() {
    var left = Math.max(0, endsAt - Date.now());
    var m = Math.floor(left / 60000);
    var s = Math.floor(left % 60000 / 1000);

    var c = el("clock");
    if (c) {
        c.innerHTML = ico("clock") + m + ":" + (s < 10 ? "0" : "") + s + " left";
        c.classList.toggle("low", left < 60000);
    }
    if (left <= 0) ended("Your booked time is up");
}

function ended(why) {
    if (tick) {
        clearInterval(tick);
        tick = null;
    }
    stopTracks();

    el("stage").innerHTML =
        '<div class="stage-pad"><div>' +
            '<div class="stage-ico">' + ico("check") + "</div>" +
            "<h3>" + esc(why) + "</h3>" +
            "<p>Your camera and microphone have been released. " + esc(B.duration) +
            " with " + esc(ME.role === "greetie" ? "@" + B.greeter : B.name) + " for $" + B.price + ".</p>" +
        "</div></div>";

    el("meetBar").innerHTML =
        '<a class="btn btn-primary" href="dashboard.html">' + ico("arrowLeft") + "Back to dashboard</a>" +
        '<button class="btn btn-ghost" id="again">' + ico("refresh") + "Rejoin</button>";

    el("meetFoot").innerHTML = "";
    el("again").addEventListener("click", lobby);
}

function dead(title, body) {
    el("meetTitle").textContent = title;
    el("meetSub").textContent = "";
    el("stage").innerHTML =
        '<div class="stage-pad"><div>' +
            '<div class="stage-ico bad">' + ico("clock") + "</div>" +
            "<h3>" + esc(title) + "</h3><p>" + esc(body) + "</p>" +
        "</div></div>";
    el("meetBar").innerHTML =
        '<a class="btn btn-primary" href="dashboard.html">' + ico("arrowLeft") + "Back to dashboard</a>";
}

/* ---------- Devices ---------- */
function attach() {
    var v = el("selfVid");
    if (v && stream) v.srcObject = stream;
    paintSelf();
}

function wireToggles() {
    var m = el("micBtn");
    if (m) m.addEventListener("click", function () { micOn = !micOn; applyTracks(); });

    var c = el("camBtn");
    if (c) c.addEventListener("click", function () { camOn = !camOn; applyTracks(); });
}

/* Disabling a track is what actually stops the data leaving. The tile
   goes dark with it so the state is never in question. */
function applyTracks() {
    if (!stream) return;

    stream.getAudioTracks().forEach(function (t) { t.enabled = micOn; });
    stream.getVideoTracks().forEach(function (t) { t.enabled = camOn; });

    var m = el("micBtn");
    if (m) {
        m.classList.toggle("off", !micOn);
        m.innerHTML = ico(micOn ? "mic" : "micOff");
        m.title = micOn ? "Mute" : "Unmute";
    }
    var c = el("camBtn");
    if (c) {
        c.classList.toggle("off", !camOn);
        c.innerHTML = ico(camOn ? "video" : "videoOff");
        c.title = camOn ? "Turn camera off" : "Turn camera on";
    }

    paintSelf();
}

function paintSelf() {
    var tile = el("selfTile");
    if (!tile) return;

    var off = tile.querySelector(".self-off");
    var dark = !wantsVideo || !camOn;

    if (dark && !off) {
        var d = document.createElement("div");
        d.className = "self-off";
        d.innerHTML = ico(wantsVideo ? "videoOff" : "mic");
        tile.appendChild(d);
    } else if (!dark && off) {
        off.parentNode.removeChild(off);
    }
}

/* Stopping every track is what turns the hardware light off. */
function stopTracks() {
    if (!stream) return;
    stream.getTracks().forEach(function (t) { t.stop(); });
    stream = null;
}

/* ---------- Bits ---------- */
function ctlBtn(id, icon, isOff, title) {
    return '<button class="ctl' + (isOff ? " off" : "") + '" id="' + id +
        '" title="' + title + '" aria-label="' + title + '">' + ico(icon) + "</button>";
}

function note(icon, text) {
    return '<div class="notice mt-6">' + ico(icon) + "<span>" + text + "</span></div>";
}
