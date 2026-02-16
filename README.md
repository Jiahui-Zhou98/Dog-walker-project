# PawsitiveWalks

## Members

- Jiahui Zhou
- Yi-Peng Chiang

## Class Link

- CS5610-2026-Spring: https://johnguerra.co/classes/webDevelopment_online_spring_2026/
- Class Project2

## Website Link

- todo: add link here after deployment

## Project Link

- GitHub Repo: https://github.com/Jiahui-Zhou98/Dog-walker-project.git

## Project Description

A zero-fee community platform connecting dog owners with trusted dog walkers. Unlike commercial services, PawsitiveWalks serves as a simple bridge — not a middleman — displaying contact information directly for free negotiation. Dog owners post walking requests; walkers create profiles showcasing their experience and availability. The platform also enables group walks, social meetups, and welcomes dog lovers without pets to gain hands-on experience.

## Project Objective

- todo: add objective here

## User Personas

1. **Busy Dog Owner** — Works long hours, needs flexible walking help at affordable rates
2. **Dog Enthusiast** — Loves dogs but can't own one, wants hands-on experience through walking
3. **Social Dog Owner** — Wants to connect with other owners for group walks, playdates, and tips

## User Stories

### Jiahui Zhou

1. As a dog owner, I want to post walking requests with my dog's details and schedule, so potential walkers can assess fit.
2. As a dog owner, I want to view, edit, and delete my requests, so I can manage changing needs.
3. As a dog owner, I want to find other dog owners in my area for group walks or playdates.
4. As a dog owner, I want to post "looking for walking buddy" requests, so I can coordinate regular meetups with other owners.
5. As a walker, I want to browse requests filtered by location, dog size, and time, so I can find opportunities matching my comfort level and schedule.

---

### Yi-Peng Chiang

1. As a walker, I want to create a profile with my background, experience level, and availability, so owners can discover me.
2. As a walker, I want to edit my profile and mark myself inactive when unavailable, so I control my availability.
3. As a walker, I want to delete my profile when no longer offering services.
4. As someone who loves dogs but can't own one, I want to create a walker profile explaining my interest in gaining experience, so owners understand my motivation is building dog knowledge and enjoying their company.
5. As an owner, I want to browse walker profiles filtered by experience and location, so I can find suitable help.

## Tech Stack

- **Backend**: Node.js, Express 5
- **Frontend**: Vanilla ES6 JavaScript, HTML5, CSS3, Bootstrap 5
- **Database**: MongoDB (native driver, no Mongoose)
- **Dev Tools**: Nodemon, ESLint, Prettier
- **No React, No Mongoose, No Server-Side Rendering**

## Project Structure

```
dog-walker/
├── backend.js                  # Express server entry point (Shared)
├── package.json
├── .env                        # Environment variables (not in repo)
├── .gitignore
│
├── db/
│   ├── connection.js           # Shared MongoDB connection helper
│   ├── RequestsDB.js           # Jiahui  - Requests database methods
│   └── WalkersDB.js            # Yi-Peng - Walkers database methods
│
├── routes/
│   ├── requests.js             # Jiahui  - Requests API routes
│   └── walkers.js              # Yi-Peng - Walkers API routes
│
├── data/
│   ├── seed-requests.js        # Jiahui  - Seed 1000 request records
│   └── seed-walkers.js         # Yi-Peng - Seed walker records (TBD)
│
└── frontend/
    ├── index.html              # Jiahui  - Home page
    ├── requests.html           # Jiahui  - Browse walking requests
    ├── post-request.html       # Jiahui  - Post a new request form
    ├── edit-request.html       # Jiahui  - Edit an existing request
    ├── walkers.html            # Yi-Peng - Browse walker profiles
    ├── about.html              # Yi-Peng - About page
    │
    |__ image/
    |   |__ og-image.png        # Jiahui  - Open graph
    |   |__ favicon.png         # Yi-Peng - Favicon
    |
    |__ videos/
    |   |__ hero.mp4            # Jiahui  - Developed for Home page
    |
    ├── css/
    │   ├── main.css            # Shared  - Variables, navbar, footer, buttons
    │   ├── index.css           # Jiahui  - Home page styles
    │   ├── requests.css        # Jiahui  - Request pages styles
    │   ├── walkers.css         # Yi-Peng - Walker pages styles
    │   └── about.css           # Yi-Peng - About page styles
    │
    └── js/
        ├── requestsModule.js   # Jiahui  - Requests list logic & pagination
        ├── postRequestModule.js# Jiahui  - Post request form logic
        └── editRequestModule.js# Jiahui  - Edit request form logic
```

## Division of Work

Each team member independently implemented a **complete full-stack feature**, covering all layers: **Database (MongoDB) → Backend API (Express) → Frontend (HTML/CSS/JS)**.

---

### Jiahui Zhou — Dog Walking Requests (`requests` collection)

Jiahui Zhou built the full-stack Dog Walking Requests feature around the `requests` MongoDB collection. On the database layer, she designed the requests schema and implemented CRUD methods in `RequestsDB.js`, plus a seed script that generates 1,000 realistic test records with randomized dog names, breeds, and Boston-area locations. On the backend, she created API endpoints in `routes/requests.js`. On the frontend, she built four HTML pages — a home page with hero section and call-to-action, a requests listing page with five-field filtering and pagination, a post-request form, and an edit-request form — along with three JavaScript modules handling dynamic rendering, form submission, and pre-populated editing, and two CSS files (index.css, requests.css) for page-specific styling.

---

### Yi-Peng Chiang — Walker Profiles (`walkers` collection)

Yi-Peng Chiang built the full-stack Walker Profiles feature around the `walkers` MongoDB collection. On the database layer, she designed the walkers schema and implemented CRUD methods in `WalkersDB.js`, plus a seed script for generating test walker records. On the backend, she created API endpoints in `routes/walkers.js` for listing, viewing, creating, updating, and deleting walker profiles. On the frontend, she built the Walkers page (walkers.html) for browsing and managing walker profiles with filtering and pagination, and the About page (about.html) introducing the platform, each with dedicated CSS files (walkers.css, about.css).

---

### Shared Work

| Component               | Description                                                           |
| ----------------------- | --------------------------------------------------------------------- |
| `backend.js`            | Express server setup, middleware, route mounting                      |
| `db/connection.js`      | Shared MongoDB connection helper used by both DB modules              |
| `frontend/css/main.css` | Global CSS variables, navbar, footer, shared buttons, responsive base |

---

### Components

- Jiahui Zhou:
  1. Open graph design
  - Tools used: Canva(https://www.canva.com/), Uchinoko Maker(https://uchinoko-maker.jp/?lang=en)
  - Image path: `frontend/images/og-image.png`
  2. Home page video design
  - Tools used: Deepseek(https://chat.deepseek.com/), Jimeng AI(https://jimeng.jianying.com/ai-tool/home)
  - Video path: `frontend/videos/hero.mp4`

- Yi-Peng Chiang: Favicon design
  - Tools used: Canva(https://www.canva.com/), favicon.io(https://favicon.io/favicon-converter/)
  - Image path: `frontend/images/favicon.png`

---

## Design Document Link

- todo: add link here

## Screenshots

- todo: add screenshots after deployment

## Instructions (How to get started)

### Prerequisites

- Node.js (v18+)
- MongoDB (running locally or via Atlas)

### Installation

```bash
git clone <https://github.com/Jiahui-Zhou98/Dog-walker-project.git>
cd dog-walker
npm install
```

### Environment Setup

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

Required variables:

```
MONGODB_URI=mongodb://localhost:27017
PORT=3000
SESSION_SECRET=replace_with_a_long_random_secret
```

Generate a strong `SESSION_SECRET` (example):

```bash
openssl rand -base64 48
```

Security note: never commit `.env` or real Atlas credentials to GitHub.

### Seed the Database

```bash
npm run seed:requests
```

This generates 1000 dog walking request records in the `pawsitiveWalks` database.

```bash
npm run seed:walkers
```

This generates 1000 dog walkers profile records in the `pawsitiveWalks` database.

### Run the App

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Then visit [http://localhost:3000](http://localhost:3000).

## License

MIT

## Slides and Video Demonstration

- Slides link: add here

- Video link: add here
