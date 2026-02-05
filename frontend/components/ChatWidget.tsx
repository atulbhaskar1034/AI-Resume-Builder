'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Loader2, Code, BookOpen, Trash2, Plus, History, ChevronLeft, Clock, Bot, Zap, Rocket, Brain, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Types
interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    hidden?: boolean;
}

interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}

interface AnalysisResult {
    role_detected?: string;
    match_score?: number;
    heatmap_data?: Array<{ skill: string; status: string }>;
    roadmap?: any[];
    matched_jobs?: any[];
}

interface ProjectIdea {
    title: string;
    difficulty: string;
    description: string;
    tech_stack: string[];
    steps: string[];
}

interface QuizQuestion {
    question: string;
    options: string[];
    answer: string;
}

const CONVERSATIONS_KEY = 'resumatch_conversations';
const CURRENT_CONV_KEY = 'resumatch_current_conversation';

// Extract JSON helper (Robust)
const extractJSON = (text: string): { type: 'project' | 'quiz' | null; data: any; cleanText: string } => {
    // 1. Try standard markdown code blocks
    let match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (!match) match = text.match(/```\s*([\s\S]*?)\s*```/);

    let jsonStr = match ? match[1] : null;
    let matchText = match ? match[0] : null;

    // 2. Fallback: Try to find raw JSON array for Quiz
    if (!jsonStr) {
        const arrayMatch = text.match(/(\[\s*\{[\s\S]*?"question"[\s\S]*?\}\s*\])/);
        if (arrayMatch) {
            jsonStr = arrayMatch[1];
            matchText = arrayMatch[0];
        }
    }

    // 3. Fallback: Try to find raw JSON object for Project
    if (!jsonStr) {
        const objMatch = text.match(/(\{\s*"title"[\s\S]*?"tech_stack"[\s\S]*?\})/);
        if (objMatch) {
            jsonStr = objMatch[1];
            matchText = objMatch[0];
        }
    }

    if (jsonStr && matchText) {
        try {
            const parsed = JSON.parse(jsonStr);
            // Remove the JSON string from the display text
            let cleanText = text.replace(matchText, '').trim();
            // Also cleanup any remaining tags like [QUIZ:...] or [PROJECT:...]
            cleanText = cleanText.replace(/\[(QUIZ|PROJECT):.*?\]/g, '');

            if (parsed.title && parsed.tech_stack && parsed.steps) return { type: 'project', data: parsed, cleanText };
            if (Array.isArray(parsed) && parsed[0]?.question) return { type: 'quiz', data: parsed, cleanText };
        } catch (e) {
            console.error("JSON Parse Error:", e);
        }
    }

    // Cleanup tags even if no JSON found
    const cleanText = text.replace(/\[(QUIZ|PROJECT):.*?\]/g, '').trim();
    return { type: null, data: null, cleanText };
};

// Project Card - Light Theme with Orange
const ProjectBlueprintCard: React.FC<{ project: ProjectIdea }> = ({ project }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="mt-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Code className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-white">{project.title}</h4>
            </div>
            <span className={`px-2 py-1 rounded-md text-xs font-bold ${project.difficulty === 'Beginner' ? 'bg-green-400 text-green-900' :
                project.difficulty === 'Intermediate' ? 'bg-yellow-400 text-yellow-900' : 'bg-red-400 text-red-900'
                }`}>{project.difficulty}</span>
        </div>
        <div className="p-4">
            <p className="text-gray-700 text-sm mb-4">{project.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
                {project.tech_stack.map((tech, i) => (
                    <span key={i} className="px-3 py-1 bg-white text-orange-700 rounded-full text-xs font-semibold border border-orange-200">{tech}</span>
                ))}
            </div>
            <div className="space-y-2">
                {project.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">{i + 1}</div>
                        <p className="text-gray-700 text-sm">{step}</p>
                    </div>
                ))}
            </div>
        </div>
    </motion.div>
);

// Quiz Card - Light Theme
const QuizCard: React.FC<{ questions: QuizQuestion[] }> = ({ questions }) => {
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [showResults, setShowResults] = useState(false);
    const score = Object.entries(answers).filter(([i, a]) => questions[parseInt(i)]?.answer === a).length;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-white">Knowledge Check</h4>
                </div>
                <span className="px-2 py-1 rounded-md text-xs font-bold bg-white/20 text-white">
                    {showResults ? `${score}/${questions.length}` : `${currentQ + 1}/${questions.length}`}
                </span>
            </div>
            <div className="p-4">
                {!showResults ? (
                    <>
                        <p className="text-gray-800 font-medium mb-4">{questions[currentQ].question}</p>
                        <div className="space-y-2 mb-4">
                            {questions[currentQ].options.map((opt, i) => (
                                <button key={i} onClick={() => setAnswers(p => ({ ...p, [currentQ]: opt }))}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all border-2 ${answers[currentQ] === opt
                                        ? 'bg-cyan-500 text-white border-cyan-500'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-cyan-300'
                                        }`}>{opt}</button>
                            ))}
                        </div>
                        <button onClick={() => currentQ < questions.length - 1 ? setCurrentQ(p => p + 1) : setShowResults(true)}
                            disabled={!answers[currentQ]}
                            className="w-full py-3 bg-black text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors">
                            {currentQ < questions.length - 1 ? 'Next Question →' : 'See Results'}
                        </button>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <div className="text-5xl mb-3">{score === questions.length ? '🏆' : score >= questions.length / 2 ? '🎯' : '📚'}</div>
                        <p className="text-xl font-bold text-gray-900 mb-1">{score === questions.length ? 'Perfect!' : score >= questions.length / 2 ? 'Great Job!' : 'Keep Learning!'}</p>
                        <p className="text-gray-500 mb-4">{score} of {questions.length} correct</p>
                        <button onClick={() => { setCurrentQ(0); setAnswers({}); setShowResults(false); }}
                            className="px-6 py-2 border-2 border-black text-black rounded-xl font-semibold hover:bg-black hover:text-white transition-colors">Retry</button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Message Bubble - Light Theme
const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    if (message.hidden) return null;
    const isUser = message.role === 'user';
    const { type, data, cleanText } = extractJSON(message.content);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            {!isUser && (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mr-3 flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
            )}
            <div className={`max-w-[80%] ${isUser
                ? 'bg-black text-white rounded-2xl rounded-br-md px-4 py-3'
                : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm'}`}>
                <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanText}</ReactMarkdown>
                </div>
                {type === 'project' && <ProjectBlueprintCard project={data} />}
                {type === 'quiz' && <QuizCard questions={data} />}
            </div>
        </motion.div>
    );
};

// Thinking Indicator
const ThinkingIndicator: React.FC = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-white animate-spin" />
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">Thinking</span>
                <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                        <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                            className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    ))}
                </div>
            </div>
        </div>
    </motion.div>
);

interface ChatWidgetProps {
    analysisResult?: AnalysisResult | null;
    initialSkill?: string | null;
    onInitialSkillHandled?: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ analysisResult, initialSkill, onInitialSkillHandled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showPopup, setShowPopup] = useState(true);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasGreeted, setHasGreeted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const currentConversation = conversations.find(c => c.id === currentConversationId);
    const messages = currentConversation?.messages || [];

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(CONVERSATIONS_KEY);
            const currentId = localStorage.getItem(CURRENT_CONV_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved).map((c: any) => ({
                        ...c, createdAt: new Date(c.createdAt), updatedAt: new Date(c.updatedAt),
                        messages: c.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
                    }));
                    setConversations(parsed);
                    if (currentId && parsed.find((c: Conversation) => c.id === currentId)) {
                        setCurrentConversationId(currentId);
                        if (parsed.find((c: Conversation) => c.id === currentId)?.messages.length > 0) setHasGreeted(true);
                    }
                } catch (e) { }
            }
        }
    }, []);

    useEffect(() => { if (conversations.length > 0) localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations)); }, [conversations]);
    useEffect(() => { if (currentConversationId) localStorage.setItem(CURRENT_CONV_KEY, currentConversationId); }, [currentConversationId]);


    const createNewConversation = useCallback(() => {
        const newConv: Conversation = { id: Date.now().toString(), title: 'New Chat', messages: [], createdAt: new Date(), updatedAt: new Date() };
        setConversations(prev => [newConv, ...prev]);
        setCurrentConversationId(newConv.id);
        setHasGreeted(false);
        setShowHistory(false);

    }, []);

    // Track previous result to detect changes
    const prevResultRef = useRef<{ score: number, role: string } | null>(null);

    useEffect(() => {
        if (!analysisResult) return;

        const currentScore = analysisResult.match_score || 0;
        const currentRole = analysisResult.role_detected || '';

        // If it's the first load, just set the ref
        if (!prevResultRef.current) {
            prevResultRef.current = { score: currentScore, role: currentRole };
            return;
        }

        // If score or role changed, start new chat
        if (prevResultRef.current.score !== currentScore || prevResultRef.current.role !== currentRole) {
            console.log("Analysis changed, resetting chat...");
            createNewConversation();
            prevResultRef.current = { score: currentScore, role: currentRole };
        }
    }, [analysisResult, createNewConversation]);

    useEffect(() => { if (conversations.length === 0 && typeof window !== 'undefined') createNewConversation(); }, [conversations.length, createNewConversation]);

    useEffect(() => {
        if (analysisResult && !hasGreeted && currentConversation?.messages.length === 0) {
            const gaps = analysisResult.heatmap_data?.filter(item => item.status === 'gap') || [];
            const topGap = gaps[0]?.skill || 'a key skill';
            const role = analysisResult.role_detected || 'your target role';
            sendProactiveGreeting(`Analysis complete. The user's role is "${role}". Top skill gap: "${topGap}". Greet them warmly, offer help. Be concise.`);
            setHasGreeted(true);
        }
    }, [analysisResult, hasGreeted, currentConversation]);

    // Handle clicking on a skill gap from the heatmap
    useEffect(() => {
        if (initialSkill && currentConversationId && !isLoading) {
            setIsOpen(true);
            setShowPopup(false);
            // Send a message asking about improving this skill
            setTimeout(() => {
                sendMessage(`I want to improve my ${initialSkill} skills. What resources, projects, or steps would you recommend to master this skill gap?`);
            }, 500);
            onInitialSkillHandled?.();
        }
    }, [initialSkill, currentConversationId]);

    const scrollToBottom = useCallback(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, []);
    useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);
    useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 100); }, [isOpen]);

    const updateConversationTitle = (convId: string, msg: string) => {
        setConversations(prev => prev.map(c => c.id === convId && c.title === 'New Chat' ? { ...c, title: msg.slice(0, 30) + (msg.length > 30 ? '...' : '') } : c));
    };

    const sendProactiveGreeting = async (prompt: string) => {
        if (!currentConversationId || isLoading) return;
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:8000/chat/agent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: prompt, session_id: currentConversationId, context: analysisResult || {} }) });
            if (!res.ok) throw new Error();
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let content = '';
            const msgId = Date.now().toString();
            setConversations(prev => prev.map(c => c.id === currentConversationId ? { ...c, messages: [...c.messages, { id: msgId, role: 'assistant', content: '', timestamp: new Date() }], updatedAt: new Date() } : c));
            while (reader) {
                const { done, value } = await reader.read();
                if (done) break;
                content += decoder.decode(value);
                setConversations(prev => prev.map(c => c.id === currentConversationId ? { ...c, messages: c.messages.map(m => m.id === msgId ? { ...m, content } : m) } : c));
            }
        } catch (e) { } finally { setIsLoading(false); }
    };

    const sendMessage = async (messageContent?: string) => {
        const content = messageContent || input.trim();
        if (!content || isLoading || !currentConversationId) return;
        const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date(), hidden: !!messageContent };
        if (!messageContent) {
            setConversations(prev => prev.map(c => c.id === currentConversationId ? { ...c, messages: [...c.messages, userMsg], updatedAt: new Date() } : c));
            updateConversationTitle(currentConversationId, content);
            setInput('');
        }
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:8000/chat/agent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: content, session_id: currentConversationId, context: analysisResult || {} }) });
            if (!res.ok) throw new Error();
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let assistantContent = '';
            const msgId = (Date.now() + 1).toString();
            setConversations(prev => prev.map(c => c.id === currentConversationId ? { ...c, messages: [...c.messages, { id: msgId, role: 'assistant', content: '', timestamp: new Date() }], updatedAt: new Date() } : c));
            while (reader) {
                const { done, value } = await reader.read();
                if (done) break;
                assistantContent += decoder.decode(value);
                setConversations(prev => prev.map(c => c.id === currentConversationId ? { ...c, messages: c.messages.map(m => m.id === msgId ? { ...m, content: assistantContent } : m) } : c));
            }
        } catch (e) {
            setConversations(prev => prev.map(c => c.id === currentConversationId ? { ...c, messages: [...c.messages, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, something went wrong. Please try again.', timestamp: new Date() }] } : c));
        } finally { setIsLoading(false); }
    };

    const deleteConversation = (convId: string) => {
        setConversations(prev => prev.filter(c => c.id !== convId));
        if (currentConversationId === convId) {
            const remaining = conversations.filter(c => c.id !== convId);
            if (remaining.length > 0) setCurrentConversationId(remaining[0].id);
            else createNewConversation();
        }
    };

    const formatDate = (date: Date) => {
        const diff = Date.now() - date.getTime();
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <>
            {/* Floating Button - Matches Website Orange Theme */}
            <AnimatePresence>
                {!isOpen && (
                    <div className="fixed bottom-6 right-6 z-50">
                        {/* Contextual Tooltip with Close Button */}
                        {analysisResult && showPopup && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ delay: 0.3 }}
                                className="absolute bottom-full right-0 mb-4 w-72">
                                <div className="bg-white rounded-2xl p-5 shadow-xl border border-gray-100 relative">
                                    {/* Close Button */}
                                    <button onClick={() => setShowPopup(false)}
                                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                                        <X className="w-3 h-3 text-gray-500" />
                                    </button>
                                    <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white rotate-45 border-r border-b border-gray-100" />
                                    <div className="flex items-start gap-3 pr-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                                            <Sparkles className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">AI Career Coach</h3>
                                            <p className="text-gray-500 text-sm mt-1">
                                                Let's work on <span className="font-semibold text-orange-600">{analysisResult.heatmap_data?.filter(i => i.status === 'gap')[0]?.skill || 'your skills'}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => { setIsOpen(true); setShowPopup(false); }}
                                        className="w-full mt-4 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                                        Start Learning <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Main Button */}
                        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => setIsOpen(true)}
                            className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center">
                            {/* Pulse Ring */}
                            <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 rounded-xl bg-orange-500" />
                            <MessageSquare className="w-6 h-6 relative z-10" />
                            {/* AI Badge */}
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow">AI</div>
                        </motion.button>
                    </div>
                )}
            </AnimatePresence>

            {/* Chat Window - Clean Light Theme */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed bottom-6 right-6 w-[600px] h-[700px] bg-white rounded-2xl shadow-2xl flex overflow-hidden z-50 border border-gray-200">

                        {/* History Sidebar */}
                        <AnimatePresence>
                            {showHistory && (
                                <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 220, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                                    className="bg-gray-50 border-r border-gray-200 flex flex-col">
                                    <div className="p-3">
                                        <button onClick={createNewConversation}
                                            className="w-full py-2.5 bg-black text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors text-sm">
                                            <Plus className="w-4 h-4" /> New Chat
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
                                        {conversations.map(conv => (
                                            <div key={conv.id}
                                                className={`group p-3 rounded-xl cursor-pointer transition-all ${conv.id === currentConversationId
                                                    ? 'bg-orange-50 border border-orange-200'
                                                    : 'hover:bg-gray-100 border border-transparent'}`}
                                                onClick={() => { setCurrentConversationId(conv.id); setShowHistory(false); }}>
                                                <div className="flex items-start justify-between">
                                                    <p className={`text-sm font-medium truncate flex-1 ${conv.id === currentConversationId ? 'text-orange-700' : 'text-gray-700'}`}>{conv.title}</p>
                                                    <button onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all ml-2">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(conv.updatedAt)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Main Chat Area */}
                        <div className="flex-1 flex flex-col">
                            {/* Header - Clean with Orange Accent */}
                            <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setShowHistory(!showHistory)}
                                        className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                                        {showHistory ? <ChevronLeft className="w-5 h-5 text-gray-600" /> : <History className="w-5 h-5 text-gray-600" />}
                                    </button>
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">AI Career Coach</h3>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="w-2 h-2 bg-green-500 rounded-full" />
                                            <span className="text-gray-500 text-xs">Online</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)}
                                    className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
                                {messages.filter(m => !m.hidden).length === 0 && !isLoading && (
                                    <div className="h-full flex flex-col items-center justify-center text-center">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-6">
                                            <Sparkles className="w-10 h-10 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Career Coach</h3>
                                        <p className="text-gray-500 mb-8 max-w-sm">I can help you fill skill gaps, suggest projects, and prep for interviews.</p>
                                        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                                            {[
                                                { icon: BookOpen, label: 'Find courses', desc: 'for skill gaps' },
                                                { icon: Rocket, label: 'Generate a', desc: 'project idea' },
                                                { icon: Brain, label: 'Quiz me on', desc: 'a topic' },
                                                { icon: Zap, label: 'Mock interview', desc: 'prep' },
                                            ].map((item, i) => (
                                                <motion.button key={i} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                                                    onClick={() => sendMessage(`${item.label} ${item.desc}`)}
                                                    className="p-4 bg-white rounded-xl border border-gray-200 text-left hover:border-orange-300 hover:shadow-md transition-all">
                                                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-3">
                                                        <item.icon className="w-5 h-5 text-orange-600" />
                                                    </div>
                                                    <p className="font-semibold text-gray-900">{item.label}</p>
                                                    <p className="text-gray-500 text-sm">{item.desc}</p>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
                                <AnimatePresence>{isLoading && (messages.length === 0 || messages[messages.length - 1]?.role === 'user') && <ThinkingIndicator />}</AnimatePresence>
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 border-t border-gray-100 bg-white">
                                {/* Quick Actions */}
                                {analysisResult && messages.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {(() => {
                                            const gap = analysisResult.heatmap_data?.filter(i => i.status === 'gap')[0]?.skill || 'skills';
                                            return [
                                                { l: `Explain ${gap}`, i: '📚' },
                                                { l: `Project for ${gap}`, i: '🚀' },
                                                { l: 'Mock Interview', i: '🎤' }
                                            ].map((chip, i) => (
                                                <button key={i} onClick={() => sendMessage(chip.l)} disabled={isLoading}
                                                    className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-sm font-medium rounded-full border border-orange-200 hover:border-orange-300 transition-all disabled:opacity-50">
                                                    {chip.i} {chip.l}
                                                </button>
                                            ));
                                        })()}
                                    </div>
                                )}
                                <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-3">
                                    <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)}
                                        placeholder="Ask me anything..." disabled={isLoading}
                                        className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-400 border border-transparent focus:outline-none focus:border-orange-300 focus:bg-white transition-all disabled:opacity-50" />
                                    <button type="submit" disabled={!input.trim() || isLoading}
                                        className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors">
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatWidget;
