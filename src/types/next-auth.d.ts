import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      level: string;
      points: number;
      streak: number;
    };
  }

  interface User {
    id: string;
    role?: string;
    level?: string;
    points?: number;
    streak?: number;
  }
}
