import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { adminMiddleware } from '@/middleware/auth';
import Skill from '@/models/Skill';

const DEFAULT_SKILLS = [
    { name: 'React', category: 'frontend' },
    { name: 'Next.js', category: 'frontend' },
    { name: 'Vue.js', category: 'frontend' },
    { name: 'TypeScript', category: 'frontend' },
    { name: 'JavaScript', category: 'frontend' },
    { name: 'HTML/CSS', category: 'frontend' },
    { name: 'Tailwind CSS', category: 'frontend' },
    { name: 'Node.js', category: 'backend' },
    { name: 'Express.js', category: 'backend' },
    { name: 'Python', category: 'backend' },
    { name: 'Django', category: 'backend' },
    { name: 'FastAPI', category: 'backend' },
    { name: 'Java', category: 'backend' },
    { name: 'Go', category: 'backend' },
    { name: 'REST API Design', category: 'backend' },
    { name: 'GraphQL', category: 'backend' },
    { name: 'MongoDB', category: 'database' },
    { name: 'PostgreSQL', category: 'database' },
    { name: 'MySQL', category: 'database' },
    { name: 'Redis', category: 'database' },
    { name: 'SQL', category: 'database' },
    { name: 'Docker', category: 'devops' },
    { name: 'Kubernetes', category: 'devops' },
    { name: 'AWS', category: 'devops' },
    { name: 'CI/CD', category: 'devops' },
    { name: 'Data Structures & Algorithms', category: 'dsa' },
    { name: 'Dynamic Programming', category: 'dsa' },
    { name: 'System Design', category: 'dsa' },
    { name: 'Debugging', category: 'other' },
    { name: 'Git', category: 'other' },
    { name: 'Problem Solving', category: 'other' },
    { name: 'Code Review', category: 'other' },
];

// POST /api/skills/seed — admin seeds default skills
export async function POST(request: NextRequest) {
    try {
        const authResult = await adminMiddleware(request);
        if (!authResult.authorized) return authResult.response!;

        await connectDB();

        const results = await Promise.allSettled(
            DEFAULT_SKILLS.map((skill) =>
                Skill.findOneAndUpdate(
                    { name: skill.name },
                    { ...skill, isActive: true },
                    { upsert: true, new: true }
                )
            )
        );

        const inserted = results.filter((r) => r.status === 'fulfilled').length;

        return NextResponse.json({
            success: true,
            message: `${inserted} skills seeded successfully`,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
