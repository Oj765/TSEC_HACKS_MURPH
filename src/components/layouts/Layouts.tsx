import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Navbar } from '../Navbar';

interface LayoutProps {
    role: 'student' | 'teacher' | 'admin' | 'guest';
    onLogout: () => void;
}

export const ProtectedLayout: React.FC<LayoutProps> = ({ role, onLogout }) => {
    if (role === 'guest') {
        return <Navigate to="/login" replace />;
    }
    return (
        <>
            <Navbar role={role} onLogout={onLogout} />
            <Outlet />
        </>
    );
};

export const TeacherLayout: React.FC<LayoutProps> = ({ role, onLogout }) => {
    if (role !== 'teacher' && role !== 'admin') {
        return <Navigate to="/" replace />;
    }
    return (
        <>
            <Navbar role={role} onLogout={onLogout} />
            <Outlet />
        </>
    );
};

export const PublicLayout: React.FC<LayoutProps> = ({ role, onLogout }) => {
    return (
        <>
            <Navbar role={role} onLogout={onLogout} />
            <Outlet />
        </>
    );
};
