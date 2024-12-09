import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';
import AccountInformation from './AccountInformation';
import LogWorkout from './LogWorkout';
import Panel from './Panel';
import WorkoutChart from './NumberOfWorkoutsChart';
import Dashboard from './Dashboard';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
     <Router>
     <Routes>
       <Route path="/" element={<App />} />  {/* Home page */}
       <Route path='/login' element={<LoginForm />} />
       <Route path='/register' element={<RegistrationForm />} />
       <Route path='/account' element={<AccountInformation />} />
       <Route path='/workout' element={<LogWorkout />} />
       <Route path='/dashboard' element={<Dashboard />} />
     </Routes>
   </Router>
);