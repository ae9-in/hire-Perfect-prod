// Application Constants

export const PRICING = {
    INDIVIDUAL_ASSESSMENT: 500,
    CATEGORY_COMBO: 1000,
    FULL_BUNDLE: 4000,
} as const;

export const EXAM_CONFIG = {
    DURATION_MINUTES: 30,
    MAX_VIOLATIONS: 5,
    AUTO_SAVE_INTERVAL: 10000, // 10 seconds
} as const;

export const VIOLATION_TYPES = {
    FACE_NOT_DETECTED: 'face_not_detected',
    MULTIPLE_FACES: 'multiple_faces',
    LOOKING_AWAY: 'looking_away',
    TAB_SWITCH: 'tab_switch',
    SCREEN_MINIMIZE: 'screen_minimize',
    FULLSCREEN_EXIT: 'fullscreen_exit',
    SESSION_EXIT: 'session_exit',
    COPY_PASTE: 'copy_paste',
    CONTENT_CUT: 'content_cut',
    SUDDEN_MOVEMENT: 'sudden_movement',
} as const;

export const VIOLATION_SEVERITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
} as const;

export const USER_ROLES = {
    ADMIN: 'admin',
    CANDIDATE: 'candidate',
} as const;

export const QUESTION_TYPES = {
    MCQ: 'mcq',
    SCENARIO: 'scenario',
    CODING: 'coding',
} as const;

export const PURCHASE_TYPES = {
    INDIVIDUAL: 'individual',
    CATEGORY: 'category',
    BUNDLE: 'bundle',
} as const;

export const PAYMENT_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
} as const;

export const ATTEMPT_STATUS = {
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    TERMINATED: 'terminated',
} as const;

// Categories with their assessments
export const CATEGORIES = [
    {
        name: 'Soft Skills',
        slug: 'soft-skills',
        description: 'Essential soft skills for professional success',
        assessments: [
            'Quantitative Aptitude',
            'Logical Reasoning',
            'Verbal Ability',
            'Critical Thinking',
            'Problem Solving',
            'Communication Skills',
        ],
    },
    {
        name: 'Programming Fundamentals',
        slug: 'programming-fundamentals',
        description: 'Core programming concepts and fundamentals',
        assessments: [
            'C Programming',
            'C++',
            'Data Structures',
            'Algorithms',
            'Object-Oriented Programming',
            'Debugging Skills',
        ],
    },
    {
        name: 'IT Specializations',
        slug: 'it-specializations',
        description: 'Modern IT technologies and frameworks',
        assessments: [
            'Java',
            'Python',
            'JavaScript',
            'Web Development',
            'Database Management',
            'API Development',
        ],
    },
    {
        name: 'MBA Core',
        slug: 'mba-core',
        description: 'Core business and management concepts',
        assessments: [
            'Finance',
            'Marketing',
            'Operations',
            'Human Resource',
            'Business Strategy',
            'Entrepreneurship',
        ],
    },
    {
        name: 'Data & Analytics',
        slug: 'data-analytics',
        description: 'Data analysis and business intelligence',
        assessments: [
            'Data Analysis',
            'Business Analytics',
            'Excel & BI',
            'SQL',
            'Statistics',
            'Machine Learning Basics',
        ],
    },
    {
        name: 'Corporate Readiness',
        slug: 'corporate-readiness',
        description: 'Professional skills for corporate success',
        assessments: [
            'Interview Readiness',
            'Resume Analysis',
            'Workplace Ethics',
            'Leadership Skills',
            'Project Management',
            'Time Management',
        ],
    },
] as const;
