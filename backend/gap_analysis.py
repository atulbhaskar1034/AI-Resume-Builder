import json
import os
import logging
from typing import List, Dict, Any
from similarity_engine import SimilarityEngine
from text_preprocessor import TextPreprocessor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GapAnalyzer:
    def __init__(self, market_data_path: str = "backend/data/market_trends.json"):
        self.market_data_path = market_data_path
        self.similarity_engine = SimilarityEngine()
        self.text_preprocessor = TextPreprocessor()
        self.market_skills = self._load_market_skills()

    def _load_market_skills(self) -> List[Dict[str, Any]]:
        """Load top market skills from the JSON file."""
        try:
            if not os.path.exists(self.market_data_path):
                logger.warning(f"Market data file not found: {self.market_data_path}")
                return []
            
            with open(self.market_data_path, 'r') as f:
                data = json.load(f)
                # usage of 'top_keywords' as the source for market skills
                return data.get('top_keywords', [])
        except Exception as e:
            logger.error(f"Failed to load market data: {str(e)}")
            return []

    def find_skill_gaps(self, resume_text: str, matched_role: str = "General", target_skills_override: List[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Identify missing skills by comparing resume against market trends.
        Uses semantic similarity to avoid false positives.
        """
        missing_skills = []
        
        # Step A: Extract skills/entities from resume using existing NLP pipeline
        # We process the text to get a structured representation
        processed_resume = self.text_preprocessor.preprocess_text(resume_text)
        
        # Helper to get all text components to check against
        # combining raw text, cleaned text, and extracted skills for robust matching
        resume_content_combined = resume_text.lower() + " " + " ".join(processed_resume.get('processed_tokens', []))

        # Market Skills (Default to Top 20 loaded from market trends)
        # Using the loaded top keywords. 
        # If custom targets provided (e.g. from JD or Role Standard), use them.
        target_skills = self.market_skills[:20] 
        if target_skills_override:
             target_skills = target_skills_override 

        # Step C: The Semantic Check
        for skill_item in target_skills:
            skill_name = skill_item['keyword'].lower()
            frequency = skill_item['count']
            
            # 1. Explicit Exact/Substring Match
            if skill_name in resume_content_combined:
                continue # User knows it

            # 2. Contextual Semantic Match using SimilarityEngine
            # We treat the skill as a "job requirement" and the resume as "resume text"
            # calculating similarity between the skill concept and the resume content.
            # Using _get_semantic_embeddings directly if possible or the high level calculation
            
            try:
                # We construct a minimal context for the skill to make it comparable to a document
                skill_context = f"experience with {skill_name} and related technologies"
                
                embeddings = self.similarity_engine._get_semantic_embeddings([resume_text, skill_context])
                
                # Manual cosine similarity calculation since we are accessing internal method
                # (Dot product of normalized vectors)
                vec_resume = embeddings[0]
                vec_skill = embeddings[1]
                
                # Cosine similarity
                norm_resume = sum(x*x for x in vec_resume) ** 0.5
                norm_skill = sum(x*x for x in vec_skill) ** 0.5
                
                if norm_resume * norm_skill == 0:
                    similarity = 0.0
                else:
                    dot_product = sum(a*b for a,b in zip(vec_resume, vec_skill))
                    similarity = dot_product / (norm_resume * norm_skill)
                
                # Threshold check (0.85 as requested)
                # Note: TF-IDF might yield lower scores than BERT, so 0.85 is very strict.
                # Adjusting logic: if using TF-IDF, 0.85 might be too high for single word vs document.
                # However, sticking to user instruction: "If similarity > 0.85"
                if similarity > 0.85:
                    continue # Contextual match found
                    
                # If we are here, it's a GAP
                missing_skills.append({
                    "skill": skill_name,
                    "importance": frequency,
                    "gap_type": "Critical" if frequency > 50 else "Recommended"
                })

            except Exception as e:
                logger.error(f"Semantic check failed for {skill_name}: {str(e)}")
                # Fallback: if check fails, assume it's missing to be safe
                missing_skills.append({
                    "skill": skill_name,
                    "importance": frequency,
                    "gap_type": "Unknown"
                })

        # Return sorted by importance
        return sorted(missing_skills, key=lambda x: x['importance'], reverse=True)

if __name__ == "__main__":
    # Simple test
    analyzer = GapAnalyzer()
    sample_resume = "I am a software engineer with experience in Python and Data Science."
    gaps = analyzer.find_skill_gaps(sample_resume)
    print("Found Gaps:", json.dumps(gaps, indent=2))
