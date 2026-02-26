export interface SeedQuestionInput {
    assessmentTitle: string;
    assessmentId: string;
    totalQuestions?: number;
}

export function generateAssessmentQuestions({
    assessmentTitle,
    assessmentId,
    totalQuestions = 15,
}: SeedQuestionInput) {
    const questions = [];

    for (let i = 1; i <= totalQuestions; i++) {
        questions.push({
            assessment: assessmentId,
            type: 'mcq',
            question: `${assessmentTitle} Proficiency - Q${i}: What is the primary characteristic of ${assessmentTitle} in a professional environment?`,
            options: [
                'Enhanced efficiency and scalability',
                'Legacy compatibility and maintenance',
                'Resource optimization and management',
                'Regulatory compliance and auditing',
            ],
            correctAnswer: 0,
            explanation: `The correct answer demonstrates fundamental knowledge required for ${assessmentTitle}.`,
            points: 1,
            difficulty: 'medium',
            tags: [assessmentTitle],
        });
    }

    return questions;
}
