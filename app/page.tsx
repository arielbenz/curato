import { getRecommendations, type Recommendation } from "@/lib/db";
import Feed from "@/components/Feed";

export const dynamic = "force-dynamic";

export default async function Home() {
  let recommendations: Recommendation[] = [];
  try {
    recommendations = await getRecommendations();
  } catch {
    // DB not yet configured — show empty feed
  }

  return <Feed recommendations={recommendations} />;
}
