# Greets.com

Greets.com is a platform where fans pay to meet the people they follow. A fan books a set amount of someone's time, pays for it, and the two of them talk on a video or voice call that happens inside the platform. Anyone can sign up on the other side and get paid for their time, whether they are a public figure or not.

This repository holds the front end. It is a static site built with plain HTML, CSS and JavaScript, with no build step and no dependencies.

## The two sides

**Greeties** are the people being met and paid. They set their own rate, choose whether they take video calls, voice calls or both, and accept only the bookings they want. Because money reaches them, they sign up under their real legal name and it is shown on their profile.

**Greeters** are the fans doing the booking. They sign up under a username, so their real name is never shown on a profile, in search, or to the Greetie they book.

## How a meet works

Meets come in four lengths: 10 minutes, 30 minutes, 1 hour and 2 hours. The price follows the length, so the fan decides how much they want to spend. Longer meets carry a small discount, so a two hour booking is cheaper per minute than a ten minute one.

Every call opens inside Greets. No phone numbers, addresses or outside apps are exchanged by either side at any point.

## Ground rules

Greets is not a dating service and there is nothing sexual on it. Sexual requests, sexual content, nudity, harassment, threats and sexual abuse are banned for everyone on both sides of a booking. Every profile and every page footer carries a report control. Reports are confidential, the reported person is never told who filed one, and confirmed cases end the account.

Everyone accepts the terms and conditions and the privacy policy when they create an account, and separately confirms they have read the conduct rules.

## Pages

- `index.html` is the home page. It explains both sides, walks through the four steps of a booking, shows featured Greeties, and carries an interactive map of who is available.
- `about.html` covers what Greets is, who it is for, how pricing works, why one side is anonymous and the other is not, and a plain statement that this is not a dating site.
- `auth.html` is the combined sign in and sign up page. Signing up asks which side you are on and shows different fields for each.
- `dashboard.html` is the browse view, with search, category filters and the card grid. It also carries both inboxes: what a Greeter has requested, and the requests a Greetie needs to accept or decline.
- `profile.html` is a single Greetie with the booking panel, where you choose a length and a call type and see the price update.
- `safety.html` lists what is banned, how to report someone and what happens afterwards.
- `terms.html` and `privacy.html` are the two agreements users accept at sign up.

## Logo and icons

The mark is `static_site/logo.svg`, a rounded tile in the lime to green gradient holding an open G. The gap in the G reads as a speech opening. Everything else is generated from that one file: `favicon.ico` at 16, 32 and 48, `apple-touch-icon.png` at 180, `icon-192.png` and `icon-512.png` for the web manifest, and `og-image.jpg` for link previews.

To swap in a different logo, replace `logo.svg` and regenerate the raster sizes from it. Nothing else references the artwork directly.

## Design

White and light green surfaces with lime and vibrant green as the only accent colours. Type is Poppins, Light for body copy and Medium for headings. Icons are a stroke icon set drawn on a 24 grid and injected once as an SVG sprite, so there are no emoji anywhere in the interface.

## Code layout

Everything lives in `static_site/`:

- `css/style.css` holds the whole design system, with breakpoints at 1040px, 800px and 540px.
- `js/icons.js` defines the icon set and injects the sprite. Every page loads it first.
- `js/data.js` holds the Greetie profiles, the meet lengths, the pricing function, the shared card renderer and the demo session and booking helpers.
- `js/app.js` builds the navigation and footer on every page and provides the report dialog.
- `js/home.js`, `js/about.js`, `js/auth.js`, `js/dashboard.js`, `js/profile.js` and `js/safety.js` are the per page scripts.

## Running it locally

There is no build step. Serve the folder over HTTP so the pages can load each other:

```bash
npx serve static_site
```

Opening `static_site/index.html` straight from the file system also works, though a real HTTP origin behaves closer to production.

## Current state

This is a working front end with no backend behind it yet. Profiles are defined in `js/data.js`. Sign in accepts any valid looking email and password, and the session is kept in browser storage so the routes and the flows run end to end.

Because there is no server, the sign in form asks which side you are on. Choosing Greetie lets you pick which profile you are signing in as, which is how you reach the request inbox and accept or decline a booking. Both sides read the same booking list, so a request made as a fan appears for the Greetie, and the status the Greetie sets shows back on the fan dashboard.

No payment is taken, no call is placed, no report is delivered and no identity is verified. Those parts need a server.

## What comes next

- A backend for accounts, profiles and sessions, replacing the browser storage stand in.
- Real payment handling, including holding funds until a meet happens and refunding a no show.
- Identity verification for Greeties before their first payout.
- The video and voice calling layer.
- Delivering reports to a safety team and the tooling for them to act on one.
- Availability and scheduling, so a booking lands on a real calendar slot.

## Deployment

The site is deployed on Vercel as a static build. `vercel.json` points the output directory at `static_site`, so nothing is compiled and every push to `main` publishes.

To deploy from your own machine:

```bash
vercel --prod
```
