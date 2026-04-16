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

export type ReactionType = "fire" | "mind_blown" | "laugh" | "poop";

export interface Reaction {
  id: number;
  recommendation_id: number;
  user_name: string;
  reaction_type: ReactionType;
  created_at: string;
}

export interface Comment {
  id: number;
  recommendation_id: number;
  user_name: string;
  text: string;
  created_at: string;
}

export interface Watched {
  id: number;
  recommendation_id: number;
  user_name: string;
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

export async function decrementLikes(id: number): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE recommendations SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = ${id}
  `;
}

export async function deleteRecommendation(
  id: number,
  recommended_by: string,
): Promise<void> {
  const sql = getSql();
  await sql`
    DELETE FROM recommendations WHERE id = ${id} AND recommended_by = ${recommended_by}
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

  await sql`
    CREATE TABLE IF NOT EXISTS reactions (
      id SERIAL PRIMARY KEY,
      recommendation_id INTEGER NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
      user_name TEXT NOT NULL,
      reaction_type TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(recommendation_id, user_name)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      recommendation_id INTEGER NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
      user_name TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS watched (
      id SERIAL PRIMARY KEY,
      recommendation_id INTEGER NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
      user_name TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(recommendation_id, user_name)
    )
  `;
}

// === REACTIONS ===
export async function getReactions(
  recommendationId: number,
): Promise<Reaction[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, recommendation_id, user_name, reaction_type, created_at
    FROM reactions
    WHERE recommendation_id = ${recommendationId}
    ORDER BY created_at DESC
  `;
  return rows as Reaction[];
}

export async function getAllReactions(): Promise<Record<number, Reaction[]>> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, recommendation_id, user_name, reaction_type, created_at
    FROM reactions
    ORDER BY created_at DESC
  `;
  const reactions = rows as Reaction[];
  return reactions.reduce(
    (acc, r) => {
      if (!acc[r.recommendation_id]) acc[r.recommendation_id] = [];
      acc[r.recommendation_id].push(r);
      return acc;
    },
    {} as Record<number, Reaction[]>,
  );
}

export async function addReaction(
  recommendationId: number,
  userName: string,
  reactionType: ReactionType,
): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM reactions WHERE recommendation_id = ${recommendationId} AND user_name = ${userName}`;
  await sql`
    INSERT INTO reactions (recommendation_id, user_name, reaction_type)
    VALUES (${recommendationId}, ${userName}, ${reactionType})
  `;
}

export async function removeReaction(
  recommendationId: number,
  userName: string,
): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM reactions WHERE recommendation_id = ${recommendationId} AND user_name = ${userName}`;
}

// === COMMENTS ===
export async function getComments(
  recommendationId: number,
): Promise<Comment[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, recommendation_id, user_name, text, created_at
    FROM comments
    WHERE recommendation_id = ${recommendationId}
    ORDER BY created_at ASC
  `;
  return rows as Comment[];
}

export async function getAllComments(): Promise<Record<number, Comment[]>> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, recommendation_id, user_name, text, created_at
    FROM comments
    ORDER BY created_at ASC
  `;
  const comments = rows as Comment[];
  return comments.reduce(
    (acc, c) => {
      if (!acc[c.recommendation_id]) acc[c.recommendation_id] = [];
      acc[c.recommendation_id].push(c);
      return acc;
    },
    {} as Record<number, Comment[]>,
  );
}

export async function addComment(
  recommendationId: number,
  userName: string,
  text: string,
): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO comments (recommendation_id, user_name, text)
    VALUES (${recommendationId}, ${userName}, ${text})
  `;
}

// === WATCHED ===
export async function getWatched(recommendationId: number): Promise<Watched[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, recommendation_id, user_name, created_at
    FROM watched
    WHERE recommendation_id = ${recommendationId}
  `;
  return rows as Watched[];
}

export async function getAllWatched(): Promise<Record<number, Watched[]>> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, recommendation_id, user_name, created_at
    FROM watched
  `;
  const watched = rows as Watched[];
  return watched.reduce(
    (acc, w) => {
      if (!acc[w.recommendation_id]) acc[w.recommendation_id] = [];
      acc[w.recommendation_id].push(w);
      return acc;
    },
    {} as Record<number, Watched[]>,
  );
}

export async function toggleWatched(
  recommendationId: number,
  userName: string,
): Promise<boolean> {
  const sql = getSql();
  const existing = await sql`
    SELECT id FROM watched 
    WHERE recommendation_id = ${recommendationId} AND user_name = ${userName}
  `;

  if (existing.length > 0) {
    await sql`DELETE FROM watched WHERE recommendation_id = ${recommendationId} AND user_name = ${userName}`;
    return false;
  } else {
    await sql`INSERT INTO watched (recommendation_id, user_name) VALUES (${recommendationId}, ${userName})`;
    return true;
  }
}
