import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 120000,  // 2 minutes for ML processing
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 429) {
      throw new Error('Too many requests. Please try again later.');
    }
    if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }
    return Promise.reject(error);
  }
);

export interface AnalysisRequest {
  job_description: string;
}

export interface SkillGap {
  skill: string;
  importance: number;
  gap_type: string;
}

export interface HeatmapItem {
  skill: string;
  status: 'match' | 'gap';
  score: number;
}

export interface LearningNode {
  month: number;
  skill: string;
  course_title: string;
  course_url: string;
  thumbnail: string;
  description: string;
  status: string;
}

export interface MatchedJob {
  id: string;
  position: string;
  company: string;
  location: string;
  url: string;
  date: string;
  match_score: number;
}

export interface AnalysisResult {
  status: string;
  role_detected: string;
  match_score: number;
  heatmap_data: HeatmapItem[];
  roadmap: LearningNode[];
  matched_jobs: MatchedJob[];

  // Optional legacy fields for backward compat or helper access
  detailed_analysis?: {
    overall_assessment: string;
    strengths: string[];
    areas_for_improvement: string[];
  };
}

export interface BatchAnalysisResult {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results?: AnalysisResult[];
  error?: string;
  created_at: string;
  completed_at?: string;
}

export const analyzeResume = async (
  resumeFile: File,
  jobDescription: string
): Promise<AnalysisResult> => {
  const formData = new FormData();
  formData.append('resume', resumeFile);
  formData.append('job_description', jobDescription);

  const response = await api.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const analyzeBatchResumes = async (
  resumeFiles: File[],
  jobDescription: string
): Promise<{ job_id: string }> => {
  const formData = new FormData();
  resumeFiles.forEach((file, index) => {
    formData.append(`resumes`, file);
  });
  formData.append('job_description', jobDescription);

  const response = await api.post('/analyze/batch', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const getBatchAnalysisStatus = async (
  jobId: string
): Promise<BatchAnalysisResult> => {
  const response = await api.get(`/analyze/batch/${jobId}`);
  return response.data;
};

export const healthCheck = async (): Promise<{ status: string; message: string }> => {
  const response = await api.get('/health');
  return response.data;
};

export const getSupportedFileTypes = async (): Promise<{ supported_types: string[] }> => {
  const response = await api.get('/supported-types');
  return response.data;
};

export default api;
