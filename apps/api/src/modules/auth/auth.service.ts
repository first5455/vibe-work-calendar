import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { config } from "../../config/env";

export const AuthService = {
    async validateUser(email: string) {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user;
    },

    async createUser(data: { email: string; displayName: string; provider: string; avatarUrl?: string }) {
        const [user] = await db.insert(users).values(data).returning();
        return user;
    },

    getGoogleAuthUrl() {
        // Placeholder for Google OAuth URL generation
        return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.GOOGLE_CLIENT_ID}&redirect_uri=${config.API_URL}/auth/callback/google&response_type=code&scope=email%20profile`;
    },
    
    getGithubAuthUrl() {
         // Placeholder for Github OAuth URL generation
         return `https://github.com/login/oauth/authorize?client_id=${config.GITHUB_CLIENT_ID}&redirect_uri=${config.API_URL}/auth/callback/github&scope=user:email`;
    },
    
    async exchangeGoogleCode(code: string) {
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: config.GOOGLE_CLIENT_ID!,
                client_secret: config.GOOGLE_CLIENT_SECRET!,
                redirect_uri: `${config.API_URL}/auth/callback/google`,
                grant_type: "authorization_code",
            }),
        });
        const tokens: any = await tokenResponse.json();
        return tokens;
    },

    async getGoogleUser(accessToken: string) {
        const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return await userResponse.json() as any;
    },

    async exchangeGithubCode(code: string) {
        const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                client_id: config.GITHUB_CLIENT_ID,
                client_secret: config.GITHUB_CLIENT_SECRET,
                code,
                redirect_uri: `${config.API_URL}/auth/callback/github`
            }),
        });
        const tokens: any = await tokenResponse.json();
        return tokens;
    },

    async getGithubUser(accessToken: string) {
        const userResponse = await fetch("https://api.github.com/user", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const user: any = await userResponse.json();
        
        // Github doesn't always return email in public profile if it's private
        const emailResponse = await fetch("https://api.github.com/user/emails", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const emails: any = await emailResponse.json();
        const primaryEmail = Array.isArray(emails) ? emails.find((e: any) => e.primary && e.verified)?.email : null;
        
        return { ...user, email: primaryEmail || user.email };
    }
};
