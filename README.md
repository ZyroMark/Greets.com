# Greets.com

Greets.com is a front end prototype for a platform that connects two kinds of people: Greeters, who host and show visitors around, and Greeties, who are looking to meet someone. The prototype is a static site built with plain HTML, CSS and JavaScript. It runs in any browser with no build step and no install.

## What is in here

The whole site lives in `static_site/`:

- `index.html` is the landing experience. It renders an interactive map of Greeters as floating nodes, draws connection lines between nearby nodes on a canvas layer, and pairs it with a sidebar that handles sign in, registration, profile viewing and profile editing.
- `dashboard.html` is the browse view. It shows a card grid of profiles with tabs for switching between Greeties and Greeters.
- `css/style.css` holds the full design system. Dark background, purple and pink gradients, glassmorphism cards, blurred background blobs, and a small set of utility classes for layout.
- `js/main.js` drives the map, the canvas connection lines, and the sidebar state machine.
- `js/dashboard.js` loads profiles and renders the card grid.

## Running it locally

There is no build step. Open `static_site/index.html` directly in a browser, or serve the folder if you prefer a real HTTP origin:

```bash
cd static_site
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Data

Profiles are hardcoded in the JavaScript files. The dashboard first tries to fetch from `http://localhost:5000/api/users` with a one second timeout, and quietly falls back to the built in sample profiles when nothing answers. That means the site works fully offline, and it will pick up a real backend later without any change to the markup.

Sign in, registration, meetup requests and messaging are stubs. They confirm the action and update the view, but nothing is sent anywhere and nothing is stored between page loads.

## Deployment

The site is deployed on Vercel as a static build. `vercel.json` points the output directory at `static_site`, so there is nothing to compile and every push to `main` publishes.

To deploy from your own machine:

```bash
vercel --prod
```

## Status

This is a design and interaction prototype, not a finished product. The next steps are a real backend for accounts and profiles, persistent storage, actual messaging, and moving the map from random node placement to real geography.
