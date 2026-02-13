# Unimpossible Website

Marketing website for Unimpossible Consultants Limited — AI delivery partner specializing in autonomous agent systems.

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components
- **Resend** for email delivery

## Features

- 🏠 Homepage with hero, services overview, and agent preview
- 👥 Team page showcasing all 13 AIMY agents
- 🛠️ Services pages (AI Project Delivery, Fractional AI CTO, AI Integration, Hospitality AI)
- 📚 Case studies with real project results
- 📧 Contact form with email notifications
- 📖 Blog (placeholder)
- ⚖️ Legal pages (Privacy Policy, Terms of Service)

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and add your `RESEND_API_KEY`
4. Run development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Deployment

Designed for deployment on Vercel:

1. Connect GitHub repo to Vercel
2. Set `RESEND_API_KEY` environment variable
3. Configure custom domain (unimpossible.co.uk)
4. Deploy!

## Project Structure

```
app/
├── page.tsx              # Homepage
├── team/                 # AI team profiles
├── services/             # Service pages
├── case-studies/         # Case studies
├── about/                # About David
├── blog/                 # Blog (placeholder)
├── contact/              # Contact form
├── legal/                # Privacy & Terms
└── api/contact/          # Contact form API route

data/
├── agents.ts             # 13 AIMY agent profiles
├── case-studies.ts       # Case study content
└── services.ts           # Service descriptions

components/
├── ui/                   # shadcn/ui components
├── hero.tsx              # Homepage hero
├── agent-card.tsx        # Agent profile card
├── navbar.tsx            # Site navigation
└── footer.tsx            # Site footer
```

## License

© 2026 Unimpossible Consultants Limited. All rights reserved.
