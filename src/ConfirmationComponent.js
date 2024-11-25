import React from 'react';

function ConfirmationComponent({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-10">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Confirm Submission</h2>
        <p className="mb-4">Are you sure you want to submit this workout?</p>
        <div className="flex justify-end">
          <button onClick={onConfirm} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Confirm
          </button>
          <button onClick={onCancel} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationComponent;