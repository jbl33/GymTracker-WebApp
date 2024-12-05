import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import { Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import Pagination from 'react-js-pagination';

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const WeightTracker = () => {
  const [weightEntries, setWeightEntries] = useState([]);
  const [currentWeight, setCurrentWeight] = useState('');
  const [totalWeightChange, setTotalWeightChange] = useState(0);
  const cookies = new Cookies();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState(null); // New state for error messages
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const authKey = cookies.get('authKey');

    if (!authKey) {
      navigate('/login');
      return;
    }

    fetchWeightEntries(authKey);
  }, [navigate, currentPage]);

  const fetchWeightEntries = async (authKey) => {
    try {
      const response = await axios.get('http://localhost:3000/getWeightEntries', {
        params: { authKey },
      });
      const entries = response.data.weightEntries;

      setWeightEntries(entries);
      calculateWeightChange(entries);
    } catch (error) {
      console.error('Error fetching weight entries:', error);
    }
  };

  const handleAddWeight = () => {
    if (!currentWeight) {
      setError('Weight is required to add an entry.');
      return;
    }
    setModalOpen(true);
  };

  const confirmAddWeightEntry = async () => {
    const authKey = cookies.get('authKey');
    try {
      await axios.post('http://localhost:3000/addWeightEntry', {
        authKey,
        date: new Date().toISOString(),
        weight: currentWeight,
      });
      setCurrentWeight('');
      fetchWeightEntries(authKey);
      setModalOpen(false);
      setError(null); // Clear error on successful addition
    } catch (error) {
      console.error('Error adding weight entry:', error);
    }
  };

  const calculateWeightChange = (entries) => {
    if (entries.length < 2) {
      setTotalWeightChange(0);
    } else {
      const change = entries[entries.length - 1].weight - entries[0].weight;
      setTotalWeightChange(change);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const chartData = {
    labels: weightEntries.map((entry) => new Date(entry.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Weight History',
        backgroundColor: 'rgba(30, 58, 138, 0.5)',
        borderColor: 'rgba(30, 58, 138, 1)',
        borderWidth: 1,
        data: weightEntries.map((entry) => entry.weight),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <div className="container mx-auto p-8">
        <h1 className="text-center mb-8 text-4xl font-extrabold text-gray-800">
          Weight Tracker
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-around mb-12">
          <div className="mb-8 w-full md:w-1/3 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-4 text-blue-900">Add New Weight Entry</h2>
            <input
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              className="w-full border p-3 mb-4 rounded"
              placeholder="Weight (lbs)"
              type="number"
            />
            <button
              onClick={handleAddWeight}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full p-3 rounded"
            >
              Add Weight Entry
            </button>
          </div>

          <div className="w-full md:w-2/3 bg-white p-6 rounded-lg shadow-md">
            <Bar data={chartData} options={{ maintainAspectRatio: false }} height={200} />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg shadow p-6 text-center mb-10">
          <h3
            className={`text-2xl ${totalWeightChange >= 0 ? 'text-gray-600' : 'text-red-600'}`}
          >
            Total Weight Change: {totalWeightChange.toFixed(2)} lbs
          </h3>
        </div>

        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-lg font-bold mb-4 text-blue-900">Weight Entries</h2>
          {weightEntries
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((entry, index) => (
              <div
                key={index}
                className="mb-2 border p-3 rounded-lg flex justify-between"
              >
                <span>{new Date(entry.date).toLocaleDateString()}</span>
                <span className="font-bold">{entry.weight} lbs</span>
              </div>
            ))}

          <div className="mt-6">
            <Pagination
              activePage={currentPage}
              itemsCountPerPage={itemsPerPage}
              totalItemsCount={weightEntries.length}
              pageRangeDisplayed={5}
              onChange={handlePageChange}
              innerClass="flex justify-center"
              itemClass="mx-1"
              linkClass="bg-blue-600 px-3 py-1 rounded-md text-white hover:bg-blue-700"
              activeLinkClass="bg-blue-700"
            />
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-75">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-bold mb-4">Confirm Weight Entry</h3>
            <p>Are you sure you want to add this weight entry?</p>
            <div className="mt-6 flex justify-center">
              <button
                onClick={confirmAddWeightEntry}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2"
              >
                Confirm
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeightTracker;