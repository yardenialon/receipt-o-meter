import { useRecommendations } from './recommendations/useRecommendations';
import { RecommendationCard } from './recommendations/RecommendationCard';

export const ProductRecommendations = () => {
  const { data: recommendations } = useRecommendations();

  if (!recommendations) return null;

  return <RecommendationCard recommendations={recommendations} />;
};