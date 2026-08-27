/* ============================================================
   Greets.com shared data and helpers
   Loaded by every page before the page specific script.
   ============================================================ */

/* Greeties are the people being met and paid.
   They sign up under their real name and get verified before they can be booked. */
var GREETIES = [
    {
        id: 1,
        name: "Sarah Jenkins",
        category: "Musician",
        country: "United Kingdom",
        rate: 40,
        rating: 4.9,
        meets: 214,
        response: 98,
        call: "both",
        live: true,
        photo: "https://i.pravatar.cc/600?img=1",
        bio: "Singer and songwriter. I have been touring for eight years and I love talking through the craft, from writing a first verse to holding a room of two thousand people.",
        talks: ["Songwriting", "Touring life", "Studio setup", "Getting started"]
    },
    {
        id: 2,
        name: "Michael Chen",
        category: "Founder",
        country: "Singapore",
        rate: 65,
        rating: 5.0,
        meets: 156,
        response: 100,
        call: "video",
        live: false,
        photo: "https://i.pravatar.cc/600?img=3",
        bio: "I built and sold a logistics company and now back early founders. Ask me about raising a first round, hiring your first ten people, or whether your idea is worth a year of your life.",
        talks: ["Fundraising", "Hiring", "Product", "Career advice"]
    },
    {
        id: 3,
        name: "Amara Diop",
        category: "Designer",
        country: "Senegal",
        rate: 35,
        rating: 4.8,
        meets: 302,
        response: 96,
        call: "both",
        live: true,
        photo: "https://i.pravatar.cc/600?img=5",
        bio: "Fashion designer showing in Dakar and Paris. Happy to review a portfolio, talk about breaking into the industry, or just chat about where the work comes from.",
        talks: ["Portfolio review", "Fashion", "Breaking in", "Creative process"]
    },
    {
        id: 4,
        name: "Lucas Silva",
        category: "Athlete",
        country: "Brazil",
        rate: 50,
        rating: 4.9,
        meets: 189,
        response: 94,
        call: "video",
        live: false,
        photo: "https://i.pravatar.cc/600?img=8",
        bio: "Professional footballer. I take calls with supporters, young players and anyone who wants an honest answer about what the training actually looks like.",
        talks: ["Training", "Match day", "Youth academies", "Recovery"]
    },
    {
        id: 5,
        name: "Elena Rossi",
        category: "Chef",
        country: "Italy",
        rate: 30,
        rating: 4.7,
        meets: 421,
        response: 99,
        call: "both",
        live: true,
        photo: "https://i.pravatar.cc/600?img=9",
        bio: "Head chef in Bologna. Cook along with me, plan a menu for something you are hosting, or ask why your pasta water is wrong. It usually is.",
        talks: ["Cook along", "Menu planning", "Restaurant life", "Regional food"]
    },
    {
        id: 6,
        name: "David Kim",
        category: "Creator",
        country: "South Korea",
        rate: 45,
        rating: 4.9,
        meets: 267,
        response: 97,
        call: "both",
        live: true,
        photo: "https://i.pravatar.cc/600?img=11",
        bio: "Choreographer and video creator. I talk with dancers about technique and with creators about how to grow an audience without burning out.",
        talks: ["Choreography", "Growing an audience", "Editing", "Burnout"]
    },
    {
        id: 7,
        name: "Olivia Jones",
        category: "Actor",
        country: "United States",
        rate: 70,
        rating: 5.0,
        meets: 98,
        response: 92,
        call: "video",
        live: false,
        photo: "https://i.pravatar.cc/600?img=20",
        bio: "Screen and stage actor. I run through audition tapes, talk about getting an agent, and answer the questions nobody puts in the interviews.",
        talks: ["Auditions", "Agents", "On set", "Stage work"]
    },
    {
        id: 8,
        name: "Thabo Nkosi",
        category: "Producer",
        country: "South Africa",
        rate: 38,
        rating: 4.8,
        meets: 174,
        response: 95,
        call: "both",
        live: true,
        photo: "https://i.pravatar.cc/600?img=12",
        bio: "Music producer working out of Johannesburg. Send me a track before the call and I will pull it apart with you, honestly and usefully.",
        talks: ["Track feedback", "Mixing", "Sampling", "Local scene"]
    },
    {
        id: 9,
        name: "Priya Raman",
        category: "Writer",
        country: "India",
        rate: 28,
        rating: 4.9,
        meets: 355,
        response: 100,
        call: "voice",
        live: false,
        photo: "https://i.pravatar.cc/600?img=16",
        bio: "Novelist and journalist. Bring me a first chapter, a pitch that keeps getting rejected, or a question about how anyone finishes a book at all.",
        talks: ["Manuscript notes", "Pitching", "Journalism", "Finding a voice"]
    },
    {
        id: 10,
        name: "Noah Fischer",
        category: "Gaming",
        country: "Germany",
        rate: 25,
        rating: 4.7,
        meets: 512,
        response: 93,
        call: "both",
        live: true,
        photo: "https://i.pravatar.cc/600?img=13",
        bio: "Competitive player and coach. We can review your replays, work on decision making, or talk about what going pro actually costs you.",
        talks: ["Replay review", "Ranking up", "Going pro", "Streaming"]
    },
    {
        id: 11,
        name: "Yuki Tanaka",
        category: "Photographer",
        country: "Japan",
        rate: 42,
        rating: 4.9,
        meets: 203,
        response: 98,
        call: "both",
        live: false,
        photo: "https://i.pravatar.cc/600?img=26",
        bio: "Documentary photographer based in Tokyo. Portfolio reviews, gear talk that stays practical, and how to shoot a place you already know too well.",
        talks: ["Portfolio review", "Documentary work", "Editing", "Gear"]
    },
    {
        id: 12,
        name: "Grace Mbeki",
        category: "Founder",
        country: "Kenya",
        rate: 55,
        rating: 5.0,
        meets: 121,
        response: 99,
        call: "video",
        live: true,
        photo: "https://i.pravatar.cc/600?img=32",
        bio: "I run a fintech company in Nairobi. I speak with founders building for markets that investors keep getting wrong, and with anyone weighing up the jump.",
        talks: ["Building in Africa", "Fundraising", "Leadership", "First hires"]
    }
];

var CATEGORIES = ["All", "Musician", "Founder", "Designer", "Athlete", "Chef", "Creator", "Actor", "Producer", "Writer", "Gaming", "Photographer"];

/* Meet lengths. Longer meets carry a small discount, which is why the
   per minute price is not flat across the four options. */
var DURATIONS = [
    { mins: 10, label: "10 minutes", units: 1, mult: 1.00, note: "A quick hello" },
    { mins: 30, label: "30 minutes", units: 3, mult: 0.95, note: "Room for a real conversation" },
    { mins: 60, label: "1 hour", units: 6, mult: 0.90, note: "Go deep on something" },
    { mins: 120, label: "2 hours", units: 12, mult: 0.85, note: "The longest meet we offer" }
];

var FALLBACK_IMG = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="400" height="500" fill="#1f1f1f"/><circle cx="200" cy="200" r="62" fill="#2e2e2e"/><rect x="110" y="292" width="180" height="96" rx="48" fill="#2e2e2e"/></svg>'
);

/* ---------- Pricing ---------- */
function priceFor(greetie, mins) {
    var d = DURATIONS.filter(function (x) { return x.mins === mins; })[0] || DURATIONS[0];
    return Math.round(greetie.rate * d.units * d.mult);
}

/* "30 minutes" and "1 hour" back into a number the meet clock can count down. */
function minutesOf(label) {
    var d = DURATIONS.filter(function (x) { return x.label === label; })[0];
    return d ? d.mins : 10;
}

function findGreetie(id) {
    id = parseInt(id, 10);
    return GREETIES.filter(function (g) { return g.id === id; })[0] || null;
}

function callLabel(mode) {
    if (mode === "video") return "Video call";
    if (mode === "voice") return "Voice call";
    return "Video or voice";
}

/* ---------- Session ----------
   A demo session held in localStorage so the routes and the flow work
   end to end. No real accounts and no server behind this yet. */
var Session = {
    key: "greets.session",
    get: function () {
        try { return JSON.parse(localStorage.getItem(this.key)); }
        catch (e) { return null; }
    },
    set: function (user) {
        localStorage.setItem(this.key, JSON.stringify(user));
    },
    clear: function () {
        localStorage.removeItem(this.key);
    },
    isIn: function () {
        return !!this.get();
    }
};

/* Bookings made during the demo. Both sides read from the same list:
   the Greeter sees what they requested, the Greetie sees what came in. */
var Bookings = {
    key: "greets.bookings",

    all: function () {
        try { return JSON.parse(localStorage.getItem(this.key)) || []; }
        catch (e) { return []; }
    },

    save: function (list) {
        localStorage.setItem(this.key, JSON.stringify(list.slice(0, 40)));
    },

    add: function (b) {
        var list = this.all();
        b.ref = "GR" + Date.now().toString(36).toUpperCase().slice(-6);
        b.status = "pending";
        b.at = Date.now();
        list.unshift(b);
        this.save(list);
        return b;
    },

    /* What a given fan asked for. */
    forGreeter: function (username) {
        return this.all().filter(function (b) { return b.greeter === username; });
    },

    /* What landed in a given Greetie's inbox. */
    forGreetie: function (greetieId) {
        return this.all().filter(function (b) { return b.greetieId === greetieId; });
    },

    /* One booking by its GRxxxxxx reference. The meet room joins on this. */
    byRef: function (ref) {
        return this.all().filter(function (b) { return b.ref === ref; })[0] || null;
    },

    setStatus: function (ref, status) {
        var list = this.all();
        for (var i = 0; i < list.length; i++) {
            if (list[i].ref === ref) { list[i].status = status; break; }
        }
        this.save(list);
    }
};

var STATUS_LABEL = {
    pending: "Awaiting confirmation",
    accepted: "Accepted",
    declined: "Declined"
};

/* ---------- Greetie card ----------
   Shared by the home page and the browse grid so they never drift apart. */
function greetieCard(g, i) {
    var delay = typeof i === "number" ? ' style="animation-delay:' + (i * 0.05).toFixed(2) + 's"' : "";
    return (
        '<article class="g-card rise" data-id="' + g.id + '"' + delay + ">" +
            '<div class="g-media">' +
                '<img src="' + g.photo + '" alt="' + esc(g.name) + '" loading="lazy" onerror="this.src=FALLBACK_IMG">' +
                '<div class="g-shade"></div>' +
                '<div class="g-badges">' +
                    (g.live ? '<span class="g-badge live"><span class="dot-live"></span>Available now</span>' : "") +
                    '<span class="g-badge">' + ico(g.call === "voice" ? "mic" : "video") + callLabel(g.call) + "</span>" +
                "</div>" +
                '<div class="g-meta">' +
                    '<div class="g-name">' + esc(g.name) + '<span class="verified">' + ico("check") + "</span></div>" +
                    '<div class="g-cat">' + esc(g.category) + " in " + esc(g.country) + "</div>" +
                "</div>" +
            "</div>" +
            '<div class="g-foot">' +
                '<div class="g-price">$' + priceFor(g, 10) + " <span>/ 10 min</span></div>" +
                '<div class="g-rate">' + ico("star") + g.rating.toFixed(1) + "</div>" +
            "</div>" +
        "</article>"
    );
}

/* ---------- Small DOM helpers ---------- */
function el(id) { return document.getElementById(id); }
function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
}
