import React from 'react';

const FeaturesSection = () => {
  const features = [
    {
      title: 'Workout Logging',
      description: 'GymTracker makes it easy and convenient to log your workouts. Users are always able to view their previous workouts and track their progress over time.',
    },
    {
        title: 'Weight Tracking',
        description: 'GymTracker offers a weight tracking feature that allows users to log their weight and view their progress over time.',
    },
    {
      title: 'AI-Powered Workout Generator',
      description: 'Harness the power of AI to generate a unique workout plan every day. Our AI considers your workout type and available equipment to create a personalized plan.',
    },
    {
      title: 'Templates and Custom Workouts',
      description: 'GymTracker offers the ability for users to save and share their workout plans with others. You can also create custom workouts tailored to your fitness goals and preferences.',
    },
    {
        title: 'RPE Logging',
        description: 'Rate of Perceived Exertion (RPE) is a valuable tool for tracking workout intensity. GymTracker allows users to log their RPE for each workout, providing valuable insights into their training.',
    }
  ];

  return (
    <section className="bg-gray-100 py-16">
      <div id="features" className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">Our Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;