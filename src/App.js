import logo from './logo.svg';
import './App.css';
import Header from './Header.js';
import FrontPage from './FrontPage.js';
import { Helmet } from 'react-helmet';
import FeaturesSection from './FeaturesSection.js';


function App() {
  return (
    <div className="App">
      <Helmet>
        <title>GymTracker - Elevate your workouts</title>
      </Helmet>
      <Header></Header>
      <FrontPage></FrontPage>
      <FeaturesSection></FeaturesSection>
    </div>
  );
}

export default App;