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

export interface Question {
    id: number;
    question: string;
    choices?: string[];
    correctAnswer?: string;
}

export interface ReadingSet {
    id: number;
    title: string;
    passage: string;
    questions: Question[];
}
export interface ListeningSet {
    id: number;
    title: string;
    passage: string;
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
    reading?: string;
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
    reading?: string;
    listening?: string;
    previousPosts?: Array<{
        student: string;
        post: string;
    }>;
    instructions?: string[];
}

export interface Props {
    onComplete: () => void;
    section: string;
    questions: ReadingSet[] | ListeningSet[] | SpeakingSet[] | WritingSet[];
}
