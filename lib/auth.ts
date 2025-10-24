import { cookies } from 'next/headers';

/**
 * Interface untuk User Session
 * Sesuaikan dengan struktur session dari NextAuth atau authentication provider Anda
 */
export interface UserSession {
  user: {
    id: string;
    name?: string;
    email?: string;
    business_unit_id: string;
  };
}

/**
 * Get user session dari request context
 * PENTING: Implement sesuai dengan auth provider Anda
 * 
 * Contoh untuk NextAuth.js:
 * import { getServerSession } from "next-auth";
 * import authOptions from "@/lib/auth-options"; // konfigurasi NextAuth Anda
 * 
 * Contoh untuk Clerk:
 * import { auth } from "@clerk/nextjs/server";
 * 
 * Contoh untuk Supabase:
 * import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
 */
export async function getUserSession(): Promise<UserSession | null> {
  try {
    // ============================================
    // OPSI 1: NextAuth.js
    // ============================================
    // Uncomment dan install: npm install next-auth
    /*
    import { getServerSession } from "next-auth";
    import authOptions from "@/lib/auth-options";
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user) return null;
    
    return {
      user: {
        id: session.user.id || '',
        name: session.user.name,
        email: session.user.email,
        business_unit_id: (session.user as any).business_unit_id || '',
      }
    };
    */

    // ============================================
    // OPSI 2: Clerk
    // ============================================
    // Uncomment dan install: npm install @clerk/nextjs
    /*
    import { auth } from "@clerk/nextjs/server";
    
    const { userId, sessionId } = await auth();
    
    if (!userId) return null;
    
    // Ambil business_unit_id dari custom claims atau metadata
    const response = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });
    
    const clerkUser = await response.json();
    
    return {
      user: {
        id: userId,
        name: clerkUser.first_name || clerkUser.email_addresses?.[0]?.email_address,
        email: clerkUser.email_addresses?.[0]?.email_address,
        business_unit_id: clerkUser.public_metadata?.business_unit_id || '',
      }
    };
    */

    // ============================================
    // OPSI 3: Custom implementation
    // ============================================
    // TODO: Implement sesuai dengan auth provider Anda
    
    // Contoh dummy untuk development:
    const dummySession: UserSession = {
      user: {
        id: 'user-123',
        name: 'John Manager',
        email: 'manager@company.com',
        business_unit_id: 'bu-001', // Ganti dengan BU ID yang valid dari database
      }
    };
    
    // Jika ada environment variable untuk mode development
    if (process.env.NODE_ENV === 'development' && process.env.USE_DUMMY_SESSION === 'true') {
      return dummySession;
    }
    
    // Jika sudah implement auth, kembalikan session yang sebenarnya
    // return session;
    
    return null;
  } catch (error) {
    console.error('Error getting user session:', error);
    return null;
  }
}

/**
 * Validate session user memiliki business_unit_id
 */
export async function validateUserSession(): Promise<{ valid: boolean; session?: UserSession; error?: string }> {
  const session = await getUserSession();
  
  if (!session) {
    return {
      valid: false,
      error: 'No session found',
    };
  }
  
  if (!session.user?.business_unit_id) {
    return {
      valid: false,
      error: 'User does not have business_unit_id',
    };
  }
  
  return {
    valid: true,
    session,
  };
}
