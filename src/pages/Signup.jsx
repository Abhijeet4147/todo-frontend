import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// const API_URL = import.meta.env.VITE_API_URL;
const API_URL = "/api";

const Signup = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      setSuccess('Signup successful! Redirecting to login...');
      setForm({ username: '', email: '', password: '' });
      setTimeout(() => navigate('/login'), 1000); // Redirect after short 1.test build 2.test
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-start justify-center pt-16 pb-24 bg-gradient-to-br from-blue-100 via-white to-blue-200 px-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 shadow mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 21v-2a4 4 0 00-8 0v2M12 11a4 4 0 100-8 4 4 0 000 8z" /></svg>
        </span>
        <h2 className="text-3xl font-extrabold mb-2 text-blue-700 tracking-tight">Sign Up</h2>
        <p className="mb-6 text-gray-600 text-center">Create your account to start managing your DevOps and project tasks.</p>
        <form onSubmit={handleSubmit} className="space-y-5 w-full">
          <input
            className="w-full p-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition"
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            className="w-full p-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition"
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            className="w-full p-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold shadow hover:bg-blue-700 transition text-lg"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
          {error && <div className="text-red-600 text-center">{error}</div>}
          {success && <div className="text-yellow-600 text-center">{success}</div>}
        </form>
        <div className="mt-6 text-gray-500 text-sm">Already have an account test1?... <Link to="/login" className="text-blue-600 font-semibold hover:underline">Log In</Link></div>
      </div>
    </div>
  );
};

export default Signup; 