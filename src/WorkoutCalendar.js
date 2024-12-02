import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Cookies from 'universal-cookie';
import axios from 'axios';

const WorkoutCalendar = () => {
  const [workoutDates, setWorkoutDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workouts, setWorkouts] = useState([]);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState(null);
  const cookies = new Cookies();
  const authKey = cookies.get('authKey');

  useEffect(() => {
    fetchWorkoutDates();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      handleDateClick(selectedDate);
    }
  }, [workoutDates]);

  const formatDate = (date) => date.toISOString().slice(0, 10);

  const fetchWorkoutDates = async () => {
    try {
      const userIdResponse = await axios.get('http://localhost:3000/getUserID', {
        params: { authKey: authKey },
      });
      const userId = userIdResponse.data.userId;

      const workoutResponse = await axios.get('http://localhost:3000/getUserWorkouts', {
        params: { userID: userId },
      });

      const dates = workoutResponse.data.exercises.map((workout) => workout.date);
      setWorkoutDates(dates);
    } catch (error) {
      console.error('Error fetching workout dates:', error);
    }
  };

  const handleDateClick = async (date) => {
    setSelectedDate(date);
    try {
      const formattedDate = formatDate(date);
      const userIdResponse = await axios.get('http://localhost:3000/getUserID', {
        params: { authKey },
      });
      const userId = userIdResponse.data.userId;

      const workoutResponse = await axios.get('http://localhost:3000/getUserWorkouts', {
        params: { userID: userId },
      });

      const workoutsOnDate = workoutResponse.data.exercises.filter(
        (workout) => workout.date === formattedDate
      );

      const workoutsWithSets = await Promise.all(
        workoutsOnDate.map(async (workout) => {
          try {
            const workoutSetsResponse = await axios.get('http://localhost:3000/getWorkoutSets', {
              params: { workoutID: workout.workout_id, authKey },
            });

            return {
              ...workout,
              sets: workoutSetsResponse.data.sets || [],
            };
          } catch (error) {
            console.error('Error fetching workout sets:', error);
            return {
              ...workout,
              sets: [],
            };
          }
        })
      );

      setWorkouts(workoutsWithSets);
    } catch (error) {
      console.error('Error fetching workout details:', error);
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = formatDate(date);
      if (workoutDates.includes(dateStr)) {
        return 'highlight-workout';
      } else {
        return 'highlight-no-workout';
      }
    }
    return '';
  };

  const toggleWorkoutExpansion = (workoutId) => {
    setExpandedWorkoutId(expandedWorkoutId === workoutId ? null : workoutId);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-8 bg-gray-50">
      <h1 className="text-center mb-6 text-3xl font-extrabold text-gray-700">Workout Calendar</h1>
      <div className="w-full max-w-4xl bg-gray-100 p-6 shadow-md rounded-lg space-y-6">
        <div className="calendar-container w-full">
          <Calendar
            tileClassName={tileClassName}
            onClickDay={handleDateClick}
            value={selectedDate}
            className="text-gray-800 w-full"
          />
        </div>
        <div className="workout-details w-full">
          {selectedDate && (
            <div>
              <h2 className="mb-4 text-lg font-bold text-blue-700">
                Workouts on {formatDate(selectedDate)}
              </h2>
              {workouts.length > 0 ? (
                workouts.map((workout) => (
                  <div key={workout.workout_id} className="mb-4">
                    <h3
                      className="cursor-pointer text-blue-600 font-medium hover:underline"
                      onClick={() => toggleWorkoutExpansion(workout.workout_id)}
                    >
                      Workout ID: {workout.workout_id}{' '}
                      <span className="text-sm text-gray-500">(click to expand)</span>
                    </h3>
                    {expandedWorkoutId === workout.workout_id && (
                      <ul className="space-y-2 mt-2">
                        {workout.sets.map((set) => (
                          <li key={set.id} className="p-3 bg-white rounded-lg shadow-inner">
                            <div className="flex flex-col gap-1">
                              <p className="text-sm font-semibold text-gray-700">
                                Exercise: {set.exercise_name}
                              </p>
                              <p className="text-sm text-gray-600">Reps: {set.reps}</p>
                              <p className="text-sm text-gray-600">Weight: {set.weight} lbs</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No workouts recorded for this day.</p>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`
        .highlight-workout {
          background-color: #ccffcc;
          color: black;
        }
        .highlight-no-workout {
          background-color: #ffcccc;
        }
      `}</style>
    </div>
  );
};

export default WorkoutCalendar;