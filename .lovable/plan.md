

# Major Update — Project Owner Staking Controls, Master Game Controls, Safety Branding & Go-Live Checklist

## Overview

This update covers four areas: (1) letting project owners control how their community stakes, (2) giving the Master exclusive control over all game/casino economics, (3) adding a prominent "Safety First" section to the cover page, and (4) providing a clear go-live checklist for Ethereum staking.

---

## 1. Project Owner Staking Controls

**What changes:** When a user clicks "Stake Now" on any pool, the staking options they see (modes, lock periods, fees, reward multipliers) are configured by that pool's project owner — not hardcoded.

**Implementation:**
- Add columns to `staking_pools` table via migration:
  - `allowed_modes` (text[], default `{'soft','hard','flexible'}`) — which staking modes are enabled
  - `custom_lock_options` (int[], default `{7,14,30,60,90}`) — available lock durations in days
  - `soft_reward_multiplier` (numeric, default 0.8)
  - `hard_reward_multiplier` (numeric, default 1.2)
  - `early_unlock_enabled` (boolean, default true)
  - `pool_description` (text, nullable)
  - `pool_banner_url` (text, nullable)
- Update `StakeModal.tsx` to read these from the pool data instead of using hardcoded values
- Update `ProjectPanel.tsx` to let project owners configure these fields for their pools
- RLS already allows project owners to update pools via the `restrict_project_owner_updates` trigger — we add these new fields as "allowed" (not protected)

## 2. Master-Only Game & Casino Controls

**What changes:** Only the Master can set pricing, payout rates, and toggle availability for all games (Prize Wheel, Lottery, Casino, NFT Randomizer).

**Implementation:**
- Add `platform_settings` entries for game economics: `wheel_spin_cost`, `wheel_max_payout`, `lottery_ticket_price`, `lottery_payout_pct`, `casino_house_edge`, `randomizer_cost`, `randomizer_payout`
- Add a "Game Economics" section to `MasterPanel.tsx` with sliders/inputs for each setting
- Remove any game-pricing controls from Admin panel (Admin can only toggle on/off via existing `FeatureToggles`)
- Update game pages (Arcade, Lottery, PrizeWheel) to read pricing from `platform_settings`

## 3. "Safety First" Cover Page Section

**What changes:** Add a dedicated, prominent safety section to `Index.tsx` between the ecosystem teasers and footer.

**Content:**
- Heading: "SAFETY IS OUR FOUNDATION"
- Copy emphasizing: OpenZeppelin audited contracts, ReentrancyGuard + Pausable, role-based access with 4-tier hierarchy, emergency unlock protection, Row-Level Security on all data, HIBP password checks, PIN + OTP 2FA on all staff panels, smart contract audit required before mainnet
- Visual: Shield icon with animated glow, security feature badges in a grid
- Tone: "We don't cut corners. Every line of code, every access rule, every transaction is built with your safety as the non-negotiable priority."

## 4. Go-Live Checklist — What You Need To Do

This is a clear list of steps required to start staking NFTs live on Ethereum. No code changes needed for this section — it's informational.

### Smart Contract Deployment
1. **Get the contract audited** — `StakeForgeVault.sol` MUST be professionally audited before mainnet. This is non-negotiable. Cost: typically $5K–$25K depending on auditor. Recommended: Trail of Bits, OpenZeppelin, Certik, or Code4rena.
2. **Deploy to Sepolia testnet first** — Use the existing `contracts/scripts/deploy.js` with Hardhat. You need a Sepolia RPC URL (Alchemy/Infura free tier) and a funded Sepolia wallet.
3. **Update contract addresses** — After deploy, update `src/lib/contracts/config.ts` with the deployed vault address for chain ID `11155111` (Sepolia) and later `1` (mainnet).
4. **Test end-to-end on testnet** — Stake, unstake, emergency unlock, fee collection — all on Sepolia before touching mainnet.

### Backend / API Status
- **Database**: Fully configured with RLS, triggers, and role hierarchy. Ready.
- **Edge functions**: `eth-price` function deployed. Ready.
- **Auth**: Email + wallet connect flows built. Ready.
- **No outsourcing needed for backend** — the current Lovable Cloud backend handles all data, auth, and serverless functions. The only external dependency is the Ethereum smart contract deployment and audit.

### What You Need From WeGens (or Any Project)
- NFT contract address (ERC-721, deployed on Ethereum)
- Collection metadata (name, logo, banner, description)
- Desired staking configuration (modes, lock periods, reward token)
- Wallet address for fee collection
- Community links (Discord, Twitter/X)

### Items That Need External Services
- **Smart contract audit**: Must be outsourced to a professional auditor
- **RPC provider**: Alchemy or Infura account (free tier works for testnet)
- **Domain**: Custom domain setup if desired (currently on `stakify.lovable.app`)

---

## Technical Approach

### Database migration
New columns on `staking_pools` for project-owner-configurable staking options.

### Files to modify
- `src/components/StakeModal.tsx` — Read pool config for modes, durations, multipliers
- `src/pages/ProjectPanel.tsx` — Add staking config UI for project owners
- `src/pages/MasterPanel.tsx` — Add "Game Economics" section
- `src/pages/Index.tsx` — Add "Safety First" section
- `src/pages/Arcade.tsx` / `src/components/PrizeWheel.tsx` — Read pricing from platform_settings

### Files unchanged
- Smart contract (`StakeForgeVault.sol`) — already complete, needs audit not code changes
- Backend edge functions — already sufficient
- Auth system — already built

