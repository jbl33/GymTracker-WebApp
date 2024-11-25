import React, { useState } from 'react';
import AccountInformation from './AccountInformation';
import PreviousWorkoutTable from './PreviousWorkoutTable';
import LogWorkout from './LogWorkout';
import WorkoutChart from './NumberOfWorkoutsChart';
import WorkoutCalendar from './WorkoutCalendar';
import WorkoutForm from './WorkoutForm';
import { Helmet } from 'react-helmet';
import UpdateWorkout from './UpdateWorkout';
import ChangePassword from './ChangePassword';
import WorkoutChartComponent from './WorkoutChartComponent';

function DashboardLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex h-screen overflow-hidden">
  <div className="bg-gray-800 w-64 text-white p-4 h-full overflow-y-auto flex flex-col">
    <h1 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-orange-500 text-white rounded-md px-4 py-2">
      GymTracker v0.3
    </h1>
    <ul className="flex-grow">
      <li className="mb-2">
        <button
          className={`block p-2 hover:bg-gray-700 ${
            activeTab === 'dashboard' ? 'bg-gray-900 text-white' : ''
          }`}
          onClick={() => handleTabClick('dashboard')}
        >
          Dashboard
        </button>
      </li>
      <li className="mb-2">
        <button
          className={`block p-2 hover:bg-gray-700 ${
            activeTab === 'workout' ? 'bg-gray-900 text-white' : ''
          }`}
          onClick={() => handleTabClick('workout')}
        >
          Log a Workout
        </button>
      </li>
      <li className="mb-2">
        <button
          className={`block p-2 hover:bg-gray-700 ${
            activeTab === 'update-workout' ? 'bg-gray-900 text-white' : ''
          }`}
          onClick={() => handleTabClick('update-workout')}
        >
          Update a Workout
        </button>
      </li>
      <li className="mb-2">
        <button
          className={`block p-2 hover:bg-gray-700 ${
            activeTab === 'generateWorkout' ? 'bg-gray-900 text-white' : ''
          }`}
          onClick={() => handleTabClick('generateWorkout')}
        >
          Generate a Workout (AI)
        </button>
      </li>
      <li className="mb-2">
        <button
          className={`block p-2 hover:bg-gray-700 ${
            activeTab === 'analytics' ? 'bg-gray-900 text-white' : ''
          }`}
          onClick={() => handleTabClick('analytics')}
        >
          Analytics
        </button>
      </li>
      <li className="mb-2">
        <button
          className={`block p-2 hover:bg-gray-700 ${
            activeTab === 'settings' ? 'bg-gray-900 text-white' : ''
          }`}
          onClick={() => handleTabClick('settings')}
        >
          Settings
        </button>
      </li>
    </ul>
    <div className="mt-auto">
    {/* Main Content Area */}
  </div>
</div>


      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <>
            <Helmet>
              <title>Dashboard - GymTracker</title>
            </Helmet>
            <PreviousWorkoutTable />
          </>
        )}
        {activeTab === 'analytics' && (
          <>
          <Helmet>
        <title>Analytics - GymTracker</title>
          </Helmet>
            <WorkoutChart></WorkoutChart>
            <hr></hr>
            <WorkoutCalendar></WorkoutCalendar>
            <WorkoutChartComponent></WorkoutChartComponent>
          </>
        )}
        {activeTab === 'generateWorkout' && (
          <>
          <Helmet>
          <title>Generate a Workout Plan - GymTracker </title>
          </Helmet>
            <WorkoutForm> </WorkoutForm>
          </>
        )}
        {activeTab === 'workout' && (
          <>
          <Helmet>
        <title>Log a Workout - GymTracker</title>
          </Helmet>
            <LogWorkout> </LogWorkout>
          </>
        )}
        {activeTab === 'update-workout' && (
          <>
          <Helmet>
        <title>Update a Workout - GymTracker</title>
          </Helmet>
            <UpdateWorkout></UpdateWorkout>
          </>
        )}
        {activeTab === 'settings' && (
          <>
          <Helmet>
        <title>Settings - GymTracker</title>
          </Helmet>
          <AccountInformation />
            <ChangePassword></ChangePassword>
          </>
        )}
      </div>
    </div>
  );
}

export default DashboardLayout;