

# Major Platform Update — Admin Controls, Project Owner Tools, Cover Page & Teasers

## Overview

This is a large update touching four major areas: (1) enhanced Admin panel with better project oversight, staker snapshots, and money management, (2) expanded Project Owner panel with staking configuration options, (3) Master panel cleanup with better oversight, and (4) a revamped cover page (Index) with futuristic teasers, marketing sections, and Hondro branding for the points system.

---

## 1. Revamped Cover Page (Index.tsx)

**Hero Section overhaul:**
- Add animated futuristic teaser cards that scroll down the page with icons and neon glow effects
- Feature cards for: "Staking Platform — LIVE", "Trade Store — Coming Soon", "Casino — Coming Soon", "Tokens Across All Platforms", "Launchpad for ETH & SOL — Coming Soon", "Hint to Degeneracy — All in One Platform"
- Each teaser uses motion animations (fade-in, float, scale) with neon icon accents
- Add a "Powered by Hondro Points" branding section — explain that points are created by Hondro, separate from project owner tokens, spendable in store/marketplace/prizes/games/casino
- Add a marketing-ready section at the bottom that Admin/Master can populate later with announcements
- Badge system teaser with sample badge icons (greyed/locked with "Coming Soon")
- Leaderboard teaser with blurred preview
- All "Coming Soon" items use the existing blur + badge overlay pattern

**Futuristic UI polish:**
- Animated gradient borders on teaser sections
- Particle/glow effects on scroll
- Staggered reveal animations as user scrolls down

---

## 2. Admin Panel Enhancements (Admin.tsx)

**Better project oversight:**
- Add a unified "Project Overview" card within the Projects tab showing all projects with their staking pools, active stakers count, total staked, and fee earnings in one glanceable grid
- Inline fee percentage editing with better visibility (larger font, neon-green numbers)

**Snapshot feature:**
- New "Snapshot" button on each pool — captures all active stakers (wallet address, user_id, display_name, staked amount, duration) into a downloadable list
- One-click "Reward All" from snapshot — bulk airdrop to all captured stakers with copy/paste wallet support

**Money management improvements:**
- Cleaner payment recording UI with larger, more visible input fields
- Quick-action buttons: "Send Payment", "Record Incoming", "Mark Paid"
- Payment history with status badges (paid/pending/overdue) in neon-green/yellow/red

**Tab transition animations:**
- Each tab content gets a fade-in + slide-up entrance animation using framer-motion
- Tab headers get subtle glow on active state

---

## 3. Project Owner Panel Enhancements (ProjectPanel.tsx)

**Staking configuration options:**
- Allow project owners to configure within their allowed range:
  - Community fee (1-5%)
  - Preferred lock periods (dropdown: 7/14/30/60/90 days)
  - Reward token name and display
  - Enable/disable early unlock for their pools
  - Custom pool description/banner
- All changes go through existing RLS — protected fields remain locked

**Community oversight:**
- Staker list view showing who's staked, how much, and for how long
- Simple snapshot/export of their own stakers
- Airdrop improvements — bulk select from staker list

---

## 4. Master Panel Cleanup (MasterPanel.tsx)

**Better oversight UI:**
- Add a "Platform Overview" dashboard card at the top showing: total platform revenue, total stakers across all projects, total pools, active projects
- Cleaner tab organization with animated transitions
- Project-level drill-down view — click any project to see its pools, stakers, revenue

**Hondro Points System placeholder:**
- New "Points System" section (Coming Soon badge) with description: "Hondro Points — earned across all platform activities, spendable in Store, Marketplace, Games & Casino"
- Visual mockup of points earning flow (stake → earn points → spend in store)

---

## 5. UI Animations Across All Panels

- Every tab switch gets a `motion.div` wrapper with `animate-fade-in` entrance
- Active tab indicator glows with neon-cyan
- Cards use `hover-scale` utility class
- Stats numbers use a count-up animation on mount
- Futuristic border glow on focused/active sections

---

## Technical Approach

### Files to modify:
- `src/pages/Index.tsx` — Add teaser sections, marketing area, Hondro branding, futuristic scroll animations
- `src/pages/Admin.tsx` — Add snapshot feature, improve project overview, better payment UI, tab animations
- `src/pages/ProjectPanel.tsx` — Add staking config options, staker list, bulk airdrop
- `src/pages/MasterPanel.tsx` — Add platform overview dashboard, points system teaser, animated tabs
- `src/index.css` — Add any new animation keyframes needed

### No database changes required
All new features use existing tables and RLS policies. The snapshot feature reads from `stakes` + `profiles` (already accessible to admin). Project owner config changes use existing `staking_pools` columns.

### Component extraction
Given the size of Admin.tsx (1486 lines) and MasterPanel.tsx (1366 lines), new sections will be built as separate components where possible to keep files manageable:
- `src/components/admin/SnapshotPanel.tsx`
- `src/components/admin/ProjectOverview.tsx`
- `src/components/CoverTeasers.tsx`
- `src/components/HondroPointsTeaser.tsx`

