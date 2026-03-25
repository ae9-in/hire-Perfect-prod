import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import CodingSubmission from '@/models/CodingSubmission';
import UserSkill from '@/models/UserSkill';
import Project from '@/models/Project';
import Attempt from '@/models/Attempt';
import User from '@/models/User';

/**
 * GET /api/profile/[userId]
 * Returns a unified profile for a candidate:
 *   - MCQ score (average of completed attempts)
 *   - Coding scores (average of reviewed submissions)
 *   - Project ratings (average)
 *   - Skill ratings
 *   - Overall score = (MCQ * 0.3) + (Coding * 0.4) + (Projects * 0.3)
 *   - Candidate status
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    const { userId } = await params;
    try {
        const authResult = await authMiddleware(request);
        if (!authResult.authorized) return authResult.response!;

        const isAdmin = authResult.user!.role === 'admin';
        const isSelf = authResult.user!.userId === userId;
        if (!isAdmin && !isSelf) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await connectDB();

        const userDoc = await User.findById(userId).select('name email role createdAt phone');
        if (!userDoc) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // ── MCQ: average percentage from completed attempts ──────────────────────
        const completedAttempts = await Attempt.find({
            user: userId,
            status: 'completed',
        }).select('percentage score totalQuestions correctAnswers assessment createdAt').populate('assessment', 'title');

        const mcqScore =
            completedAttempts.length > 0
                ? completedAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) /
                  completedAttempts.length
                : 0;

        // ── Coding: average score from approved/reviewed submissions ─────────────
        const scoredSubmissions = await CodingSubmission.find({
            userId,
            score: { $ne: null },
            status: { $in: ['approved', 'needs_improvement', 'rejected'] },
        })
            .select('score language status feedback createdAt')
            .populate('challengeId', 'title difficulty');

        const codingScore =
            scoredSubmissions.length > 0
                ? scoredSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) /
                  scoredSubmissions.length
                : 0;

        // ── Projects: average rating ─────────────────────────────────────────────
        const userProjects = await Project.find({ userId })
            .select('title techStack rating feedback status githubLink liveLink createdAt')
            .populate('reviewedBy', 'name');

        const ratedProjects = userProjects.filter((p) => p.rating !== null);
        const projectScore =
            ratedProjects.length > 0
                ? (ratedProjects.reduce((sum, p) => sum + (p.rating || 0), 0) /
                      ratedProjects.length) *
                  10  // convert 1-10 to 0-100
                : 0;

        // ── Skills ──────────────────────────────────────────────────────────────
        const userSkills = await UserSkill.find({ userId })
            .populate('skillId', 'name category')
            .sort({ rating: -1 });

        // ── Overall score formula ────────────────────────────────────────────────
        // Weights only apply when sections have data
        let overallScore = 0;
        let totalWeight = 0;

        if (completedAttempts.length > 0) {
            overallScore += mcqScore * 0.3;
            totalWeight += 0.3;
        }
        if (scoredSubmissions.length > 0) {
            overallScore += codingScore * 0.4;
            totalWeight += 0.4;
        }
        if (ratedProjects.length > 0) {
            overallScore += projectScore * 0.3;
            totalWeight += 0.3;
        }

        const normalizedOverall = totalWeight > 0 ? overallScore / totalWeight : 0;

        // ── Status ───────────────────────────────────────────────────────────────
        let candidateStatus = 'Not Attempted';
        if (scoredSubmissions.length > 0 || ratedProjects.length > 0) {
            candidateStatus = 'Evaluated';
        } else if (
            (await CodingSubmission.exists({ userId })) ||
            (await Project.exists({ userId }))
        ) {
            candidateStatus = 'Under Review';
        } else if (completedAttempts.length > 0) {
            candidateStatus = 'Submitted';
        } else if (await Attempt.exists({ user: userId, status: 'in_progress' })) {
            candidateStatus = 'In Progress';
        }

        return NextResponse.json({
            success: true,
            profile: {
                user: userDoc,
                mcq: {
                    score: Math.round(mcqScore * 10) / 10,
                    attemptCount: completedAttempts.length,
                    attempts: completedAttempts,
                },
                coding: {
                    score: Math.round(codingScore * 10) / 10,
                    submissionCount: scoredSubmissions.length,
                    submissions: scoredSubmissions,
                },
                projects: {
                    score: Math.round((projectScore * 10) / 10) / 10,
                    count: userProjects.length,
                    ratedCount: ratedProjects.length,
                    items: userProjects,
                },
                skills: userSkills,
                overallScore: Math.round(normalizedOverall * 10) / 10,
                candidateStatus,
            },
        });
    } catch (error: any) {
        console.error('Profile error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
