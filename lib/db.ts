import { neon } from "@neondatabase/serverless";

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  return neon(process.env.DATABASE_URL);
}

export interface Recommendation {
  id: number;
  title: string;
  url: string;
  description: string | null;
  category: string;
  recommended_by: string;
  thumbnail_url: string | null;
  likes_count: number;
  created_at: string;
}

export async function getRecommendations(): Promise<Recommendation[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, title, url, description, category, recommended_by, thumbnail_url, likes_count, created_at
    FROM recommendations
    ORDER BY created_at DESC
  `;
  return rows as Recommendation[];
}

export async function addRecommendation(data: {
  title: string;
  url: string;
  description: string | null;
  category: string;
  recommended_by: string;
  thumbnail_url: string | null;
}): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO recommendations (title, url, description, category, recommended_by, thumbnail_url)
    VALUES (${data.title}, ${data.url}, ${data.description}, ${data.category}, ${data.recommended_by}, ${data.thumbnail_url})
  `;
}

export async function incrementLikes(id: number): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE recommendations SET likes_count = likes_count + 1 WHERE id = ${id}
  `;
}

export async function createTable(): Promise<void> {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS recommendations (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      recommended_by TEXT NOT NULL,
      thumbnail_url TEXT,
      likes_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}
