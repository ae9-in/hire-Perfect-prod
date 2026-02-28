export type ParsedQuestion = {
    subtopic?: string;
    level?: string;
    questionNumber?: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
    tags: string[];
};

type ParseState = {
    subtopic?: string;
    level?: string;
};

// Single-word or generic terms that appear as PDF line-wrap artifacts or section
// labels and must never be treated as subtopic headings.
const GENERIC_HEADING_BLOCKLIST = new Set([
    'questions', 'levels', 'level', 'mcqs', 'note', 'instructions',
    'answer', 'answers', 'explanation', 'topic', 'subtopic',
]);

function isMeaningfulHeading(value: string): boolean {
    if (!(/[a-z0-9]/i.test(value))) return false;
    const normalized = value.trim().toLowerCase();
    if (GENERIC_HEADING_BLOCKLIST.has(normalized)) return false;
    return true;
}

function cleanupLine(line: string): string {
    return line.replace(/\t/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseOption(line: string): string | null {
    const match = line.match(/^(?:[A-Da-d][\).\:\-]|Option\s*[A-Da-d][\).\:\-]?)\s*(.+)$/);
    return match ? match[1].trim() : null;
}

function parseQuestionLine(line: string): { number?: number; text: string } | null {
    const match = line.match(/^(?:Q(?:uestion)?\s*)?(\d+)[\).\:\-]?\s+(.+)$/i);
    if (!match) return null;
    return { number: Number(match[1]), text: match[2].trim() };
}

function expandInlineCombinedMcqLine(line: string): string[] | null {
    // Example (single line, space-separated options, single-letter answer):
    // "What is X?: A. ...B. ...C. ...D. ...Answer: B"
    const match = line.match(
        /^(?:(\d+)[\).\:\-]?\s*)?(.+?)\s*A[\).\:\-]\s*(.+?)(?=\s*B[\).\:\-])\s*B[\).\:\-]\s*(.+?)(?=\s*C[\).\:\-])\s*C[\).\:\-]\s*(.+?)(?=\s*D[\).\:\-])\s*D[\).\:\-]\s*(.+?)(?=\s*Answer\s*[:\-])\s*Answer\s*[:\-]\s*([A-Da-d])\s*$/i
    );

    if (!match) return null;

    const questionNumber = match[1]?.trim();
    const questionText = match[2].trim();
    const optionA = match[3].trim();
    const optionB = match[4].trim();
    const optionC = match[5].trim();
    const optionD = match[6].trim();
    const answer = match[7].toUpperCase();

    const questionLine = questionNumber
        ? `${questionNumber}. ${questionText}`
        : questionText;

    return [
        questionLine,
        `A. ${optionA}`,
        `B. ${optionB}`,
        `C. ${optionC}`,
        `D. ${optionD}`,
        `Answer: ${answer}`,
    ];
}

function expandConcatenatedMcqLine(line: string): string[] | null {
    // Handles the format produced by some DOCX exports where all 4 options are
    // jammed together on a single line with no spaces between option blocks:
    // "A) OptAB) OptBC) OptCD) OptDAnswer: B) Artificial Intelligence"
    // The question may appear on the previous line (not in this line at all).
    //
    // Strategy: the line must start with A) and contain B) C) D) and Answer:
    if (!/^A\)/i.test(line)) return null;
    if (!/Answer\s*:/i.test(line)) return null;

    // Split answer off first
    const answerSplit = line.match(/^(.+?)Answer\s*[:\-]\s*(.+)$/i);
    if (!answerSplit) return null;

    const optionsPart = answerSplit[1].trim();
    const answerRaw = answerSplit[2].trim(); // e.g. "B) Artificial Intelligence" or "B"

    // Extract answer letter
    const answerLetterMatch = answerRaw.match(/^([A-Da-d])[\)\.]?/);
    if (!answerLetterMatch) return null;
    const answer = answerLetterMatch[1].toUpperCase();

    // Split options on boundaries like "B)", "C)", "D)" (uppercase only, to avoid
    // false splits inside option text like "B2B)" — we look for word-boundary letter)
    const parts = optionsPart.split(/(?=[B-D]\))/i);
    if (parts.length !== 4) return null;

    const extractOption = (s: string): string =>
        s.replace(/^[A-Da-d]\)\s*/, '').trim();

    const optionA = extractOption(parts[0]);
    const optionB = extractOption(parts[1]);
    const optionC = extractOption(parts[2]);
    const optionD = extractOption(parts[3]);

    if (!optionA || !optionB || !optionC || !optionD) return null;

    return [
        `A. ${optionA}`,
        `B. ${optionB}`,
        `C. ${optionC}`,
        `D. ${optionD}`,
        `Answer: ${answer}`,
    ];
}

function parseSubtopicHeading(line: string): string | null {
    // Example: "• AI transformation frameworks"
    const bulletMatch = line.match(/^[\u2022\-\*]\s+(.+)$/);
    if (bulletMatch) {
        const heading = bulletMatch[1].trim();
        if (isMeaningfulHeading(heading)) return heading;
    }

    // Example: "Subtopic 1: Conversational Interface Design"
    const numberedSubtopicMatch = line.match(/^subtopic\s*\d*\s*[:\-]\s*(.+)$/i);
    if (numberedSubtopicMatch) {
        const heading = numberedSubtopicMatch[1].trim();
        if (isMeaningfulHeading(heading)) return heading;
    }

    // Example: "Topic 2: Zero-Trust Architecture (ZTA)"
    // NOTE: bare "Topic: Title" (no number) is intentionally excluded — it is
    // typically a document-level title, not an assessment subtopic.
    const topicMatch = line.match(/^topic\s*\d+\s*[:\-]\s*(.+)$/i);
    if (topicMatch) {
        const heading = topicMatch[1].trim();
        if (isMeaningfulHeading(heading)) return heading;
    }

    // Example: "1)Conversion funnel engineering"
    const numberedParenHeading = line.match(/^\d+\)\s*(.+)$/);
    if (numberedParenHeading) {
        const heading = numberedParenHeading[1].trim();
        if (isMeaningfulHeading(heading)) return heading;
    }

    // Example: "1. AI VIDEO GENERATION TOOLS" or "3.  AI IMAGE GENERATION ETHICS"
    // All-caps multi-word line with a numbered dot prefix — used as section headings
    // in some PDFs. Must be all-uppercase words (no lowercase letters in the label itself)
    // and have at least 2 words to avoid matching single-word noise.
    const numberedDotAllCapsHeading = line.match(/^\d+\.\s+([A-Z][A-Z\s\/\-\&]{3,})$/);
    if (numberedDotAllCapsHeading) {
        const heading = numberedDotAllCapsHeading[1].trim();
        // Convert from ALL CAPS to Title Case for cleaner matching against constants
        const titleCase = heading
            .toLowerCase()
            .replace(/\b\w/g, c => c.toUpperCase());
        if (isMeaningfulHeading(titleCase)) return titleCase;
    }

    return null;
}

function parseLevelHeading(line: string): string | null {
    // Examples:
    // "EASY LEVEL (1-50)"
    // "MEDIUM LEVEL (50 MCQs)"
    // "MASTER LEVEL (101-150)"
    // "Phase 1: Easy Level (1-50)"
    const normalized = line
        .replace(/[–—]/g, '-') // normalize dashes
        .replace(/^[^a-z0-9]+/i, '') // strip leading emoji/symbols
        .replace(/\s*(level)$/i, ' level') // ensure space before LEVEL (handles "EASYLEVEL")
        .toLowerCase()
        .trim();

    const match = normalized.match(/^(?:phase\s*\d+\s*:\s*)?(easy|medium|hard|master)\s+level(?:\s*\(.+\))?$/i);
    if (!match) return null;

    const raw = match[1].toLowerCase();
    if (raw === 'easy') return 'easy';
    if (raw === 'medium') return 'medium';
    if (raw === 'hard' || raw === 'master') return 'hard';
    return null;
}

function parseSubtopicAndLevelHeading(line: string): { subtopic: string; level: string } | null {
    // Examples:
    // "ENDPOINT DETECTION – EASY LEVEL"
    // "SOC OPERATIONS - EASY LEVEL (1-50)"
    // "Incident Response Planning – Master Level"
    const normalized = line.replace(/[–—]/g, '-').trim();
    const match = normalized.match(/^(.+?)\s*-\s*(easy|medium|hard|master)\s+level(?:\s*\(.+\))?$/i);
    if (!match) return null;

    const subtopic = match[1].trim();
    if (!isMeaningfulHeading(subtopic)) return null;
    const rawLevel = match[2].toLowerCase();
    const level = rawLevel === 'master' ? 'hard' : rawLevel;
    return { subtopic, level };
}

function parseCorrectAnswer(line: string): number | null {
    const match = line.match(/^(?:Correct\s*Answer|Answer|Ans)\s*[:\-]\s*(.+)$/i);
    if (!match) return null;

    const raw = match[1].trim();
    const letterMatch = raw.match(/^[A-Da-d]$/);
    if (letterMatch) {
        return letterMatch[0].toUpperCase().charCodeAt(0) - 65;
    }

    const numeric = Number(raw);
    if (Number.isInteger(numeric)) {
        if (numeric >= 0 && numeric <= 3) return numeric;
        if (numeric >= 1 && numeric <= 4) return numeric - 1;
    }

    return null;
}

export function parseQuestionsFromRawText(rawText: string): ParsedQuestion[] {
    const baseLines = rawText
        .split(/\r?\n/)
        .map(cleanupLine)
        .filter(Boolean);
    const lines: string[] = [];
    for (const line of baseLines) {
        const expanded = expandInlineCombinedMcqLine(line) ?? expandConcatenatedMcqLine(line);
        if (expanded) {
            lines.push(...expanded);
        } else {
            lines.push(line);
        }
    }

    const state: ParseState = {};
    const questions: ParsedQuestion[] = [];

    let current: Partial<ParsedQuestion> | null = null;
    let pendingExplanation: string[] = [];

    const finalizeCurrent = () => {
        if (!current) return;
        if (!current.question || !Array.isArray(current.options) || current.options.length !== 4) {
            current = null;
            pendingExplanation = [];
            return;
        }
        if (typeof current.correctAnswer !== 'number' || current.correctAnswer < 0 || current.correctAnswer > 3) {
            current = null;
            pendingExplanation = [];
            return;
        }

        const explanation = pendingExplanation.join(' ').trim();
        const tags = new Set<string>();
        if (state.subtopic) tags.add(state.subtopic.toLowerCase());
        if (state.level) tags.add(state.level.toLowerCase());

        questions.push({
            subtopic: state.subtopic,
            level: state.level,
            questionNumber: current.questionNumber,
            question: current.question,
            options: current.options,
            correctAnswer: current.correctAnswer,
            explanation: explanation || '',
            tags: [...tags],
        });

        current = null;
        pendingExplanation = [];
    };

    for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        const nextLine = lines[index + 1];

        const combinedHeading = parseSubtopicAndLevelHeading(line);
        if (combinedHeading) {
            finalizeCurrent();
            state.subtopic = combinedHeading.subtopic;
            state.level = combinedHeading.level;
            continue;
        }

        const subtopicHeading = parseSubtopicHeading(line);
        if (subtopicHeading) {
            finalizeCurrent();
            state.subtopic = subtopicHeading;
            continue;
        }

        if (/^subtopic\s*[:\-]/i.test(line)) {
            finalizeCurrent();
            state.subtopic = line.replace(/^subtopic\s*[:\-]\s*/i, '').trim();
            continue;
        }

        const levelHeading = parseLevelHeading(line);
        if (levelHeading) {
            finalizeCurrent();
            state.level = levelHeading;
            continue;
        }

        // Heuristic for files where a subtopic line is immediately followed by level heading.
        if (
            !current &&
            !state.level &&
            !!nextLine &&
            !!parseLevelHeading(nextLine) &&
            isMeaningfulHeading(line) &&
            !parseOption(line) &&
            !parseQuestionLine(line) &&
            !/^answer\s*[:\-]/i.test(line)
        ) {
            finalizeCurrent();
            state.subtopic = line;
            continue;
        }

        if (/^level\s*[:\-]/i.test(line)) {
            finalizeCurrent();
            state.level = line.replace(/^level\s*[:\-]\s*/i, '').trim();
            continue;
        }

        const parsedQuestion = parseQuestionLine(line);
        if (parsedQuestion) {
            finalizeCurrent();
            current = {
                questionNumber: parsedQuestion.number,
                question: parsedQuestion.text,
                options: [],
            };
            continue;
        }

        // Support unnumbered question lines if options follow.
        // If we already have a fully-parsed current question, finalize before starting the next one.
        if (
            current &&
            typeof current.correctAnswer === 'number' &&
            !parseOption(line) &&
            !/^answer\s*[:\-]/i.test(line) &&
            !!nextLine &&
            parseOption(nextLine) !== null
        ) {
            finalizeCurrent();
            current = {
                question: line.trim(),
                options: [],
            };
            continue;
        }

        if (
            !current &&
            !parseOption(line) &&
            !!nextLine &&
            parseOption(nextLine) !== null
        ) {
            current = {
                question: line.trim(),
                options: [],
            };
            continue;
        }

        if (!current) continue;

        const option = parseOption(line);
        if (option) {
            current.options = [...(current.options || []), option];
            continue;
        }

        const answer = parseCorrectAnswer(line);
        if (answer !== null) {
            current.correctAnswer = answer;
            continue;
        }

        if (/^explanation\s*[:\-]/i.test(line)) {
            pendingExplanation.push(line.replace(/^explanation\s*[:\-]\s*/i, '').trim());
            continue;
        }

        if (pendingExplanation.length > 0) {
            pendingExplanation.push(line);
        }
    }

    finalizeCurrent();
    return questions;
}
