import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';

function AccountInformation() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const cookies = new Cookies();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      const authKey = cookies.get('authKey');
      try {
        const response = await fetch(`http://localhost:3000/getUser?authKey=${authKey}`);
        if (!response.ok) {
          throw new Error(`Error fetching user data: ${response.statusText}`);
        }
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogOut = () => {
    setShowModal(true);
  };

  const confirmLogOut = () => {
    cookies.remove('authKey');
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen justify-center items-center bg-gray-50 p-8">
      <div className="w-full max-w-md bg-white border rounded-lg shadow-lg p-6 text-center">
        {isLoading && (
          <p className="text-lg font-medium text-gray-700">Loading user data...</p>
        )}
        {error && (
          <p className="text-lg font-medium text-red-600">Error: {error}</p>
        )}
        {!isLoading && userData && userData.user && (
          <div>
            <h1 className="mt-5 text-4xl font-extrabold text-gray-900 mb-8">
              Account Information
            </h1>
            <ul className="list-none space-y-4 text-left mb-8">
              <li>
                <span className="font-semibold text-gray-700">First Name: </span>
                <span className="text-gray-500">{userData.user.firstName}</span>
              </li>
              <li>
                <span className="font-semibold text-gray-700">Last Name: </span>
                <span className="text-gray-500">{userData.user.lastName}</span>
              </li>
              <li>
                <span className="font-semibold text-gray-700">Email: </span>
                <span className="text-gray-500">{userData.user.email}</span>
              </li>
            </ul>
            <button
              onClick={handleLogOut}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg transform transition hover:scale-105 focus:outline-none"
            >
              Log Out
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center transition-opacity">
          <div className="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Confirm Log Out
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to log out?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={confirmLogOut}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md transform transition hover:scale-105 focus:outline-none"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 shadow-md transform transition hover:scale-105 focus:outline-none"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountInformation;