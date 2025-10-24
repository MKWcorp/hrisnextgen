# Setup Authentication & Business Unit Integration

Dokumentasi untuk mengintegrasikan authentication dan business_unit_id dengan sistem HRIS Next Gen.

## Overview

Sistem telah diperbarui untuk mendukung multi-tenant architecture dengan business units. Setiap user dan strategic goal sekarang terhubung dengan business_unit_id.

Alur:
1. User login dengan authentication provider
2. Session berisi `user.id` dan `user.business_unit_id`
3. Saat create goal, `business_unit_id` otomatis diambil dari session
4. Goal tersimpan dengan business_unit_id yang tepat

## Implementasi Authentication

### Opsi 1: NextAuth.js (Recommended)

#### 1. Install Package
```bash
npm install next-auth @next-auth/prisma-adapter
```

#### 2. Buat auth.ts Configuration
```typescript
// lib/auth-options.ts
import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        business_unit_id: { label: "Business Unit ID", type: "hidden" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Query user dengan business_unit_id
        const user = await prisma.users.findUnique({
          where: { email: credentials.email },
          include: { business_units: true },
        });

        if (!user) return null;

        // Validate password (implement sesuai kebutuhan)
        // const isValid = await verifyPassword(credentials.password, user.password);
        // if (!isValid) return null;

        return {
          id: user.user_id,
          email: user.email,
          name: user.name,
          business_unit_id: user.business_unit_id,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.business_unit_id = (user as any).business_unit_id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).business_unit_id = token.business_unit_id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
```

#### 3. Update lib/auth.ts untuk NextAuth
```typescript
// lib/auth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function getUserSession() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) return null;
  
  return {
    user: {
      id: (session.user as any).id || '',
      name: session.user.name,
      email: session.user.email,
      business_unit_id: (session.user as any).business_unit_id || '',
    }
  };
}
```

---

### Opsi 2: Clerk

#### 1. Install Package
```bash
npm install @clerk/nextjs
```

#### 2. Setup Environment Variables
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
```

#### 3. Update lib/auth.ts untuk Clerk
```typescript
// lib/auth.ts
import { auth, currentUser } from "@clerk/nextjs/server";

export async function getUserSession() {
  const { userId } = await auth();
  
  if (!userId) return null;
  
  const user = await currentUser();
  
  if (!user) return null;
  
  // Ambil business_unit_id dari Clerk metadata
  const businessUnitId = user.publicMetadata?.business_unit_id;
  
  if (!businessUnitId) return null;
  
  return {
    user: {
      id: userId,
      name: user.firstName || user.emailAddresses[0].emailAddress,
      email: user.emailAddresses[0]?.emailAddress,
      business_unit_id: businessUnitId as string,
    }
  };
}
```

---

### Opsi 3: Supabase Auth

#### 1. Install Package
```bash
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
```

#### 2. Update lib/auth.ts untuk Supabase
```typescript
// lib/auth.ts
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getUserSession() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) return null;
  
  // Ambil data user dari database untuk mendapatkan business_unit_id
  const user = await prisma.users.findUnique({
    where: { email: session.user.email || '' },
  });
  
  if (!user) return null;
  
  return {
    user: {
      id: user.user_id,
      name: user.name,
      email: user.email,
      business_unit_id: user.business_unit_id,
    }
  };
}
```

---

## Testing

### 1. Test API Endpoint

```bash
# Pastikan dulu login untuk mendapatkan session yang valid

curl -X POST http://localhost:3000/api/goals \
  -H "Content-Type: application/json" \
  -d '{
    "goal_name": "Test Goal",
    "target_value": 1000000,
    "start_date": "2025-01-01",
    "end_date": "2025-12-31",
    "alokasi_platform": [{"platform": "TikTok", "percentage": 100}],
    "alokasi_sumber": [{"source": "Organik", "percentage": 100}]
  }'
```

Expected Response (201 Created):
```json
{
  "goal_id": "uuid",
  "goal_name": "Test Goal",
  "target_value": "1000000",
  "business_unit_id": "bu-001",
  "status": "Pending",
  "message": "Goal created successfully"
}
```

### 2. Test Frontend Form

1. Buka: `http://localhost:3000/dashboard/goals/create`
2. Isi form dengan data
3. Klik "Buat Goal & Trigger AI Workflow"
4. Cek console untuk response

---

## Development Mode

Untuk development tanpa setup lengkap authentication, gunakan dummy session:

```bash
# Set environment variable
export NODE_ENV=development
export USE_DUMMY_SESSION=true
npm run dev
```

Dummy session di `lib/auth.ts` akan digunakan dengan:
- `business_unit_id: 'bu-001'`
- User ID: `'user-123'`

---

## Troubleshooting

### Error: "No session found"
- Pastikan user sudah login
- Cek cookies browser (Dev Tools > Application > Cookies)

### Error: "User does not have business_unit_id"
- Pastikan user table ter-update dengan business_unit_id
- Cek `users` table di database

### Error: "Business unit not found or invalid"
- Pastikan `business_units` table ada data
- Pastikan foreign key constraint valid

---

## Database Schema Verification

```sql
-- Verify business_units table
SELECT * FROM business_units;

-- Verify users punya business_unit_id
SELECT user_id, email, business_unit_id FROM users;

-- Verify strategic_goals punya business_unit_id
SELECT goal_id, goal_name, business_unit_id FROM strategic_goals;

-- Verify foreign keys
SELECT * FROM information_schema.referential_constraints 
WHERE constraint_name LIKE '%business_unit%';
```

---

## Next Steps

1. Setup authentication provider (NextAuth/Clerk/Supabase)
2. Implementasi `getUserSession()` di `lib/auth.ts`
3. Pastikan user table punya `business_unit_id`
4. Test API endpoint dengan curl
5. Test frontend form dengan login valid
6. Setup login page di `/auth/signin` atau sesuai auth provider

---

## Resources

- NextAuth.js: https://next-auth.js.org
- Clerk: https://clerk.com/docs
- Supabase: https://supabase.com/docs/guides/auth
