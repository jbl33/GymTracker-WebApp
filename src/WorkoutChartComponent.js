import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import Cookies from 'universal-cookie';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const WorkoutChartComponent = () => {
  const [volumeData, setVolumeData] = useState([]);
  const [averageWeightData, setAverageWeightData] = useState([]);
  const [rpeData, setRpeData] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [showVolume, setShowVolume] = useState(false);
  const [showAverageWeight, setShowAverageWeight] = useState(false);
  const [showRpe, setShowRpe] = useState(true);
  const [prLogs, setPrLogs] = useState([]);
  const [daysSinceLastPR, setDaysSinceLastPR] = useState(null);
  const cookies = new Cookies();
  const navigate = useNavigate();
  const userID = cookies.get('userID');

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await axios.get('http://localhost:3000/getExercises');
        setExercises(response.data.exercises.map((e) => e.name));
      } catch (error) {
        console.error('Error fetching exercises:', error);
      }
    };

    fetchExercises();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const apiKey = cookies.get('apiKey');
      if (!apiKey) {
        navigate('/login');
        return;
      }

      try {
        if (selectedExercise) {
          const setsResponse = await axios.get('http://localhost:3000/getAllUserSets', {
            params: { apiKey, exerciseType: selectedExercise },
          });
          const allSets = setsResponse.data.sets;

          const dates = [...new Set(allSets.map((set) => set.workoutDate))];

          const volumeData = [['Date', 'Total Volume (lbs)']];
          const averageWeightData = [['Date', 'Average Weight (lbs)']];
          dates.forEach((date) => {
            const setsOnDate = allSets.filter((set) => set.workoutDate === date);
            const totalVolume = setsOnDate.reduce((sum, set) => sum + set.weight * set.reps, 0);
            const averageWeight = setsOnDate.reduce((sum, set) => sum + set.weight, 0) / setsOnDate.length;
            volumeData.push([date, totalVolume]);
            averageWeightData.push([date, averageWeight]);
          });

          setVolumeData(volumeData.length > 1 ? volumeData.sort((a, b) => new Date(a[0]) - new Date(b[0])) : []);
          setAverageWeightData(averageWeightData.length > 1 ? averageWeightData.sort((a, b) => new Date(a[0]) - new Date(b[0])) : []);

          let maxWeight = 0;
          let maxVolume = 0;
          const prLogs = [];

          allSets.forEach(set => {
            const volume = set.weight * set.reps;
            let improved = false;
            let achievement = '';

            if (set.weight > maxWeight) {
              achievement = 'New Heaviest Set';
              improved = set.weight - maxWeight;
              maxWeight = set.weight;
            } else if (volume > maxVolume) {
              achievement = 'New Set Volume Record';
              improved = volume - maxVolume;
              maxVolume = volume;
            }

            if (improved) {
              prLogs.push({
                date: set.workoutDate,
                achievement,
                weight: `${set.weight} lbs`,
                reps: set.reps,
                improvement: `${improved} lbs`
              });
            }
          });

          const recentPrLogs = prLogs.slice(-20).reverse();
          setPrLogs(recentPrLogs);

          if (recentPrLogs.length > 0) {
            const lastPrDate = new Date(recentPrLogs[0].date);
            const today = new Date();
            const timeDiff = today - lastPrDate;
            const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            setDaysSinceLastPR(daysDiff);
          } else {
            setDaysSinceLastPR(null);
          }
        }

        const workoutsResponse = await axios.get('http://localhost:3000/getUserWorkouts', {
          params: { userID: userID },
        });
        const workouts = workoutsResponse.data.exercises;

        const rpeData = [['Date', 'RPE']];
        workouts.forEach((workout) => {
          if (workout.rpe > 0) {
            rpeData.push([workout.date, workout.rpe]);
          }
        });

        setRpeData(rpeData.length > 1 ? rpeData.sort((a, b) => new Date(a[0]) - new Date(b[0])) : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [selectedExercise]);

  const chartOptions = (title, vAxisTitle, dataSetLength) => ({
    title,
    hAxis: { title: 'Date', textPosition: dataSetLength > 15 ? 'none' : 'out' },
    vAxis: { title: vAxisTitle },
  });

  return (
    <div className="container mt-0 mx-auto p-6 bg-gray-100 shadow-lg rounded-lg">
      <h1 className="text-center mb-6 text-3xl font-extrabold text-gray-700">Workout Insights & PR Log</h1>
      
      <div className="flex justify-center mb-6">
        <select
          className="border border-gray-300 p-2 rounded-md shadow-md"
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
        >
          <option value="" disabled>Select an exercise</option>
          {exercises.map((exercise) => (
            <option key={exercise} value={exercise}>
              {exercise}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-center space-x-6 mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showVolume}
            onChange={() => setShowVolume(!showVolume)}
            className="mr-2"
          />
          Total Volume
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showAverageWeight}
            onChange={() => setShowAverageWeight(!showAverageWeight)}
            className="mr-2"
          />
          Average Weight
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showRpe}
            onChange={() => setShowRpe(!showRpe)}
            className="mr-2"
          />
          Workout RPE
        </label>
      </div>

      <div className="mb-8">
        {showVolume ? (
          selectedExercise ? (
            volumeData.length > 0 ? (
              <Chart
                chartType="LineChart"
                width="100%"
                height="400px"
                data={volumeData}
                options={chartOptions(`Total Volume for ${selectedExercise}`, 'Volume (lbs)', volumeData.length)}
              />
            ) : (
              <p className="text-center text-lg font-semibold text-red-600">No data exists for this exercise type.</p>
            )
          ) : (
            <p className="text-center text-lg font-semibold text-red-600">Please select an exercise before loading a chart.</p>
          )
        ) : null}
      </div>

      <div className="mb-8">
        {showAverageWeight ? (
          selectedExercise ? (
            averageWeightData.length > 0 ? (
              <Chart
                chartType="LineChart"
                width="100%"
                height="400px"
                data={averageWeightData}
                options={chartOptions(`Average Weight for ${selectedExercise}`, 'Weight (lbs)', averageWeightData.length)}
              />
            ) : (
              <p className="text-center text-lg font-semibold text-red-600">No data exists for this exercise type.</p>
            )
          ) : (
            <p className="text-center text-lg font-semibold text-red-600">Please select an exercise before loading a chart.</p>
          )
        ) : null}
      </div>

      <div className="bg-white p-4 shadow-lg rounded-md mb-8">
        {showRpe ? (
          rpeData.length > 0 ? (
            <Chart
              chartType="LineChart"
              width="100%"
              height="400px"
              data={rpeData}
              options={chartOptions('RPE over Time', 'RPE', rpeData.length)}
            />
          ) : (
            <p className="text-center text-lg font-semibold text-red-600">No data exists for this exercise type.</p>
          )
        ) : null}
      </div>

      <div>
        {prLogs.length > 0 && (
          <p className="mb-4 text-center">
            Days since last personal record: {daysSinceLastPR !== null ? daysSinceLastPR : 'N/A'}
          </p>
        )}

        {prLogs.length > 0 ? (
          <table className="min-w-full bg-white border border-gray-200 shadow-md rounded">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-3 font-semibold">Date</th>
                <th className="text-left p-3 font-semibold">Achievement</th>
                <th className="text-left p-3 font-semibold">Weight</th>
                <th className="text-left p-3 font-semibold">Reps</th>
                <th className="text-left p-3 font-semibold">Improvement</th>
              </tr>
            </thead>
            <tbody>
              {prLogs.map((log, index) => (
                <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="p-3">{log.date}</td>
                  <td className="p-3">{log.achievement}</td>
                  <td className="p-3">{log.weight}</td>
                  <td className="p-3">{log.reps}</td>
                  <td className="p-3">{log.improvement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-lg font-semibold">No records found for the selected exercise.</p>
        )}
      </div>
    </div>
  );
};

export default WorkoutChartComponent;