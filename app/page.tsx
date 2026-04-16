import { getRecommendations, getAllReactions, getAllComments, getAllWatched, type Recommendation, type Reaction, type Comment, type Watched } from "@/lib/db";
import Feed from "@/components/Feed";

export const dynamic = "force-dynamic";

export default async function Home() {
  let recommendations: Recommendation[] = [];
  let reactionsMap: Record<number, Reaction[]> = {};
  let commentsMap: Record<number, Comment[]> = {};
  let watchedMap: Record<number, Watched[]> = {};
  
  try {
    [recommendations, reactionsMap, commentsMap, watchedMap] = await Promise.all([
      getRecommendations(),
      getAllReactions(),
      getAllComments(),
      getAllWatched(),
    ]);
  } catch {
    // DB not yet configured — show empty feed
  }

  return (
    <Feed 
      recommendations={recommendations}
      reactionsMap={reactionsMap}
      commentsMap={commentsMap}
      watchedMap={watchedMap}
    />
  );
}
