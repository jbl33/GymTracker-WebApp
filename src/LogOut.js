import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';

function LogOut() {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const cookies = new Cookies();

  const handleLogOut = () => {
    setShowModal(true);
  };

  const confirmLogOut = () => {
    cookies.remove('apiKey');
    navigate('/login');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <button
        onClick={handleLogOut}
        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg transform transition hover:scale-105 focus:outline-none"
      >
        Log Out
      </button>

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

export default LogOut;