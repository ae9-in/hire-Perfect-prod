'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { CameraManager } from '@/lib/cameraManager';

export default function CameraSentinel() {
    const pathname = usePathname();

    useEffect(() => {
        // Define assessment boundaries
        const isAssessmentArea = pathname.startsWith('/exam');

        if (!isAssessmentArea) {
            // If the user navigates to any page OUTSIDE the assessment area, 
            // force a hardware release of the camera strings and AI engines.
            CameraManager.stopAll();
        }
    }, [pathname]);

    return null; // This is a logic-only component
}
