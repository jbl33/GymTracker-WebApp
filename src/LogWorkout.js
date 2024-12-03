import React, { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import ConfirmationComponent from "./ConfirmationComponent";
function LogWorkout() {
  const [exercises, setExercises] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const cookiesRef = React.useRef(new Cookies());
  const cookies = cookiesRef.current;
  const [workoutLog, setWorkoutLog] = useState([]);
  const [pastWorkouts, setPastWorkouts] = useState([]);
  const [publicTemplates, setPublicTemplates] = useState([]);
  const [templateSearch, setTemplateSearch] = useState("");
  const [privateTemplates, setPrivateTemplates] = useState([]);
  const [publicCurrentPage, setPublicCurrentPage] = useState(1);
  const [privateCurrentPage, setPrivateCurrentPage] = useState(1);
  const navigate = useNavigate();
  const templatesPerPage = 5;

  useEffect(() => {
    fetch("http://localhost:3000/getExercises")
      .then((response) => response.json())
      .then((data) => {
        setExercises(data.exercises);
      })
      .catch((error) => console.error("Error fetching exercises:", error));

    fetchPublicTemplates();
  }, []);

  useEffect(() => {
    if (!cookies.get("userID")) {
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
          const workoutsByDate = data.sets.reduce((acc, set) => {
            if (!acc[set.workoutDate]) {
              acc[set.workoutDate] = [];
            }
            acc[set.workoutDate].push(set);
            return acc;
          }, {});
          const sortedWorkoutDates = Object.keys(workoutsByDate)
            .sort((a, b) => new Date(b) - new Date(a))
            .slice(0, 10);
          const workoutSummaries = sortedWorkoutDates.map((date) => {
            const sets = workoutsByDate[date];
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

            return { date, sets, summaryString };
          });

          setPastWorkouts(workoutSummaries);
        } catch (error) {
          console.error("Error fetching past workouts:", error);
        }
      }
    };
    fetchPastWorkouts();
  }, [cookies]);

  const addExerciseRow = () => {
    setWorkoutLog([...workoutLog, { exerciseName: "", reps: "", weight: "" }]);
  };

  const submitExercise = async () => {
    try {
      const authKey = cookies.get("authKey");
      if (!authKey) {
        throw new Error("API key is missing");
      }
      const userID = await fetchUserID(authKey);
      if (workoutLog.length === 0) {
        document.getElementById("results-message").innerHTML = `
                    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error logging workout!</strong>
                        <span className="block sm:inline">Please add at least one set to log a workout.</span>
                    </div>
                `;
        document.getElementById("results-message").scrollIntoView({ behavior: "smooth" });
        throw new Error("No sets to log");
      }
      if (!userID) {
        document.getElementById("results-message").innerHTML = `
                    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error logging workout!</strong>
                        <span className="block sm:inline">Error grabbing user information. Please try logging in again.</span>
                    </div>
                `;
        document.getElementById("results-message").scrollIntoView({ behavior: "smooth" });
        throw new Error("User ID is null");
      }
      const random = Math.floor(Math.random() * 100000000000000);
      const date = new Date().toISOString().slice(0, 10);
      const workoutID = random;

      if (
        workoutLog.some((log) => !log.exerciseName || !log.reps || !log.weight)
      ) {
        document.getElementById("results-message").innerHTML = `
                    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong class="font-bold">Error logging workout!</strong>
                        <span class="block sm:inline bg-red-100">Please ensure all fields are filled out.</span>
                    </div>
                `;
        document.getElementById("results-message").scrollIntoView({ behavior: "smooth" });
        throw new Error("Missing data in workout log");
      }

      if (
        workoutLog.some(
          (log) =>
            log.reps < 1 ||
            log.reps > 500 ||
            log.weight < 1 ||
            log.weight > 1000
        )
      ) {
        document.getElementById("results-message").innerHTML = `
                    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong class="font-bold">Error logging workout!</strong>
                        <span class="block sm:inline bg-red-100">Invalid rep count or weight. Are you sure you inputted the data correctly?</span>
                    </div>
                `;
                document.getElementById("results-message").scrollIntoView({ behavior: "smooth" });
        throw new Error(
          "Invalid rep count or weight. Are you sure you inputted the data correctly?"
        );
      } else {
        await insertWorkout(
          userID,
          date,
          workoutID,
          workoutLog,
          cookies.get("authKey")
        );
        workoutLog.forEach((log) => {
          if (!log.reps || !log.weight) {
            throw new Error("Invalid rep count or weight");
          } else {
            insertWorkoutSet(workoutID, log.exerciseName, log.reps, log.weight);
          }
        });
        navigate("/login");
      }
    } catch (error) {
      console.error("Error logging workout:", error);
    }
  };

  const insertWorkoutSet = async (workoutID, exerciseName, reps, weight) => {
    return fetch("http://localhost:3000/insertWorkoutSet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ workoutID, exerciseName, reps, weight }),
    });
  };

  const fetchUserID = async (authKey) => {
    try {
      const response = await fetch(
        `http://localhost:3000/getUser?authKey=${authKey}`
      );
      const data = await response.json();
      return data.user.id;
    } catch (error) {
      console.error("Error fetching userID:", error);
      throw error;
    }
  };

  const insertWorkout = async (userID, date, workoutID, workoutLog, authKey) => {
    var rpeElements = document.getElementsByName("rpe");
    var rpe = rpeElements.length > 0 ? rpeElements[0].value : 0;
    if (!rpe) {
      rpe = 0;
    } else if (rpe > 10) {
      rpe = 10;
    } else if (rpe < 0) {
      rpe = 0;
    }
    return fetch("http://localhost:3000/insertWorkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userID,
        date,
        workoutID,
        workoutLog,
        authKey,
        rpe,
      }),
    });
  };

  const deleteLastRow = () => {
    const newWorkoutLog = [...workoutLog];
    newWorkoutLog.pop();
    setWorkoutLog(newWorkoutLog);
  };

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const newWorkoutLog = [...workoutLog];
    newWorkoutLog[index][name] = value;
    setWorkoutLog(newWorkoutLog);
  };

  const saveTemplate = () => {
    if (workoutLog.length === 0) {
      document.getElementById("results-message").innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong class="font-bold">Error!</strong>
                    <span class="block sm:inline">You must have at least one set in the workout to save a template.</span>
                </div>
            `;
      return;
    }

    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-10";

    modal.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-xl">
                <h2 class="text-xl font-semibold mb-4">Save Template</h2>
                <input type="text" id="template-name" placeholder="Template Name" class="mb-2 p-2 w-full border rounded-sm" />
                <textarea id="template-description" placeholder="Description" class="mb-2 p-2 w-full border rounded-sm"></textarea>
                <label class="block mb-2">
                    <input type="checkbox" id="make-public" />
                    Make Public
                </label>
                <div class="flex justify-end">
                    <button id="save-template" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Save</button>
                    <button id="cancel-template" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-2">Cancel</button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    document
      .getElementById("save-template")
      .addEventListener("click", async () => {
        const name = document.getElementById("template-name").value;
        const description = document.getElementById(
          "template-description"
        ).value;
        const isPublic = document.getElementById("make-public").checked;
        const userID = cookies.get("userID");

        try {
          const response = await fetch("http://localhost:3000/insertTemplate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name,
              description,
              publicMode: isPublic,
              sets: workoutLog,
              userID,
            }),
          });

          const data = await response.json();
          if (response.ok) {
            document.getElementById("results-message").innerHTML = `
                        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                            <strong class="font-bold">Success!</strong>
                            <span class="block sm:inline">Template saved successfully.</span>
                        </div>
                    `;
            fetchPublicTemplates();
            fetchPrivateTemplates(userID);
          }
        } catch (error) {
          console.error("Error saving template:", error);
          document.getElementById("results-message").innerHTML = `
                    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error saving template!</strong>
                        <span className="block sm:inline">Please make sure you included a name</span>
                    </div>
                `;
        } finally {
          document.body.removeChild(modal);
                // Scroll to notification
                document.getElementById("results-message").scrollIntoView({ behavior: "smooth" });
        }
      });

    document.getElementById("cancel-template").addEventListener("click", () => {
      document.body.removeChild(modal);
    });
  };

  const fetchPublicTemplates = async () => {
    try {
      const response = await fetch("http://localhost:3000/getTemplates");
      const data = await response.json();
      setPublicTemplates(data.templates);
    } catch (error) {
      console.error("Error fetching public templates:", error);
    }
  };

  const loadPreviousWorkout = (sets) => {
    setWorkoutLog(
      sets.map((set) => ({
        exerciseName: set.exercise_name,
        reps: set.reps,
        weight: set.weight,
      }))
    );
    document.getElementById("workout-log").scrollIntoView({ behavior: "smooth" });
  };
  const fetchPrivateTemplates = async (userID) => {
    try {
      const response = await fetch(
        `http://localhost:3000/getPrivateTemplates?userID=${userID}`
      );
      const data = await response.json();
      setPrivateTemplates(data.templates);
    } catch (error) {
      console.error("Error fetching private templates:", error);
    }
  };

  useEffect(() => {
    const userID = cookies.get("userID");
    if (userID) {
      fetchPrivateTemplates(userID);
    }
  }, [cookies]);
  
  const loadTemplate = async (templateID) => {
    try {
      const response = await fetch(
        `http://localhost:3000/getTemplateSets?templateID=${templateID}`
      );
      let data = await response.json();
      const orderedSets = data.sets.sort(
        (a, b) => a.order_index - b.order_index
      );
      setWorkoutLog(
        orderedSets.map((set) => ({
          exerciseName: set.exercise_name,
          reps: set.reps === null ? "" : set.reps,
          weight: set.weight === null ? "" : set.weight,
        }))
      );
      document
        .getElementById("workout-log")
        .scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Error loading template:", error);
    }
  };

  const filteredPublicTemplates = publicTemplates
    .filter(
      (template) =>
        template.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
        (template.description &&
          template.description.toLowerCase().includes(templateSearch.toLowerCase()))
    );

  const filteredPrivateTemplates = privateTemplates
    .filter(
      (template) =>
        template.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
        (template.description &&
          template.description.toLowerCase().includes(templateSearch.toLowerCase()))
    );

  const handlePagination = (setter, page, templates) => {
    if (page < 1 || page > Math.ceil(templates.length / templatesPerPage)) return;
    setter(page);
  };

  const handleConfirmSubmit = () => {
    setShowModal(true); // Show the confirmation modal
  };

  // Function to handle the confirmation of workout submission
  const handleSubmitConfirm = () => {
    setShowModal(false);
    submitExercise();
  };

  // Function to handle the cancellation of workout submission
  const handleSubmitCancel = () => {
    setShowModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <div className="results-message text-sm" id="results-message"></div>
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
        Log a New Workout
      </h1>

      <div className="overflow-x-auto mb-10 shadow-lg rounded-lg">
        <table
          id="workout-log"
          className="min-w-full bg-white rounded-lg overflow-hidden"
        >
          <thead>
            <tr className="bg-gray-200">
              <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700">
                Set Number
              </th>
              <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700">
                Exercise
              </th>
              <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700">
                Number of Repetitions
              </th>
              <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700">
                Weight (lbs)
              </th>
            </tr>
          </thead>
          <tbody>
            {workoutLog.map((log, index) => (
              <tr className="border-b" key={index}>
                <td className="py-4 px-5">{index + 1}</td>
                <td className="py-4 px-5">
                  <select
                    name="exerciseName"
                    value={log.exerciseName}
                    onChange={(e) => handleInputChange(index, e)}
                    className="block w-full bg-transparent border-b-2 border-gray-300 focus:border-indigo-500 outline-none py-2 transition duration-150"
                  >
                    <option value="">Select an exercise</option>
                    {exercises
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((exercise, idx) => (
                        <option key={idx} value={exercise.name}>
                          {exercise.name}
                        </option>
                      ))}
                  </select>
                </td>
                <td className="py-4 px-5">
                  <input
                    type="number"
                    name="reps"
                    value={log.reps}
                    onChange={(e) => handleInputChange(index, e)}
                    className="block w-full bg-transparent border-b-2 border-gray-300 focus:border-indigo-500 outline-none py-2 placeholder-gray-500 transition duration-150"
                    placeholder="Reps"
                  />
                </td>
                <td className="py-4 px-5">
                  <input
                    type="number"
                    name="weight"
                    min={0}
                    value={log.weight}
                    onChange={(e) => handleInputChange(index, e)}
                    className="block w-full bg-transparent border-b-2 border-gray-300 focus:border-indigo-500 outline-none py-2 placeholder-gray-500 transition duration-150"
                    placeholder="Weight"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <input
        type="number"
        name="rpe"
        max={10}
        min={1}
        className="block w-full bg-transparent border-b-2 border-gray-300 focus:border-indigo-500 outline-none py-3 text-gray-800 placeholder-gray-600 text-center text-lg appearance-none mb-6 transition duration-150"
        placeholder="Overall Workout RPE 1-10 (Optional)"
      />
      <div className="flex justify-between space-x-4">
        <button
          onClick={addExerciseRow}
          className="flex-grow bg-indigo-600 hover:bg-indigo-700 text-white text-lg py-3 rounded-lg transition duration-200"
        >
          Add Set
        </button>
        <button
          onClick={deleteLastRow}
          className="flex-grow bg-indigo-600 hover:bg-indigo-700 text-white text-lg py-3 rounded-lg transition duration-200"
        >
          Delete Set
        </button>
       <button
         onClick={handleConfirmSubmit} // Use this function instead of submitExercise
         className="flex-grow bg-indigo-600 hover:bg-indigo-700 text-white text-lg py-3 rounded-lg transition duration-200"
       >
          Submit Workout
        </button>
        <button
          onClick={saveTemplate}
          className="flex-grow bg-indigo-600 hover:bg-indigo-700 text-white text-lg py-3 rounded-lg transition duration-200"
        >
          Save as Template
        </button>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Repeat a Previous Day's Workout
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Want to save time and stay consistent? Loading a previous workout
          lets you quickly set up your session with the same exercises, sets,
          and reps as before—ideal for maintaining a steady routine or making
          small tweaks to an already effective plan. Skip the hassle of
          selecting each exercise individually and jump straight into your
          workout!
        </p>
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {pastWorkouts.map((workout, index) => (
                <tr
                  key={index}
                  className="border-b cursor-pointer hover:bg-indigo-50"
                >
                  <td className="py-4 px-5 text-center text-blue-600 font-medium">
                    <button onClick={() => loadPreviousWorkout(workout.sets)}>
                      {workout.date} ({workout.summaryString})
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TemplateSection
        title="Load Public Template"
        templates={filteredPublicTemplates}
        currentPage={publicCurrentPage}
        setCurrentPage={setPublicCurrentPage}
        templatesPerPage={templatesPerPage}
        templateSearch={templateSearch}
        setTemplateSearch={setTemplateSearch}
        loadTemplate={loadTemplate}
      />

      <TemplateSection
        title="Load Private Template"
        templates={filteredPrivateTemplates}
        currentPage={privateCurrentPage}
        setCurrentPage={setPrivateCurrentPage}
        templatesPerPage={templatesPerPage}
        templateSearch={templateSearch}
        setTemplateSearch={setTemplateSearch}
        loadTemplate={loadTemplate}
      />

      {showModal && (
        <ConfirmationComponent
          onConfirm={handleSubmitConfirm}
          onCancel={handleSubmitCancel}
        />
      )}
    </div>
  );
}

function TemplateSection({
  title,
  templates,
  currentPage,
  setCurrentPage,
  templatesPerPage,
  templateSearch,
  setTemplateSearch,
  loadTemplate,
}) {
  const indexOfLastTemplate = currentPage * templatesPerPage;
  const indexOfFirstTemplate = indexOfLastTemplate - templatesPerPage;
  const currentTemplates = templates.slice(indexOfFirstTemplate, indexOfLastTemplate);

  const totalPages = Math.ceil(templates.length / templatesPerPage);

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      <input
        type="text"
        placeholder={`Search for a${title.replace("Load", "").toLowerCase()}...`}
        value={templateSearch}
        onChange={(e) => setTemplateSearch(e.target.value)}
        className="mb-6 block w-full bg-transparent border-b-2 border-gray-300 focus:border-indigo-500 outline-none py-3 text-gray-800 placeholder-gray-600 text-lg appearance-none transition duration-150"
      />
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700">
                Name
              </th>
              <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700">
                Description
              </th>
              <th className="py-3 px-5 text-left text-sm font-semibold text-gray-700">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {currentTemplates.map((template, index) => (
              <tr
                key={index}
                className="border-b hover:bg-indigo-50 transition-colors duration-150"
              >
                <td className="py-4 px-5">{template.name}</td>
                <td className="py-4 px-5">{template.description}</td>
                <td className="py-4 px-5">
                  <button
                    onClick={() => loadTemplate(template.id)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
                  >
                    Load Template
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center space-x-4 mt-4">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded ${currentPage === 1 ? "bg-gray-300" : "bg-indigo-600 hover:bg-indigo-700 text-white"} transition duration-200`}
        >
          Previous
        </button>
        <span className="px-4 py-2">{`Page ${currentPage} of ${totalPages}`}</span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded ${currentPage === totalPages ? "bg-gray-300" : "bg-indigo-600 hover:bg-indigo-700 text-white"} transition duration-200`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default LogWorkout;