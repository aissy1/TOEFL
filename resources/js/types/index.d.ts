import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    [key: string]: unknown;
}

export interface PageProps {
    auth?: {
        user?: {
            id: number;
            name: string;
            email: string;
        };
    };
    flash?: {
        success?: string;
        error?: string;
    };
    errors?: Record<string, string>;
}

export interface Props extends PageProps {
    users: User[];
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface ReadingSet {
    id: number;
    title: string;
    passage: string;
    questions: Question[];
}

export interface SturctureSet {
    id: number;
    title: string;
    passage: string | null;
    questions: Question[];
}
export interface ListeningSet {
    id: number;
    title: string;
    passage: string;
    audio_url: string;
    questions: Question[];
}

export interface SpeakingSet {
    id: number;
    title: string;
    type: string;
    preparationTime: number;
    responseTime: number;
    question: string;
    tips?: string[];
    passage: string | null;
    listening?: string;
}
export interface WritingSet {
    id: number;
    title: string;
    type: string;
    timeLimit: number;
    wordCount: string;
    context?: string;
    question: string;
    passage: string | null;
    listening?: string;
    previousPosts?: Array<{
        student: string;
        post: string;
    }>;
    instructions?: string[];
}

export interface UserFormData {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
    password?: string;
    password_confirmation?: string;
}

export interface ToeflFormData {
    id: number;
    name: string;
    code: string;
    status: 'active' | 'inactive';
    subtests: ToeflSubtest[];
}

export interface ToeflSubtest {
    subtest_id: number;
    total_questions: number;
    order: number;
    duration_minutes: number; // in minutes
    passing_score: number;
}

export interface SubtestMaster {
    id: number;
    name: string;
    slug: string;
}

export interface SubtestFormData {
    id?: number;
    name: string;
    order: number;
    slug: string;
    instructions?: string[];
}

export interface QuestionIndexProps {
    toefls: Toefl[];
}

export interface PassagesFormData {
    id?: number;
    subtest_id?: number;
    title?: string;
    text?: string;
    audio_url?: string;
}

export interface Question {
    id: number;
    question: string;
    choices?: string[];
    correctAnswer?: string;
}

export type QuestionFormData = {
    id?: number;
    passage_id: number | null;
    toefl_subtest_id: number;
    subtest_id: number;
    order: number;
    question_type: string;
    question: string;
    choices: { A: string; B: string; C: string; D: string };
    correct_answer: 'A' | 'B' | 'C' | 'D';
    min_words: number;
    point: number;
    keywords: string;
};

export interface Props {
    onComplete: () => void;
    section: string;
    questions: ReadingSet[] | ListeningSet[] | SturctureSet[] | SpeakingSet[] | WritingSet[];
    idSubtest: number;
}
