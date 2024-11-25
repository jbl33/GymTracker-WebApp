import './App.css';
import AccountInformation from './AccountInformation.js';
import PreviousWorkoutTable from './PreviousWorkoutTable.js';

function Panel() {
  return (
    <div className="Panel">
      <AccountInformation> </AccountInformation>
      <PreviousWorkoutTable></PreviousWorkoutTable>
    </div>
  );
}

export default Panel;