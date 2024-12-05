import React, { useState, useEffect } from 'react';
import Cookies from 'universal-cookie';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './App.css';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // State for error message
  const cookies = new Cookies();
  const navigate = useNavigate();


  useEffect(() => {
    const authKey = cookies.get('authKey');
    if (authKey) {
      navigate('/dashboard');
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const loginData = {
      email,
      password,
    };

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.user.auth_key) {
          const expiresIn = new Date(Date.now() + 60 * 60 * 4 * 1000); // 4 hours from current time
          cookies.set('authKey', data.user.auth_key, { expires: expiresIn });
          cookies.set('userID', data.user.id, { expires: expiresIn });

          navigate('/dashboard');
        } else {
          console.error('API key not found in response data');
        }
      } else {
        // Set error message for invalid login
        setErrorMessage('Invalid credentials. Please try again.');
        console.error('Login failed:', response.status, response.statusText);
      }
    } catch (error) {
      setErrorMessage('An error occurred during login. Please try again later.');
      console.error('Error during login:', error);
    }
  };

  return (
    <div>
      <Helmet>
        <title>Login - GymTracker</title>
      </Helmet>
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="text-red-500 text-center">{errorMessage}</div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                  Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign in
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            Not a member?
            <a href="/register" className="ml-1 font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
               Register now!
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;