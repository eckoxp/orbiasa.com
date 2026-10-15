'use client';

import React, { useState } from 'react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
    const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: 'Login failed' }));
        setError(res.status === 429 ? 'Too many attempts. Please try again in 15 minutes.' : (j.error || 'Login failed'));
        return;
      }
      window.location.href = '/admin';
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 bg-white/5 border border-white/10 p-6 rounded-xl">
        <h1 className="text-xl font-bold">Admin Login</h1>
        <input type="password" className="w-full bg-white/10 rounded px-3 py-2" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" />
                {error && <p className="text-sm text-red-400">{error}</p>}
        <button disabled={busy} className="w-full px-4 py-2 rounded bg-orbia-pink disabled:opacity-50">Login</button>
      </form>
    </div>
  );
}


