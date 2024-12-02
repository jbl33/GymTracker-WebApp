import React, { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";

function PreviousWorkoutTable() {
  const cookies = new Cookies();
  const authKey = cookies.get("authKey");
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [workoutsPerPage] = useState(15);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);

  useEffect(() => {
    if (!authKey) {
      navigate("/login");
    }
  }, [authKey, navigate]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/getAllUserSets?authKey=${authKey}`
        );
        const data = await response.json();

        const workoutMap = new Map();

        data.sets.forEach((set) => {
          if (!workoutMap.has(set.workout_id)) {
            workoutMap.set(set.workout_id, {
              workout_id: set.workout_id,
              date: set.workoutDate,
              sets: 0,
            });
          }
          workoutMap.get(set.workout_id).sets += 1;
        });

        const workoutsArray = Array.from(workoutMap.values());
        workoutsArray.sort((a, b) => new Date(b.date) - new Date(a.date));

        setWorkouts(workoutsArray);
      } catch (error) {
        console.error("Error fetching workouts:", error);
      }
    };

    fetchWorkouts();
  }, [authKey]);

  const confirmDeleteWorkout = (workoutID) => {
    setSelectedWorkoutId(workoutID);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedWorkoutId) return;

    try {
      const response = await fetch(`http://localhost:3000/deleteWorkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authKey: authKey,
          workoutID: selectedWorkoutId,
        }),
      });

      if (response.ok) {
        console.log("Workout deleted successfully");
        setWorkouts((prevWorkouts) =>
          prevWorkouts.filter((workout) => workout.workout_id !== selectedWorkoutId)
        );
        setIsModalOpen(false);
      } else {
        console.error("Error deleting workout");
      }
    } catch (error) {
      console.error("Error deleting workout:", error);
    }
  };

  const indexOfLastWorkout = currentPage * workoutsPerPage;
  const indexOfFirstWorkout = indexOfLastWorkout - workoutsPerPage;
  const currentWorkouts = workouts.slice(
    indexOfFirstWorkout,
    indexOfLastWorkout
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(workouts.length / workoutsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50">
      <div className="w-full max-w-4xl bg-white p-8 border shadow-lg rounded-lg">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
          Previous Workouts
        </h1>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Number of Sets
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {currentWorkouts.map((workout) => (
                <tr
                  key={workout.workout_id}
                  className="odd:bg-white even:bg-gray-100"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {workout.workout_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {workout.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {workout.sets}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      type="button"
                      className="border border-gray-300 px-4 py-2 rounded-md bg-white hover:bg-gray-100 text-red-500 hover:text-blue-800 transition-colors duration-150 focus:outline-none"
                      onClick={() => confirmDeleteWorkout(workout.workout_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center mt-6">
          <nav>
            <ul className="inline-flex items-center -space-x-px">
              {pageNumbers.map((number) => (
                <li key={number}>
                  <a
                    href="#!"
                    onClick={() => paginate(number)}
                    className={`py-2 px-3 leading-tight border ${currentPage === number
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-indigo-600 border-gray-300"
                      } hover:bg-indigo-600 hover:text-white border-gray-300 cursor-pointer transition-colors duration-150`}
                  >
                    {number}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete this workout? This action is permanent.</p>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded mr-2"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PreviousWorkoutTable;