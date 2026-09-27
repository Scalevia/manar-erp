# ManarERP

ERP for a wholesale clothing trader in El Qantara West who buys fabric, sends
it to CMT factories, receives finished garments, and sells wholesale on cash or
credit.

Mobile-first Arabic (RTL) PWA. Built for one owner on an iPhone today, with the
schema and permission model designed so staff accounts can be added later
without a rewrite.

**[SPEC.md](./SPEC.md) is the source of truth** — domain model, business rules,
costing logic, roles, and the onboarding plan. It is written in Arabic, in the
vocabulary the shop owner actually uses.

## Status

Frontend prototype for design review. Every screen reads from `lib/mock.ts`;
**no backend is wired up yet.**

| Working | Display only |
| --- | --- |
| Sales invoice (customer pick → lines → partial payment) | Dashboard, inventory detail, ledgers |
| Inventory search by model code | Manufacturing orders, purchases, reports |
| Fast stock entry (setup) | Collect / pay / settle buttons |

Of the nine operations in the spec, only **بيع** has a real screen so far.
Receiving from a factory, collections, purchases, returns, cash transfers and
the login/PIN flow are still to build.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Lucide · Supabase (planned)

## Develop

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. To test on a phone, use the Network URL that
`next dev` prints and make sure the phone is on the same Wi-Fi.

## Conventions

- **Money is integers in piastres.** Never floats. `lib/format.ts` handles
  display; `p()` converts EGP to piastres in mock data.
- **Latin digits (0-9)**, not Arabic-Indic — they read faster and match phones
  and calculators.
- **No accounting vocabulary in the UI.** The ledger is double-entry
  underneath, but the screen says ليا / عليا, never مدين / دائن. The full
  glossary is in SPEC.md section 2.
- **Model codes repeat.** The same code can exist at two different costs from
  two manufacturing orders — duplicates are expected, not an error.
- Commit messages and PR descriptions in English; code comments, UI strings and
  SPEC.md in Arabic.
