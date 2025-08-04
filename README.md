# CRM System - Skalbart Multi-Tenant CRM

Ett modernt CRM-system byggt med Next.js 14, Prisma, PostgreSQL och Clerk för autentisering.

## 🚀 Funktioner

### MVP-version
- ✅ Multi-tenant arkitektur (flera företag)
- ✅ Säker autentisering med Clerk
- ✅ Dashboard med översikt
- ✅ Kontakt-/leadregister med taggar och status
- ✅ E-postutskick med tracking
- ✅ Påminnelser och uppföljning
- ✅ Sök och filter
- ✅ Rollbaserad åtkomst (user/admin)
- ✅ Soft delete funktionalitet
- ✅ Admin-panel

## 📁 Projektstruktur

```
/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── leads/
│   │   │   ├── admin/
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── leads/
│   │   ├── dashboard/
│   │   └── admin/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── utils.ts
│   │   └── email.ts
│   └── types/
└── public/
```

## 🛠️ Teknikstack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL) med Row Level Security
- **Autentisering**: Supabase Auth
- **Fillagring**: Cloudflare R2
- **E-post**: Resend
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **TypeScript**: För typsäkerhet

## 🔧 Installation och Setup

### 1. Klona och installera dependencies

```bash
npm install
```

### 2. Sätt upp miljövariabler

Skapa `.env.local` med följande variabler:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_PROJECT_ID=your-project-id

# Cloudflare R2
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key
CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_URL=https://your-custom-domain.com

# Resend (Email)
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 3. Sätt upp Supabase

1. Skapa ett nytt projekt på [supabase.com](https://supabase.com)
2. Kör migrations:
```bash
npx supabase login
npx supabase link --project-ref your-project-id
npx supabase db push
```

### 4. Sätt upp Cloudflare R2

1. Skapa en R2 bucket på Cloudflare Dashboard
2. Konfigurera CORS för webbladdning
3. Skapa API tokens för åtkomst

### 5. Starta utvecklingsservern

```bash
npm run dev
```

Öppna [http://localhost:3001](http://localhost:3001) i din webbläsare.

## 📊 Datamodell

### Company (Multi-tenant)
- Varje företag har sina egna leads, användare och data
- Isolerad data mellan företag

### User
- Tillhör ett företag
- Roller: USER eller ADMIN
- Soft delete support

### Lead
- Kontakter/potentiella kunder
- Taggar, status, anteckningar
- Tilldelning till användare
- Soft delete support

### EmailLog
- Loggning av alla utskick
- Tracking av öppningar via pixel

### Reminder
- Påminnelser kopplade till leads
- Automatiska notifikationer

## 🔐 Säkerhet

- Middleware för route protection
- Company-baserad data isolation
- Rollbaserad åtkomst (RBAC)
- Server-side validation
- SQL injection skydd via Prisma

## 🚧 TODO: Framtida utbyggnad

- [ ] AI-assistans för lead-scoring
- [ ] Bulk-operationer för e-post
- [ ] API-integrationer (CRM-system, social media)
- [ ] Avancerad rapportering och analytics
- [ ] Fakturering och betalningar
- [ ] Mobile app
- [ ] Webhook support
- [ ] Export/import funktionalitet
- [ ] E-post templates
- [ ] SMS-integration

## 📝 API Endpoints

### Leads
- `GET /api/leads` - Lista alla leads
- `POST /api/leads` - Skapa ny lead
- `PUT /api/leads/[id]` - Uppdatera lead
- `DELETE /api/leads/[id]` - Soft delete lead

### Email
- `POST /api/email/send` - Skicka e-post
- `GET /api/email/track/[id]` - Tracking pixel

### Admin
- `GET /api/admin/users` - Lista användare
- `POST /api/admin/users` - Skapa användare
- `PUT /api/admin/users/[id]` - Uppdatera användare

## 📄 Licens

MIT License
