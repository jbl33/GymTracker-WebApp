import logo from './logo.svg'; 
import './App.css'; 
import FeaturesSection from './FeaturesSection';
import Footer from './Footer';
 
function FrontPage() { 
  return ( 
    <div> 
        <div>
        <div class="relative font-sans before:absolute before:w-full before:h-full before:inset-0 before:bg-black before:opacity-50 before:z-10">
        <img src="https://img.pikbest.com/ai/illus_our/20230422/ca48cc2ea0c23c387add249759ba3a33.jpg!w700wp" alt="Banner Image" class="absolute inset-0 w-full h-full object-cover filter blur-sm" />
      <div class="min-h-[350px] relative z-50 h-full max-w-6xl mx-auto flex flex-col justify-center items-center text-center text-white p-6">
        <h2 class="sm:text-4xl text-2xl font-bold mb-6">GymTracker v0.3</h2>
        <p class="sm:text-lg text-base text-center text-gray-200">Smarter Workouts, Stronger Results.</p>

        <button
          type="button" onClick={() => window.location.href = '/dashboard'}
          class="mt-12 bg-transparent text-white text-base py-3 px-6 border border-white rounded-lg hover:bg-white hover:text-black transition duration-300">
          Enter Panel
        </button>
      </div>
    </div>
        </div>
<div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto"> 
  <div className="grid md:grid-cols-2 gap-12"> 
    <div className="lg:w-3/4"> 
      <h2 className="text-3xl text-gray-800 font-bold lg:text-4xl dark:text-white"> 
        Track Your Workouts and Visualize Your Progress 
      </h2> 
      <p className="mt-3 text-gray-800 dark:text-neutral-400"> 
        GymTracker makes it easy to monitor your fitness journey by logging workouts and viewing progress over time. 
      </p> 
      <p className="mt-5"> 
        <a className="inline-flex items-center gap-x-1 text-sm text-blue-600 decoration-2 hover:underline focus:outline-none focus:underline font-medium dark:text-blue-500" href="#features"> 
          Discover more about our features 
          <svg className="shrink-0 size-4 transition ease-in-out group-hover:translate-x-1 group-focus:translate-x-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg> 
        </a> 
      </p> 
    </div> 
 
    <div className="space-y-6 lg:space-y-10"> 
      <div className="flex gap-x-5 sm:gap-x-8"> 
        <span className="shrink-0 inline-flex justify-center items-center size-[46px] rounded-full border border-gray-200 bg-white text-gray-800 shadow-sm mx-auto dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-200"> 
          <svg className="shrink-0 size-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> 
        </span> 
        <div className="grow"> 
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-neutral-200"> 
            AI-Powered Workout Generator 
          </h3> 
          <p className="mt-1 text-gray-600 dark:text-neutral-400"> 
            Select your workout type and available equipment to receive a unique, AI-generated workout plan every day. 
          </p> 
        </div> 
      </div> 
      <div className="flex gap-x-5 sm:gap-x-8"> 
        <span className="shrink-0 inline-flex justify-center items-center size-[46px] rounded-full border border-gray-200 bg-white text-gray-800 shadow-sm mx-auto dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-200"> 
          <svg className="shrink-0 size-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg> 
        </span> 
        <div className="grow"> 
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-neutral-200"> 
            Visual Progress Tracking 
          </h3> 
          <p className="mt-1 text-gray-600 dark:text-neutral-400"> 
            Easily visualize your improvements over time with detailed graphs and charts in the GymTracker app. 
          </p> 
        </div> 
      </div> 
 
      <div className="flex gap-x-5 sm:gap-x-8"> 
        <span className="shrink-0 inline-flex justify-center items-center size-[46px] rounded-full border border-gray-200 bg-white text-gray-800 shadow-sm mx-auto dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-200"> 
          <svg className="shrink-0 size-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg> 
        </span> 
        <div className="grow"> 
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-neutral-200"> 
            Easy to Use 
          </h3> 
          <p className="mt-1 text-gray-600 dark:text-neutral-400"> 
            GymTracker is designed with simplicity and affordability in mind, offering intuitive navigation and robust features. 
          </p> 
        </div> 
      </div> 
    </div> 
  </div> 
</div> 
    </div> 
  ); 
} 
 
export default FrontPage;