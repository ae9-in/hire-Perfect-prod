'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Button from './Button';
import { CameraManager } from '@/lib/cameraManager';

const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        CameraManager.stop();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('loginAt');
        setUser(null);
        router.push('/');
    };

    // Always visible
    const publicLinks = [
        { name: 'Assessments', href: '/assessments' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'About Us', href: '/about' },
    ];

    // Only visible when logged in
    const authLinks = [
        { name: 'My Assessments', href: '/my-assessments' },
        { name: 'Challenges', href: '/coding' },
        { name: 'Projects', href: '/projects' },
        { name: 'Dashboard', href: '/dashboard' },
    ];

    // Admin-only quick links
    const adminLinks = [
        { name: 'Home', href: '/admin/dashboard' },
        { name: 'Candidates', href: '/admin/candidates' },
        { name: 'Challenges', href: '/admin/challenges' },
        { name: 'Submissions', href: '/admin/submissions' },
        { name: 'Projects', href: '/admin/projects' },
        { name: 'Skills', href: '/admin/skills' },
    ];

    return (
        <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 w-[95%] max-w-7xl ${scrolled ? 'top-2' : 'top-4'}`}>
            <div className={`glass py-3 px-6 rounded-2xl flex items-center justify-between shadow-glass border border-white/20 transition-all duration-500 ${scrolled ? 'px-8 shadow-premium py-2' : ''}`}>
                <div className="flex items-center space-x-8">
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform shadow-cyan-500/20">
                            <span className="text-white font-black text-xl">H</span>
                        </div>
                        <span className="text-xl font-black tracking-tighter text-white">
                            HIRE<span className="text-cyan-400 font-black">PERFECT</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-1">
                        {/* Public links */}
                        {publicLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${pathname === link.href
                                        ? 'bg-cyan-500/10 text-cyan-400'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-cyan-400'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* Candidate Workspace Dropdown */}
                        {user && user.role !== 'admin' && (
                            <div className="relative group">
                                <button className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${['/dashboard', '/coding', '/projects', '/my-assessments'].includes(pathname) ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-cyan-400'}`}>
                                    Workspace <span className="text-[8px] opacity-70">▼</span>
                                </button>
                                <div className="absolute top-full right-0 mt-3 w-48 p-2 bg-[#0a0a0f]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                    {authLinks.map(link => (
                                        <Link key={link.name} href={link.href} className={`block px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${pathname === link.href ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:bg-white/5 hover:text-cyan-400'}`}>
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Admin Dropdown */}
                        {user?.role === 'admin' && (
                            <div className="relative group">
                                <button className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${pathname.startsWith('/admin') ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-purple-400'}`}>
                                    Mission Control <span className="text-[8px] opacity-70">▼</span>
                                </button>
                                <div className="absolute top-full right-0 mt-3 w-48 p-2 bg-[#0a0a0f]/95 backdrop-blur-2xl border border-purple-500/20 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.15)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                    {adminLinks.map(link => (
                                        <Link key={link.name} href={link.href} className={`block px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${pathname === link.href ? 'bg-purple-500/10 text-purple-400' : 'text-slate-400 hover:bg-white/5 hover:text-purple-400'}`}>
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    {user ? (
                        <div className="flex items-center space-x-4">
                            <Link href={`/profile/${user?.id || user?._id || ''}`} className="flex items-center gap-3 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl hidden md:flex border border-white/5 transition-all group">
                                <div className="w-7 h-7 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                                    <span className="text-white font-bold text-xs">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{user?.name}</span>
                            </Link>
                            <Button variant="primary" size="sm" onClick={handleLogout} className="shadow-lg shadow-cyan-900/20">
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="font-bold text-cyan-400">Login</Button>
                            </Link>
                            <Link href="/signup">
                                <Button variant="primary" size="sm" className="shadow-lg shadow-cyan-900/20">
                                    Sign Up
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
