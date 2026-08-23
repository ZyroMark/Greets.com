/* ============================================================
   Safety page tiles and report buttons.
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
    var note = el("reportNote");
    if (note) note.insertAdjacentHTML("afterbegin", ico("flag"));

    var host = el("safetyBento");
    if (host) {
        var list = [
            { span: "b-2", icon: "ban", grad: true, h: "Nothing sexual", p: "No sexual requests, sexual content, nudity or sexual pressure, from either side, paid or not. This is the rule we enforce hardest." },
            { span: "b-2", icon: "phoneOff", h: "Stay on Greets", p: "No phone numbers, addresses, socials or outside apps. Anyone pushing you to move the conversation off Greets is breaking the rules." },
            { span: "b-2", icon: "idCard", h: "Be who you say you are", p: "Greeties use their real verified name. Impersonating a public figure to take bookings ends the account and the money goes back." }
        ];
        host.innerHTML = list.map(function (t) {
            return (
                '<div class="tile ' + t.span + (t.grad ? " tile-grad" : "") + '">' +
                    '<div class="tile-ico">' + ico(t.icon, "ico-lg") + "</div>" +
                    "<h3>" + t.h + "</h3>" +
                    "<p>" + t.p + "</p>" +
                "</div>"
            );
        }).join("");
    }

    ["openReportTop", "openReportBottom"].forEach(function (id) {
        var b = el(id);
        if (b) {
            b.innerHTML = ico("flag") + b.textContent.trim();
            b.addEventListener("click", function () { openReport(""); });
        }
    });
});
