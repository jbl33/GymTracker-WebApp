import React, { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";

function UpdateWorkout() {
  const [pastWorkouts, setPastWorkouts] = useState([]);
  const [currentWorkout, setCurrentWorkout] = useState([]);
  const [notification, setNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const workoutsPerPage = 7;
  const cookiesRef = React.useRef(new Cookies());
  const cookies = cookiesRef.current;
  const navigate = useNavigate();

  useEffect(() => {
    if (!cookies.get("authKey")) {
      navigate("/login");
    }
  }, [cookies, navigate]);

  useEffect(() => {
    const fetchPastWorkouts = async () => {
      const authKey = cookies.get("authKey");
      if (authKey) {
        try {
          const response = await fetch(
            `http://localhost:3000/getAllUserSets?authKey=${authKey}`
          );
          const data = await response.json();

          // Create a list of workouts by workout_id
          const workoutsById = data.sets.reduce((acc, set) => {
            if (!acc[set.workout_id]) {
              acc[set.workout_id] = [];
            }
            acc[set.workout_id].push(set);
            return acc;
          }, {});

          const workoutSummaries = Object.keys(workoutsById).map((workoutId) => {
            const sets = workoutsById[workoutId];
            const exerciseSummary = sets.reduce(
              (summary, { exercise_name }) => {
                summary[exercise_name] = (summary[exercise_name] || 0) + 1;
                return summary;
              },
              {}
            );

            const summaryString = Object.entries(exerciseSummary)
              .map(([name, count]) => `${count}x ${name}`)
              .join(", ");

            const date = sets[0].workoutDate;

            return { id: workoutId, date, sets, summaryString };
          });

          setPastWorkouts(workoutSummaries);
        } catch (error) {
          console.error("Error fetching past workouts:", error);
          showNotification("Error fetching past workouts");
        }
      }
    };
    fetchPastWorkouts();
  }, [cookies]);

  const loadPreviousWorkout = (sets) => {
    setCurrentWorkout(
      sets.map((set) => ({
        id: set.id,
        exerciseName: set.exercise_name,
        reps: set.reps,
        weight: set.weight,
      }))
    );
    document.getElementById("update-log").scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const updatedWorkout = [...currentWorkout];

    if (name === "reps" || name === "weight") {
      let parsedValue = parseFloat(value);
      if (!isNaN(parsedValue)) {
        parsedValue = Math.round(parsedValue);
      }
      updatedWorkout[index][name] = parsedValue;
    } else {
      updatedWorkout[index][name] = value;
    }

    setCurrentWorkout(updatedWorkout);
  };

  const updateWorkout = async () => {
    if (currentWorkout.length === 0) {
      showNotification("No workout selected or loaded.");
      document.getElementById("update-tag").scrollIntoView({ behavior: "smooth" });
      return;
    }

    const authKey = cookies.get("authKey");
    if (!authKey) {
      showNotification("API key is missing");
      return;
    }

    try {
      for (const set of currentWorkout) {
        const response = await fetch(
          "http://localhost:3000/updateWorkoutSet",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              authKey,
              setID: set.id,
              reps: set.reps,
              weight: set.weight,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }
      }

      showNotification("Workout updated successfully!", true);
      document.getElementById("update-tag").scrollIntoView({ behavior: "smooth" });
      setCurrentWorkout([]);
    } catch (error) {
      console.error("Error updating workout:", error);
      showNotification("Error updating workout");
      document.getElementById("update-tag").scrollIntoView({ behavior: "smooth" });
    }
  };

  const showNotification = (message, isSuccess = false) => {
    const notificationColor = isSuccess ? "bg-green-500" : "bg-red-500";
    setNotification({ message, color: notificationColor });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const totalPages = Math.ceil(pastWorkouts.length / workoutsPerPage);
  const indexOfLastWorkout = currentPage * workoutsPerPage;
  const indexOfFirstWorkout = indexOfLastWorkout - workoutsPerPage;
  const currentWorkouts = pastWorkouts.slice(indexOfFirstWorkout, indexOfLastWorkout);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <h1 id="update-tag" className="text-4xl font-extrabold text-center text-gray-900 mb-8">
        Update a Workout
      </h1>
      {notification && (
        <div
          className={`${notification.color} text-white p-3 mb-8 text-center font-medium rounded-lg shadow-md`}
        >
          {notification.message}
        </div>
      )}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Previous Workouts
        </h2>
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full bg-white rounded-lg">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700">
                  Date
                </th>
                <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700">
                  Summary
                </th>
                <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentWorkouts.map((workout) => (
                <tr key={workout.id} className="border-b hover:bg-gray-100">
                  <td className="py-4 px-5">{workout.date}</td>
                  <td className="py-4 px-5">{workout.summaryString}</td>
                  <td className="py-4 px-5">
                    <button
                      onClick={() => loadPreviousWorkout(workout.sets)}
                      className="border border-gray-300 px-4 py-2 rounded-md bg-white hover:bg-gray-100 text-blue-500 hover:text-blue-800 transition-colors duration-150 focus:outline-none">
                      Load
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex justify-center">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`px-4 py-2 border rounded ${currentPage === index + 1 ? "bg-gray-300" : "bg-white"} 
                hover:bg-gray-200 ml-2`}>
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Workout</h2>
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table id="update-log" className="min-w-full bg-white rounded-lg">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700">
                  Exercise
                </th>
                <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700">
                  Reps
                </th>
                <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700">
                  Weight (lbs)
                </th>
              </tr>
            </thead>
            <tbody>
              {currentWorkout.length > 0 ? (
                currentWorkout.map((set, index) => (
                  <tr key={set.id} className="border-b hover:bg-gray-100">
                    <td className="py-4 px-5">{set.exerciseName}</td>
                    <td className="py-4 px-5">
                      <input
                        type="number"
                        name="reps"
                        value={set.reps}
                        onChange={(e) => handleInputChange(index, e)}
                        className="block w-full bg-transparent border-b-2 border-gray-300 focus:border-indigo-500 outline-none py-2 placeholder-gray-500 transition duration-150"
                        placeholder="Reps"
                      />
                    </td>
                    <td className="py-4 px-5">
                      <input
                        type="number"
                        name="weight"
                        value={set.weight}
                        onChange={(e) => handleInputChange(index, e)}
                        className="block w-full bg-transparent border-b-2 border-gray-300 focus:border-indigo-500 outline-none py-2 placeholder-gray-500 transition duration-150"
                        placeholder="Weight"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-600">
                    No workout loaded. Select one from previous workouts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <button
          onClick={updateWorkout}
          className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition duration-200 w-full"
        >
          Update Workout
        </button>
      </div>
    </div>
  );
}

export default UpdateWorkout;