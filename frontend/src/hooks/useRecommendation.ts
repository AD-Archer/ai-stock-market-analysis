import { useContext } from 'react';
import { RecommendationContext } from '../context/RecommendationContextBase';

export const useRecommendation = () => {
	const ctx = useContext(RecommendationContext);
	if (!ctx) throw new Error('useRecommendation must be used within a RecommendationProvider');
	return ctx;
};

export default useRecommendation;
