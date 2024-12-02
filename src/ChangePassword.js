import React, { useState } from 'react';
import Cookies from 'universal-cookie';

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cookies = new Cookies();
  const authKey = cookies.get('authKey');

  const validatePassword = (password) => {
    return /^(?=.*\d)(?=.*[A-Z])[A-Za-z\d!@#$%^&*()\-+\=]{8,}$/.test(password);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!validatePassword(newPassword)) {
      setError(
        'New password must be at least 8 characters long and contain a number and a capital letter.'
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/updatePassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authKey,
          oldPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result = await response.json();
      setMessage(result.message);
    } catch (error) {
      const errorMessage = error.message || 'Unknown error.';
      try {
        const errorResponse = JSON.parse(errorMessage);
        setError(
          'An error occurred: ' + (errorResponse.message || errorMessage)
        );
      } catch {
        setError('An error occurred: ' + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50">
      <div className="w-full max-w-sm bg-white p-8 border shadow-lg rounded-lg">
        <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
          Change Password
        </h2>
        {message && (
          <p className="mb-4 text-center text-green-500 font-medium">
            {message}
          </p>
        )}
        {error && (
          <p className="mb-4 text-center text-red-500 font-medium">{error}</p>
        )}
        <form onSubmit={handleChangePassword} className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;