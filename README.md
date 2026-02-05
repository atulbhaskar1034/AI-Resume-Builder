# 🚀 ResuMatch - AI-Powered Career Architect

**ResuMatch** is an advanced AI-powered career development platform that analyzes your resume, identifies skill gaps, and generates personalized learning roadmaps. By comparing your profile against live market data and real-time job listings, ResuMatch helps you bridge the gap between your current skills and your dream role.

![ResuMatch Dashboard](https://via.placeholder.com/1200x600?text=ResuMatch+Dashboard+Preview)

## ✨ Key Features

- **📄 Smart Resume Analysis**: deeply parses your resume to extract skills, experience, and education using advanced NLP.
- **🔍 Skill Gap Detection**: Identifies missing critical skills by comparing your profile against live job market demands for your target role.
- **📊 Interactive Skill Radar**: Visualizes your proficiency vs. market requirements in a dynamic radar chart.
- **🛣️ Personalized Learning Roadmap**: Generates a 6-month step-by-step learning plan tailored to fill your specific skill gaps.
- **📺 curated Video Courses**: Automatically fetches and recommends top-rated YouTube courses for each missing skill using the YouTube Data API.
- **💼 Live Job Matching**: Scans the market (via RemoteOK API) to find real-time job openings that match your profile.
- **🤖 AI Career Coach Chatbot**: A 24/7 intelligent assistant (powered by Llama 3 on Groq) that can:
    - Answer career questions.
    - **📝 Generate Quizzes**: Test your knowledge on specific skills.
    - **💡 Suggest Projects**: Provide portfolio project ideas with tech stacks and steps.
    - Conduct mock interviews.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Visualizations**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **AI Orchestration**: [LangGraph](https://python.langchain.com/docs/langgraph) & [LangChain](https://www.langchain.com/)
- **LLM Provider**: [Groq](https://groq.com/) (Llama-3.3-70b/Llama3-8b for high-speed inference) & Google Gemini (Fallback)
- **External APIs**:
    - **RemoteOK API**: For live job listings.
    - **YouTube Data API v3**: For fetching educational content.

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/atulbhaskar1034/AI-Resume-Builder.git
cd AI-Resume-Builder
```

### 2. Backend Setup
Navigate to the backend directory and set up the Python environment.

```bash
cd backend
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Mac/Linux:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Configure Environment Variables
Create a `.env` file in the `backend` directory with the following keys:

```env
# AI Provider Keys
GROQ_API_KEY=your_groq_api_key_here
GOOGLE_API_KEY=your_google_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here (optional, for fallback)

# YouTube Data API (Required for course fetching)
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 3. Frontend Setup
Navigate to the frontend directory and install dependencies.

```bash
cd ../frontend
npm install
```

## 🏃‍♂️ Running the Application

You need to run both the backend and frontend servers.

### Start Backend
In the `backend` directory (with virtual environment activated):
```bash
python main.py
```
_The backend will start at `http://localhost:8000`_

### Start Frontend
In the `frontend` directory:
```bash
npm run dev
```
_The frontend will start at `http://localhost:3000`_

## 📖 Usage Guide

1.  **Upload Resume**: Drag and drop your PDF resume onto the analysis zone.
2.  **View Analysis**: Watch as the AI breaks down your profile, calculating a match score and identifying gaps.
3.  **Explore Roadmap**: Scroll through your 6-month personalized learning plan. Click on courses to watch them.
4.  **Check Jobs**: detailed live job listings that match your skills.
5.  **Chat with AI Coach**: Open the chat widget to:
    - Type `Give me a Python quiz` to take a quiz.
    - Type `Project idea for React` to get a portfolio project blueprint.

## 📂 Project Structure

```
AI-Resume-Builder/
├── backend/
│   ├── agent_tools/        # LangChain tools (Quiz Master, Project Architect)
│   ├── data/               # Local data cache
│   ├── .env                # API Keys
│   ├── main.py             # FastAPI entry point
│   ├── chat_agent.py       # LangGraph Chat Agent definition
│   ├── workflow.py         # Core Analysis Workflow
│   ├── fetch_market.py     # Job Market API fetcher
│   ├── youtube_courses.py  # YouTube API fetcher
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router
│   │   ├── components/     # React Components (ChatWidget, Dashboard, etc.)
│   │   ├── hooks/          # Custom React Hooks
│   │   └── services/       # API integration
│   ├── public/             # Static assets
│   └── package.json        # Node.js dependencies
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
