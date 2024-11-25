import React, { useState, useRef } from "react"; 
import axios from "axios"; 
import Cookies from 'universal-cookie'; 
import { useNavigate } from "react-router-dom"; 

const WorkoutForm = () => { 
  const [selectedWorkoutTypes, setSelectedWorkoutTypes] = useState([]); 
  const [selectedEquipment, setSelectedEquipment] = useState([]); 
  const [workoutPlan, setWorkoutPlan] = useState([]); 
  const [numberOfSets, setNumberOfSets] = useState(5); 
  const workoutPlanRef = useRef(null); 
  const cookies = new Cookies(); 
  const navigate = useNavigate(); 
  const apiKey = cookies.get('apiKey'); 
  const userID = cookies.get('userID'); 

  if(!apiKey) { 
    navigate("/login"); 
  } 

  const workoutTypes = [ 
    { group: "Legs", muscles: ["Calves", "Quads", "Hamstrings", "Glutes"] }, 
    { group: "Upper Body", muscles: ["Chest", "Biceps", "Triceps", "Shoulders", "Traps", "Forearms"] }, 
    { group: "Core", muscles: ["Abs", "Obliques"] }, 
    { group: "Back", muscles: ["Lats"] }, 
  ];  

  const equipmentOptions = [ 
    "Bodyweight", 
    "Dumbbell", 
    "Barbell", 
    "Curl Bar", 
    "Squat Rack", 
    "Bench", 
    "Preacher Curl Podium", 
    "Resistance Bands", 
    "Pulley System", 
    "Medicine Ball", 
    "Kettlebell" 
  ]; 

  const handleWorkoutTypeChange = (type) => 
    setSelectedWorkoutTypes((prev) => 
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type] 
    ); 

  const handleEquipmentChange = (item) => 
    setSelectedEquipment((prev) => 
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item] 
    ); 

  const handleSubmit = async (e) => { 
    e.preventDefault(); 

    if (numberOfSets < 1) { 
      document.getElementById("notification").innerHTML = ` 
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert"> 
          <strong class="font-bold">Error!</strong> 
          <span class="block sm:inline">Please select at least one set.</span> 
        </div> 
      `; 
      return; 
    } 

    if (numberOfSets > 25) { 
      document.getElementById("notification").innerHTML = ` 
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert"> 
          <strong class="font-bold">Error!</strong> 
          <span class="block sm:inline">Please select a maximum of 25 sets.</span> 
        </div> 
      `; 
      document.getElementById("notification").scrollIntoView(); 
      return; 
    } 

    const filteredWorkoutTypes = selectedWorkoutTypes.filter(Boolean); 
    const filteredEquipment = selectedEquipment.filter(Boolean); 

    if(filteredWorkoutTypes.length === 0 || filteredEquipment.length === 0) { 
      document.getElementById("notification").innerHTML = ` 
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert"> 
          <strong class="font-bold">Error!</strong> 
          <span class="block sm:inline">Please select at least one workout type and one equipment.</span> 
        </div> 
      `; 
      document.getElementById("notification").scrollIntoView(); 
      return; 
    } 

    document.getElementById("notification").innerHTML = ` 
      <div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative" role="alert"> 
        <strong class="font-bold">Info!</strong> 
        <span class="block sm:inline">Generating workout... Please allow up to 30 seconds for the workout to be generated.</span> 
      </div> 
    `; 
    document.getElementById("notification").scrollIntoView(); 

    try { 
      const response = await axios.post("http://localhost:3000/getSuggestedWorkout", { 
        workoutTypes: filteredWorkoutTypes, 
        equipment: filteredEquipment, 
        numberOfSets 
      }); 
      const exercises = response.data.exercises; 
      setWorkoutPlan(exercises); 

      if (exercises.length > 0) { 
        setTimeout(() => { 
          workoutPlanRef.current.scrollIntoView({ behavior: "smooth" }); 
        }, 100); 
      } 
    } catch (error) { 
      console.error("Error fetching workout plan", error); 
      document.getElementById("notification").innerHTML = ` 
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert"> 
          <strong class="font-bold">Error!</strong> 
          <span class="block sm:inline">Error generating workout. Please try again.</span> 
        </div> 
      `; 
    } 
  }; 

  const saveTemplate = () => { 
    if (workoutPlan.length === 0) { 
      document.getElementById("notification").innerHTML = ` 
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert"> 
          <strong class="font-bold">Error!</strong> 
          <span class="block sm:inline">You must have a workout plan to save a template.</span> 
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

    document.getElementById("save-template").addEventListener("click", async () => { 
      const name = document.getElementById("template-name").value; 
      const description = document.getElementById("template-description").value; 
      let isPublic; 
      if(document.getElementById("make-public").checked) { 
        isPublic = 1; 
      } else { 
        isPublic = 0; 
      } 
      const workoutLog = workoutPlan.map((exercise, index) => ({ 
        exerciseName: exercise.name, 
        reps: "10", 
        weight: "0", 
        order_index: index 
      })); 

      try { 
        const response = await fetch("http://localhost:3000/insertTemplate", { 
          method: "POST", 
          headers: { 
            "Content-Type": "application/json" 
          }, 
          body: JSON.stringify({ 
            name, 
            description, 
            public: isPublic, 
            sets: workoutLog, 
            userID 
          }) 
        }); 

        const data = await response.json(); 
        if (response.ok) { 
          document.getElementById("notification").innerHTML = ` 
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert"> 
              <strong class="font-bold">Success!</strong> 
              <span class="block sm:inline">Template "${name}" has been saved.</span> 
            </div> 
          `; 
          document.getElementById("notification").scrollIntoView(); 
        } else { 
          document.getElementById("notification").innerHTML = ` 
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert"> 
              <strong class="font-bold">Error!</strong> 
              <span class="block sm:inline">${data.message}</span> 
            </div> 
          `; 
          document.getElementById("notification").scrollIntoView(); 
        } 
      } catch (error) { 
        console.error("Error saving template:", error); 
        document.getElementById("notification").innerHTML = ` 
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert"> 
            <strong class="font-bold">Error!</strong> 
            <span class="block sm:inline">Error saving template. Please try again.</span> 
          </div> 
        `; 
        document.getElementById("notification").scrollIntoView(); 
      } finally { 
        document.body.removeChild(modal); 
      } 
    }); 

    document.getElementById("cancel-template").addEventListener("click", () => { 
      document.body.removeChild(modal); 
    }); 
  }; 

  return ( 
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50"> 
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8"> 
        Generate Workout Plan (AI) 
      </h1> 
      <div id="notification" className="mb-4"></div> 
      <div className="flex flex-wrap justify-center gap-10"> 
        <div className="w-full max-w-md p-6 bg-white border shadow-lg rounded-lg"> 
          <form onSubmit={handleSubmit} className="space-y-6"> 
            <div> 
              <label className="text-lg font-semibold text-gray-700">Targeted Muscles</label> 
              <div className="mt-3"> 
                {workoutTypes.map((group) => (
                  <div key={group.group} className="mb-4">
                    <h3 className="text-md font-bold">{group.group}</h3>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {group.muscles.map((muscle) => (
                        <div key={muscle} className="flex items-center"> 
                          <input 
                            type="checkbox" 
                            value={muscle} 
                            checked={selectedWorkoutTypes.includes(muscle)} 
                            onChange={() => handleWorkoutTypeChange(muscle)} 
                            className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out" 
                          /> 
                          <label className="ml-3 text-sm font-medium text-gray-700">{muscle}</label> 
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div> 
            </div> 
            <div> 
              <label className="text-lg font-semibold text-gray-700">Equipment</label> 
              <div className="mt-3 grid grid-cols-2 gap-3"> 
                {equipmentOptions.map((item) => ( 
                  <div key={item} className="flex items-center"> 
                    <input 
                      type="checkbox" 
                      value={item} 
                      checked={selectedEquipment.includes(item)} 
                      onChange={() => handleEquipmentChange(item)} 
                      className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out" 
                    /> 
                    <label className="ml-3 text-sm font-medium text-gray-700">{item}</label> 
                  </div> 
                ))} 
              </div> 
            </div> 
            <div> 
              <label className="text-lg font-semibold text-gray-700">Number of Sets</label> 
              <input 
                type="number" 
                value={numberOfSets} 
                onChange={(e) => setNumberOfSets(parseInt(e.target.value))} 
                min="1" 
                className="mt-3 p-2 w-full border rounded-sm" 
              /> 
            </div> 
            <button 
              type="submit" 
              className="w-full py-3 text-lg font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition duration-200" 
            > 
              Generate 
            </button> 
          </form> 
        </div> 
        {workoutPlan.length > 0 && ( 
          <div ref={workoutPlanRef} className="w-full max-w-md p-6 bg-white border shadow-lg rounded-lg"> 
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Suggested Workout</h2> 
            <table className="min-w-full bg-white rounded-lg shadow overflow-hidden"> 
              <thead> 
                <tr className="bg-indigo-600 text-white"> 
                  <th className="py-2 px-4">Order</th> 
                  <th className="py-2 px-4">Exercise Name</th> 
                  <th className="py-2 px-4">Target Muscle Group</th> 
                </tr> 
              </thead> 
              <tbody> 
                {workoutPlan.map((exercise, index) => ( 
                  <tr key={index} className="bg-indigo-50 odd:bg-white"> 
                    <td className="py-2 px-4">{exercise.order}</td> 
                    <td className="py-2 px-4">{exercise.name}</td> 
                    <td className="py-2 px-4">{exercise.group}</td> 
                  </tr> 
                ))} 
              </tbody> 
            </table> 
            <button 
              onClick={saveTemplate} 
              className="mt-4 w-full py-3 text-lg font-medium text-white bg-blue-500 rounded-md hover:bg-blue-700 transition duration-200" 
            > 
              Save Template 
            </button> 
          </div> 
        )} 
      </div> 
    </div> 
  ); 
}; 

export default WorkoutForm;