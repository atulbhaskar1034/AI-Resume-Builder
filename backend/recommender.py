import json
import os
import logging
from typing import List, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CourseRecommender:
    def __init__(self, courses_data_path: str = "backend/data/nptel_courses.json"):
        self.courses_data_path = courses_data_path
        self.courses = self._load_courses()

    def _load_courses(self) -> List[Dict[str, Any]]:
        """Load NPTEL courses from the JSON file."""
        try:
            if not os.path.exists(self.courses_data_path):
                # Fallback to local path if running from backend dir
                local_path = self.courses_data_path.replace("backend/", "")
                if os.path.exists(local_path):
                     with open(local_path, 'r') as f:
                        return json.load(f)
                
                logger.warning(f"Courses data file not found: {self.courses_data_path}")
                return []
            
            with open(self.courses_data_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load courses data: {str(e)}")
            return []

    def generate_roadmap(self, missing_skills: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Generate a learning roadmap based on missing skills.
        
        Args:
            missing_skills: List of dicts with 'skill' and 'gap_type'.
            
        Returns:
            List of learning nodes/recommendations.
        """
        roadmap = []
        if not self.courses:
            logger.warning("No courses available for recommendation.")
            return roadmap

        # Limit to top 6 recommendations to create a full 6-month roadmap
        skills_to_address = missing_skills[:6]

        current_month = 1
        for skill_item in skills_to_address:
            skill_name = skill_item.get('skill', '').lower()
            if not skill_name:
                continue

            # Simple keyword matching: find a course with the skill in the title
            matched_course = None
            for course in self.courses:
                course_title = course.get('title', '').lower()
                if skill_name in course_title:
                    matched_course = course
                    break
            
            if matched_course:
                # Create a "Learning Node"
                roadmap.append({
                    "month": current_month,
                    "skill": skill_item.get('skill'), # Original case
                    "course_title": matched_course.get('title'),
                    "course_url": matched_course.get('url'),
                    "thumbnail": matched_course.get('thumbnail'),
                    "description": f"Learn {skill_item.get('skill')} to bridge your skill gap.",
                    "status": "Recommended"
                })
                current_month += 1
                
        # --- FALLBACK: Ensure we have at least 6 months of content ---
        # If we have fewer than 6 items, fill with "Trending/General" courses
        if len(roadmap) < 6:
            existing_urls = {item['course_url'] for item in roadmap}
            
            # Simple heuristic: pick courses that haven't been recommended yet
            # In a real app, we'd pick based on 'popularity' or adjacent skills
            for course in self.courses:
                if len(roadmap) >= 6:
                    break
                    
                if course.get('url') not in existing_urls:
                    roadmap.append({
                        "month": current_month,
                        "skill": "Advanced Upskilling", # Generic label
                        "course_title": course.get('title'),
                        "course_url": course.get('url'),
                        "thumbnail": course.get('thumbnail'),
                        "description": "Recommended active learning to broaden your technical expertise.",
                        "status": "Bonus"
                    })
                    existing_urls.add(course.get('url'))
                    current_month += 1
        
        return roadmap

if __name__ == "__main__":
    # Test run
    recommender = CourseRecommender()
    print(f"Loaded {len(recommender.courses)} courses.")
    
    test_skills = [
        {"skill": "Python", "importance": 90, "gap_type": "Critical"},
        {"skill": "Data Structures", "importance": 85, "gap_type": "Critical"},
        {"skill": "Machine Learning", "importance": 80, "gap_type": "Recommended"}
    ]
    
    output = recommender.generate_roadmap(test_skills)
    print("Generated Roadmap:", json.dumps(output, indent=2))
