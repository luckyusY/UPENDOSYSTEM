# Upendo System

Mobile-installable reporting system for a bar and restaurant. The interface is in Kinyarwanda and captures daily sales, payment methods, expenses, purchases, stock movement, staff count, and notes.

## Getting Started

Create `.env.local` from `.env.example`, then run:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser. On supported mobile browsers, use the install prompt or browser menu to add it to the home screen.

## Main Features

- Kinyarwanda daily operations dashboard
- MongoDB storage through `MONGODB_URI`
- PWA manifest and service worker for mobile installation
- Daily closing summary and seven-day trend
- Local secret handling through ignored `.env.local`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
