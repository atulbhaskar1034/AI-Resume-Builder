"""
YouTube Course Fetcher for ResuMatch
Fetches educational courses from YouTube Data API v3 based on skill gaps
"""

import os
from typing import List, Dict, Optional
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# YouTube API configuration
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")


def get_youtube_service():
    """Initialize YouTube API service."""
    try:
        from googleapiclient.discovery import build
        
        if not YOUTUBE_API_KEY:
            logger.warning("YOUTUBE_API_KEY not found in environment variables")
            return None
            
        return build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
    except ImportError:
        logger.error("google-api-python-client not installed. Run: pip install google-api-python-client")
        return None
    except Exception as e:
        logger.error(f"Failed to initialize YouTube service: {e}")
        return None


def search_youtube_courses(skill: str, max_results: int = 5) -> List[dict]:
    """
    Search YouTube for educational courses on a specific skill.
    
    Args:
        skill: The skill to search for (e.g., "Python programming", "Machine Learning")
        max_results: Maximum number of results to return (default: 5)
    
    Returns:
        List of course dictionaries with:
        - video_id: YouTube video ID
        - title: Video title
        - description: Video description
        - url: Full YouTube URL
        - thumbnail: Thumbnail URL
        - channel: Channel name
        - duration_hint: Whether it's likely a full course (based on title/description)
    """
    youtube = get_youtube_service()
    
    if not youtube:
        logger.warning(f"YouTube service unavailable, returning empty results for '{skill}'")
        return []
    
    try:
        # Search query optimized for educational content
        search_queries = [
            f"{skill} full course tutorial",
            f"learn {skill} for beginners complete",
            f"{skill} programming tutorial"
        ]
        
        all_results = []
        seen_ids = set()
        
        for query in search_queries:
            if len(all_results) >= max_results:
                break
                
            # First try: Long videos/playlists (high quality)
            request = youtube.search().list(
                part="snippet",
                q=query,
                type="video,playlist",
                maxResults=max_results,
                order="relevance",
                relevanceLanguage="en",
                safeSearch="strict"
            )
            
            response = request.execute()
            items = response.get('items', [])
            
            # If no results, retry without duration filter or specific type
            if not items:
                continue
            
            for item in items:
                id_data = item['id']
                if 'videoId' in id_data:
                    video_id = id_data['videoId']
                    url = f"https://www.youtube.com/watch?v={video_id}"
                elif 'playlistId' in id_data:
                    video_id = id_data['playlistId']
                    url = f"https://www.youtube.com/playlist?list={video_id}"
                else:
                    continue
                
                # Skip duplicates
                if video_id in seen_ids:
                    continue
                seen_ids.add(video_id)
                
                snippet = item['snippet']
                
                # Check if it looks like educational content
                title_lower = snippet['title'].lower()
                is_educational = True # Trust the query
                
                course = {
                    'video_id': video_id,
                    'title': snippet['title'],
                    'description': snippet.get('description', '')[:200],
                    'url': url,
                    'thumbnail': snippet['thumbnails'].get('high', snippet['thumbnails'].get('default', {})).get('url', ''),
                    'channel': snippet.get('channelTitle', 'Unknown'),
                    'is_educational': is_educational
                }
                
                all_results.append(course)
                
                if len(all_results) >= max_results:
                    break
        
        logger.info(f"Found {len(all_results)} YouTube courses for skill: {skill}")
        return all_results[:max_results]
        
    except Exception as e:
        logger.error(f"YouTube API search failed for '{skill}': {e}")
        return []


def fetch_courses_for_skill_gaps(skill_gaps: List[str], max_per_skill: int = 3) -> Dict[str, List[dict]]:
    """
    Fetch YouTube courses for multiple skill gaps.
    
    Args:
        skill_gaps: List of skills to find courses for
        max_per_skill: Maximum courses to fetch per skill (default: 3)
    
    Returns:
        Dictionary mapping skill names to lists of course dictionaries
    """
    courses_by_skill = {}
    
    for skill in skill_gaps:
        logger.info(f"Fetching YouTube courses for skill gap: {skill}")
        courses = search_youtube_courses(skill, max_results=max_per_skill)
        courses_by_skill[skill] = courses
    
    total_courses = sum(len(courses) for courses in courses_by_skill.values())
    logger.info(f"Fetched {total_courses} total courses for {len(skill_gaps)} skill gaps")
    
    return courses_by_skill


def format_courses_for_llm(courses_by_skill: Dict[str, List[dict]]) -> str:
    """
    Format fetched courses into a string for LLM context.
    
    Args:
        courses_by_skill: Dictionary from fetch_courses_for_skill_gaps
    
    Returns:
        Formatted string with all courses for LLM consumption
    """
    formatted_sections = []
    
    for skill, courses in courses_by_skill.items():
        section = f"### Available Courses for: {skill}\n"
        
        if not courses:
            section += "No courses found for this skill.\n"
        else:
            for i, course in enumerate(courses, 1):
                section += f"""
[YOUTUBE_COURSE_{i}]
Title: {course['title']}
URL: {course['url']}
Thumbnail: {course['thumbnail']}
Channel: {course['channel']}
Description: {course['description']}
"""
        formatted_sections.append(section)
    
    return "\n".join(formatted_sections)


# Fallback function when YouTube API is not available
def generate_search_url_fallback(skill: str) -> dict:
    """
    Generate a YouTube search URL as fallback when API is unavailable.
    
    Args:
        skill: The skill to search for
    
    Returns:
        Dictionary with search URL and placeholder data
    """
    search_query = f"{skill} tutorial course".replace(' ', '+')
    return {
        'video_id': None,
        'title': f"Search YouTube for {skill} courses",
        'description': f"Find the best {skill} courses on YouTube",
        'url': f"https://www.youtube.com/results?search_query={search_query}",
        'thumbnail': "https://i.ytimg.com/vi/default/hqdefault.jpg",
        'channel': "YouTube Search",
        'is_educational': True
    }


# Test function
if __name__ == "__main__":
    print("=" * 50)
    print("Testing YouTube Course Fetcher")
    print("=" * 50)
    
    # Test single skill search
    test_skill = "Python programming"
    print(f"\nSearching for: {test_skill}")
    courses = search_youtube_courses(test_skill, max_results=3)
    
    if courses:
        for i, course in enumerate(courses, 1):
            print(f"\n{i}. {course['title']}")
            print(f"   URL: {course['url']}")
            print(f"   Channel: {course['channel']}")
    else:
        print("No courses found or API unavailable")
        print("Fallback URL:", generate_search_url_fallback(test_skill)['url'])
