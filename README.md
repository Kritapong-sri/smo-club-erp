This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Local development with Supabase

Create a local `.env` and configure:

```bash
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@<pooler-host>:5432/postgres"
DIRECT_URL="postgresql://postgres.<project-ref>:<password>@<pooler-host>:5432/postgres"
SESSION_SECRET="a-long-random-value-used-to-sign-session-cookies"
```

Use the exact connection string from **Supabase Dashboard → Connect**. For a local persistent Next.js server, the shared session pooler on port `5432` works with Prisma and IPv4 networks. For a serverless deployment, use transaction mode on port `6543` for `DATABASE_URL`, add `?pgbouncer=true`, and retain a session/direct URL for migrations.

Passwords are hashed by the application server with `scrypt` before they are stored in Postgres. Existing plaintext or empty passwords remain usable and are upgraded to a hash after the next successful login.

Validate the schema and start the development server:

```bash
npx prisma validate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Never commit `.env`, database passwords, OAuth client secrets, private keys, or refresh tokens. If a credential is pasted into a chat, terminal log, or source file, revoke or rotate it at the provider and replace the value in every deployment environment.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
