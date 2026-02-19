# PawsitiveWalks Design Document

## Members

- Jiahui Zhou
- Yi-Peng Chiang

## Project Description

A zero-fee community platform connecting dog owners with trusted dog walkers. Unlike commercial services, PawsitiveWalks serves as a simple bridge — not a middleman — displaying contact information directly for free negotiation. Dog owners post walking requests; walkers create profiles showcasing their experience and availability. The platform also enables group walks, social meetups, and welcomes dog lovers without pets to gain hands-on experience.

## Project Objective

- Build a zero-fee community platform where dog owners and walkers can connect directly without platform commissions.
- Support two full workflows: posting dog walking requests and publishing dog walker profiles.
- Provide account-based access control so users can manage only their own posts.
- Make discovery practical with filtering, pagination, and location/time preference matching.
- Keep deployment production-ready using MongoDB Atlas + Render with environment-based secrets and guarded seed scripts.

## Core Features

- Authentication: register, login, logout, and current-user session check (`/api/auth/me`).
- Requests workflow: create, read, update, delete, filter, paginate, and ownership-protected editing.
- Walkers workflow: create, read, update, delete, filter, paginate, and ownership-protected editing.
- Dashboard: logged-in user summary and logout actions.
- Seed tooling: generate 1000 requests + 1000 walkers with production safety checks.
- Health endpoint for deployment verification: `/api/health`.

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

## Design Mockup

- home

- about

- find requests

- become a walker

- register

- signin

- dashboard
