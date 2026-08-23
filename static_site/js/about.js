/* ============================================================
   About page tiles.
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
    el("payNotice").innerHTML = ico("wallet") +
        "<span>Payment is taken when the Greetie accepts and held until the meet happens. " +
        "If they do not show up, you are refunded in full and nothing is deducted.</span>";

    tiles("whoBento", [
        {
            span: "b-3", icon: "heart", grad: true,
            h: "If you want to meet someone",
            p: "You are a Greeter. Browse who is taking bookings, pick a length that fits your budget, and pay once. " +
               "Ten minutes with a musician you have followed for years, an hour of portfolio notes from a designer, " +
               "or a straight answer from a founder who has already done the thing you are about to try.",
            p2: "You sign up under a username. Your real name is never shown on your profile, in search, or to the person you book."
        },
        {
            span: "b-3", icon: "star",
            h: "If you want to get paid",
            p: "You are a Greetie. You do not need to be famous to sign up. If people want your time, you can charge for it. " +
               "Set your own rate, choose whether you take video calls, voice calls or both, and accept only the bookings you want.",
            p2: "Because money changes hands, Greeties sign up under their real legal name and pass an identity check."
        }
    ]);

    tiles("namesBento", [
        {
            span: "b-3", icon: "eyeOff",
            h: "Greeters use a username",
            p: "Fans book under a name they pick. Nobody sees your legal name, and we ask you not to use it. " +
               "You are paying to speak with someone, not to hand over your identity to do it."
        },
        {
            span: "b-3", icon: "idCard", grad: true,
            h: "Greeties use their real name",
            p: "Anyone receiving money uses their real legal name and gets verified before their first payout. " +
               "That is what stops people impersonating public figures and taking payments for meets that were never going to happen."
        }
    ]);

    tiles("callsBento", [
        { span: "b-2", icon: "video", h: "Video or voice", p: "Each Greetie decides what they are comfortable with. Some take video, some take voice only, some take either and let you pick at booking." },
        { span: "b-2", icon: "phoneOff", h: "No phone numbers", p: "Calls run inside Greets. No numbers, no addresses, no moving to another app. Neither side ever sees a contact detail for the other." },
        { span: "b-2", icon: "flag", h: "Reporting on every profile", p: "If something goes wrong, report it in one tap. Reports are confidential and we never tell the other person who filed one." }
    ]);
});

function tiles(hostId, list) {
    var host = el(hostId);
    if (!host) return;
    host.innerHTML = list.map(function (t) {
        return (
            '<div class="tile ' + t.span + (t.grad ? " tile-grad" : "") + '">' +
                '<div class="tile-ico">' + ico(t.icon, "ico-lg") + "</div>" +
                "<h3>" + t.h + "</h3>" +
                "<p>" + t.p + "</p>" +
                (t.p2 ? '<p class="mt-4">' + t.p2 + "</p>" : "") +
            "</div>"
        );
    }).join("");
}
