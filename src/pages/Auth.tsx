import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import notify from '../utils/notify';
import { useAuth } from '../contexts/AuthContext';

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    setError(null);
  }, [email, password]);

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      notify.error(error.message);
    } else {
      notify.success('Check your email to confirm your account');
    }
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      notify.error(error.message);
    } else {
      notify.success('Signed in');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Log in or Sign up</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {user && (
        <div className="mb-4 text-green-700">Currently signed in as {user.email}</div>
      )}
      <input
        className="border p-2 mb-2 w-full max-w-sm"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        className="border p-2 mb-4 w-full max-w-sm"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button
        className="bg-blue-500 text-white py-2 px-4 mb-2 rounded w-full max-w-sm"
        onClick={handleSignIn}
      >
        Sign In
      </button>
      <button
        className="bg-green-500 text-white py-2 px-4 rounded w-full max-w-sm"
        onClick={handleSignUp}
      >
        Sign Up
      </button>
      {user && (
        <button
          className="mt-4 bg-gray-700 text-white py-2 px-4 rounded w-full max-w-sm"
          onClick={async () => { await signOut(); notify.success('Signed out'); }}
        >
          Sign Out
        </button>
      )}
    </div>
  );
}

export default Auth;