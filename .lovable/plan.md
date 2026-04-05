

# Pitch Documents for the WeGens

## What We're Building
Two professional pitch documents (PDF + PPTX) that present the staking platform to the WeGens as their first project partner. The pitch positions us as developers who built a turnkey NFT staking infrastructure and need their project to be the launch partner.

## Content Structure

**1. Cover / Title Slide**
- Platform name (placeholder since no final name yet)
- "NFT Staking Infrastructure — Built for Communities"
- "Developer Partnership Proposal for WeGens"

**2. The Problem**
- NFT holders have no utility for their assets between trades
- Projects struggle to retain holders and build loyalty
- Building custom staking infrastructure is expensive and risky

**3. The Solution — What We Built**
- Turnkey NFT staking platform on Ethereum
- Soft stake, hard stake, and flexible modes
- Branded project pages, collection-based NFT views
- Smart contract (Solidity, OpenZeppelin, auditable)
- Admin dashboard with full project controls

**4. What WeGens Gets**
- First project on the platform (OG status)
- Own branded staking pool with custom settings
- Raffle House for community giveaways
- Airdrop tools to reward holders
- Real-time analytics dashboard
- Social hub (coming soon) — chat rooms, live stages

**5. Fee Structure — How Everyone Eats**
- Platform tx fee: $0.50/action (infrastructure cost)
- Platform % on stakes: 2%
- Admin (WeGens) operator fee: 3–8% (they choose)
- Admin listing fee from projects they onboard: $75–$500/mo (keep 85%)
- Early unlock split: 60% admin / 40% platform
- Project community fee: 1–5% (projects choose)

**6. What We Need From WeGens**
- NFT contract address (ERC-721)
- Collection metadata (name, logo, banner, description)
- Desired lock periods and reward structure
- Wallet address for fee collection
- Community links (Discord, Twitter/X)
- Branding assets

**7. Technical Readiness**
- Smart contract written (StakeForgeVault.sol) — needs audit before mainnet
- Frontend live and functional
- Database secured with role-based access
- Master/Admin/Operator/Project role hierarchy
- Emergency controls (pause, bulk unlock, wallet switch)

**8. Roadmap / Coming Soon**
- Points system & badge earnings
- Social hub with live chat rooms
- Arcade games
- Multi-chain support (Solana)
- Platform token

**9. Security**
- OpenZeppelin contracts (AccessControl, ReentrancyGuard, Pausable)
- Row-level security on all database tables
- Role escalation protection
- Professional audit required before mainnet

**10. Call to Action**
- "Be the first. Be the OG."
- Next steps checklist

## Technical Approach

### PDF
- Generated with ReportLab (Python)
- Dark theme with cyan/green accents matching the platform aesthetic
- Professional layout with the platform's visual identity

### PPTX
- Generated with pptxgenjs (Node.js)
- Same dark theme, slide-by-slide matching the PDF content
- Designed for screen presentation

### Deliverables
- `/mnt/documents/WeGens_Pitch.pdf`
- `/mnt/documents/WeGens_Pitch.pptx`

Both will be QA'd visually before delivery.

