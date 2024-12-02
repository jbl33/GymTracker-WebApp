import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import Cookies from 'universal-cookie';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const WorkoutChart = () => {
  const [workoutData, setWorkoutData] = useState([]);
  const cookies = new Cookies();
  const navigate = useNavigate();

  useEffect(() => {
    const authKey = cookies.get('authKey');

    if (!authKey) {
      navigate('/login');
      return;
    }

    const fetchWorkoutData = async () => {
      try {
        const userResponse = await axios.get('http://localhost:3000/getUser', { params: { authKey } });
        const userId = userResponse.data.user.id;

        const exercisesResponse = await axios.get('http://localhost:3000/getUserWorkouts', { params: { userID: userId } });
        const exercises = exercisesResponse.data.exercises;

        const formattedData = [['Week', 'Number of Workouts']];
        const weekMap = {};

        exercises.forEach(workout => {
          const date = new Date(workout.date);
          const week = `${date.getFullYear()}-${date.getMonth()+1}-W${Math.ceil(date.getDate() / 7)}`;

          if (weekMap[week]) {
            weekMap[week]++;
          } else {
            weekMap[week] = 1;
          }
        });

        Object.keys(weekMap).sort().forEach(week => {
          formattedData.push([week, weekMap[week]]);
        });

        setWorkoutData(formattedData);
      } catch (error) {
        console.error('Error fetching workout data:', error);
      }
    };

    fetchWorkoutData();
  }, [navigate]);

  const options = {
    title: 'Weekly Workout Count',
    hAxis: { title: 'Number of Workouts', titleTextStyle: { color: '#333' }, slantedText: true, slantedTextAngle: 45 },
    vAxis: { minValue: 0, title: 'Week' },
    chartArea: { width: '70%', height: '70%' },
    legend: 'none',
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 shadow-lg rounded-lg">
      <h1 className="text-center mb-6 text-3xl font-extrabold text-gray-700">Number of Weekly Workouts</h1>
      {workoutData.length > 1 ? (
        <Chart
          chartType="BarChart"
          width="100%"
          height="400px"
          data={workoutData}
          options={options}
        />
      ) : (
        <p className="text-center text-lg font-semibold text-red-600">Loading workout data...</p>
      )}
    </div>
  );
};

export default WorkoutChart;