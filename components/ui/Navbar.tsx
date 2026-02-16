'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Button from './Button';

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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/');
    };

    const navLinks = [
        { name: 'Assessments', href: '/assessments' },
        { name: 'Dashboard', href: '/dashboard' },
    ];

    return (
        <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 w-[95%] max-w-7xl ${scrolled ? 'top-2' : 'top-4'
            }`}>
            <div className={`glass py-3 px-6 rounded-2xl flex items-center justify-between shadow-glass border border-white/20 transition-all duration-500 ${scrolled ? 'px-8 shadow-premium py-2' : ''
                }`}>
                <div className="flex items-center space-x-8">
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform">
                            <span className="text-white font-black text-xl">H</span>
                        </div>
                        <span className="text-xl font-black tracking-tighter text-slate-900">
                            HIRE<span className="text-indigo-600 font-black">PERFECT</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${pathname === link.href
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    {user ? (
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-100 rounded-xl hidden md:flex">
                                <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center shadow-sm">
                                    <span className="text-white font-bold text-xs">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-slate-700">{user?.name}</span>
                            </div>
                            <Button variant="primary" size="sm" onClick={handleLogout} className="shadow-lg shadow-indigo-100">
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="font-bold text-indigo-600">Login</Button>
                            </Link>
                            <Link href="/signup">
                                <Button variant="primary" size="sm" className="shadow-lg shadow-indigo-100">
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
