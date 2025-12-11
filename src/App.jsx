import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Links } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Todos from './pages/Todos';
import { useState, useEffect } from 'react';

const Home = () => (
  <div className="relative w-full h-screen flex flex-col items-center justify-start overflow-hidden bg-gradient-to-br from-blue-100 via-white to-blue-200">
    {/* Animated SVG background */}
    <svg className="absolute top-0 left-1/2 -translate-x-1/2 blur-2xl opacity-60 animate-pulse z-0 w-full h-full pointer-events-none" width="100%" height="100%" viewBox="0 0 900 800" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="450" cy="300" rx="500" ry="180" fill="#3B82F6" fillOpacity="0.15" />
      <ellipse cx="300" cy="200" rx="220" ry="80" fill="#60A5FA" fillOpacity="0.12" />
      <ellipse cx="650" cy="500" rx="200" ry="70" fill="#2563EB" fillOpacity="0.10" />
    </svg>
    {/* Glassmorphism hero overlay */}
    <div className="relative z-10 w-full h-full flex flex-col md:flex-row items-center justify-start bg-white/60 backdrop-blur-lg pt-16 pb-4">
      {/* Left: Hero Text */}
      <div className="flex-1 p-10 md:p-20 flex flex-col items-start justify-center max-w-2xl">
        <div className="mb-6">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m9-9v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h7l5 5z" /></svg>
          </span>
        </div>
        <h1 className="text-5xl font-extrabold mb-4 text-blue-700 tracking-tight leading-tight drop-shadow-xl">TodoPro<br /><span className="text-2xl font-bold text-blue-400">Your DevOps & Project Task Manager</span></h1>
        <p className="mb-8 text-lg text-gray-700 max-w-md">Boost your productivity and organize your workflow with a beautiful, modern, and secure todo app. Track, manage, and complete your DevOps and project tasks with ease.</p>
        <div className="flex gap-4">
          <Link to="/signup" className="px-7 py-3 rounded-lg bg-blue-600 text-white font-bold shadow hover:bg-blue-700 transition text-lg">Get Started</Link>
          <Link to="/login" className="px-7 py-3 rounded-lg bg-white border border-blue-600 text-blue-700 font-bold shadow hover:bg-blue-50 transition text-lg">Log In</Link>
        </div>
      </div>
      {/* Right: Animated SVG Illustration */}
      <div className="hidden md:flex flex-1 h-full items-center justify-center p-10">
        <svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin-slow">
          <rect x="30" y="60" width="260" height="200" rx="32" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="4"/>
          <rect x="70" y="100" width="180" height="40" rx="10" fill="#DBEAFE" />
          <rect x="70" y="160" width="140" height="28" rx="8" fill="#BFDBFE" />
          <rect x="70" y="200" width="100" height="28" rx="8" fill="#93C5FD" />
          <rect x="70" y="240" width="120" height="28" rx="8" fill="#60A5FA" />
          <circle cx="240" cy="170" r="14" fill="#3B82F6" />
          <circle cx="240" cy="210" r="14" fill="#3B82F6" />
          <circle cx="240" cy="250" r="14" fill="#3B82F6" />
        </svg>
      </div>
      {/* Footer inside hero overlay */}
      <footer className="absolute bottom-4 left-0 right-0 text-center text-gray-400 text-sm w-full">&copy; {new Date().getFullYear()} TodoPro. All rights reserved.</footer>
    </div>
    <style>{`.animate-spin-slow { animation: spin 8s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur shadow-md px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Link to="/" className="text-2xl font-extrabold text-blue-700 tracking-tight select-none">📝 TodoPro</Link>
      </div>
      <div className="flex gap-4 items-center">
        <Link to="/" className="text-blue-700 font-semibold hover:underline">Home</Link>
        {token ? (
          <>
            <Link to="/todos" className="text-blue-700 font-semibold hover:underline">Todos</Link>
            <button onClick={handleLogout} className="text-red-600 font-semibold hover:underline">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-blue-700 font-semibold hover:underline">Login</Link>
            <Link to="/signup" className="text-blue-700 font-semibold hover:underline">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const App = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/todos" element={<Todos />} />
      </Routes>
    </Router>
  </div>
);

export default App;
