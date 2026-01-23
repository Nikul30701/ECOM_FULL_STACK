import React, { useState } from 'react';
import { authAPI } from '../services/authAPI';
import { ShoppingCart } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [credentials, setCredentials] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isRegister) {
                // register new user
                await authAPI.register({
                    username: credentials.username,
                    email: credentials.email,
                    password: credentials.password,
                    password2: credentials.password2,
                    first_name: credentials.first_name,
                    last_name: credentials.last_name,
                });
            }

            // login and get tokens
            await authAPI.login({
                username: credentials.username,
                password: credentials.password,
            });

            // fetch profile
            const profile = await authAPI.getProfile();

            onLogin({
                id: profile.user.id,
                name: profile.user.username,
                email: profile.user.email,
                role: profile.user.is_staff ? 'admin' : 'user',
            });
        } catch (err) {
            const data = err.response?.data;
            if (data?.detail) {
                setError(data.detail);
            } else if (typeof data === 'object') {
                // show first error message from DRF
                const firstKey = Object.keys(data)[0];
                setError(Array.isArray(data[firstKey]) ? data[firstKey][0] : String(data[firstKey]));
            } else {
                setError('Authentication failed');
            }
            console.error('Auth Error: ', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
                <div className="text-center mb-8">
                    <ShoppingCart size={48} className="mx-auto text-indigo-600 mb-4" />
                    <h1 className="text-3xl font-bold text-gray-800">ShopCom</h1>
                    <p className="text-gray-600">
                        {isRegister ? 'Create your account' : 'Your one-stop shop'}
                    </p>
                    {error && (
                        <p className="text-red-600 text-sm mb-4 text-center">
                            {error}
                        </p>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            value={credentials.username}
                            placeholder="Enter username"
                            required
                            autoComplete="off"
                            onChange={(e) =>
                                setCredentials({ ...credentials, username: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {isRegister && (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={credentials.email}
                                    placeholder="you@example.com"
                                    required
                                    onChange={(e) =>
                                        setCredentials({ ...credentials, email: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        First name
                                    </label>
                                    <input
                                        type="text"
                                        value={credentials.first_name}
                                        placeholder="First name"
                                        onChange={(e) =>
                                            setCredentials({
                                                ...credentials,
                                                first_name: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Last name
                                    </label>
                                    <input
                                        type="text"
                                        value={credentials.last_name}
                                        placeholder="Last name"
                                        onChange={(e) =>
                                            setCredentials({
                                                ...credentials,
                                                last_name: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={credentials.password}
                            placeholder="*******"
                            required
                            autoComplete="off"
                            onChange={(e) =>
                                setCredentials({ ...credentials, password: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {isRegister && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Confirm password
                            </label>
                            <input
                                type="password"
                                value={credentials.password2}
                                placeholder="Confirm password"
                                required
                                onChange={(e) =>
                                    setCredentials({ ...credentials, password2: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-60"
                    >
                        {loading
                            ? isRegister
                                ? 'Creating account...'
                                : 'Signing in...'
                            : isRegister
                                ? 'Sign Up'
                                : 'Login'}
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsRegister(!isRegister)}
                        className="w-full text-indigo-600 hover:text-indigo-800 text-sm font-semibold mt-2"
                    >
                        {isRegister
                            ? 'Already registered? Log in'
                            : "Don’t have an account? Sign up"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
