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
    GAZE_DEVIATION: 'gaze_deviation',
    VOICE_DETECTED: 'voice_detected',
    PROHIBITED_OBJECT: 'prohibited_object',
} as const;

export const SUSPICION_WEIGHTS = {
    [VIOLATION_TYPES.TAB_SWITCH]: 100,
    [VIOLATION_TYPES.FULLSCREEN_EXIT]: 100,
    [VIOLATION_TYPES.MULTIPLE_FACES]: 50,
    [VIOLATION_TYPES.PROHIBITED_OBJECT]: 40,
    [VIOLATION_TYPES.SUDDEN_MOVEMENT]: 20,
    [VIOLATION_TYPES.VOICE_DETECTED]: 25,
    [VIOLATION_TYPES.LOOKING_AWAY]: 15,
    [VIOLATION_TYPES.GAZE_DEVIATION]: 10,
    [VIOLATION_TYPES.FACE_NOT_DETECTED]: 10,
    [VIOLATION_TYPES.SCREEN_MINIMIZE]: 20,
    [VIOLATION_TYPES.COPY_PASTE]: 5,
} as const;

export const PROCTORING_CONFIG = {
    HALT_THRESHOLD: 100,
    AUDIO_LEVEL_THRESHOLD: 0.1, // Normalized volume
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
        name: 'Commerce Students (B.Com / M.Com / Finance)',
        slug: 'commerce-students',
        description: 'Core commerce and finance subjects for accounting and business roles',
        assessments: [
            'Financial Accounting',
            'Cost & Management Accounting',
            'Business Economics',
            'Taxation (Direct & Indirect)',
            'Auditing',
            'MS Excel / Advanced Excel',
            'Financial Modelling',
            'Tally / GST',
            'Business Communication',
        ],
    },
    {
        name: 'Management Students (BBA / MBA)',
        slug: 'management-students',
        description: 'Business and management foundations for strategy, operations, and growth',
        assessments: [
            'Marketing Management',
            'Financial Management',
            'Human Resource Management',
            'Operations & Supply Chain',
            'Business Strategy',
            'Business Analytics',
            'Digital Marketing',
            'Entrepreneurship',
        ],
    },
    {
        name: 'Engineering Students (B.E / B.Tech)',
        slug: 'engineering-students',
        description: 'Technical and software engineering subjects for modern product development',
        assessments: [
            'Programming (C, C++, Java, Python)',
            'Data Structures & Algorithms (DSA)',
            'DBMS (Database Management Systems)',
            'Operating Systems',
            'Computer Networks',
            'Web Development / App Development',
            'Cloud Computing / AI / Data Science',
            'Software Testing',
        ],
    },
] as const;
