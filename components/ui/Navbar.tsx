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
        { name: 'Dashboard', href: '/dashboard' },
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

                        {/* Auth-only links: My Assessments + Dashboard */}
                        {user && authLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${link.name === 'My Assessments'
                                        ? pathname === link.href
                                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                            : 'text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/20'
                                        : pathname === link.href
                                            ? 'bg-cyan-500/10 text-cyan-400'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-cyan-400'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* Admin link */}
                        {user?.role === 'admin' && (
                            <Link
                                href="/admin/dashboard"
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${pathname.startsWith('/admin')
                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-purple-400'
                                    }`}
                            >
                                Admin Command
                            </Link>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    {user ? (
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center gap-3 px-3 py-1.5 bg-white/5 rounded-xl hidden md:flex border border-white/5">
                                <div className="w-7 h-7 bg-cyan-600 rounded-full flex items-center justify-center shadow-sm">
                                    <span className="text-white font-bold text-xs">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-slate-300">{user?.name}</span>
                            </div>
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
