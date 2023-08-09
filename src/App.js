import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './App.css';

function App() {
  const [name, setName] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef();

  // Fetches data from the API
  const fetchData = async () => {
  setLoading(true);
  setError(null);

  try {
    const nationalizeRes = await fetch(`https://api.nationalize.io?name=${name}`);

    if (!nationalizeRes.ok) {
      throw new Error('Failed to fetch nationality data.');
    }
    const nationalizeData = await nationalizeRes.json();

    const countryCode = nationalizeData.country && nationalizeData.country.length > 0 
                        ? nationalizeData.country[0].country_id 
                        : null;

    let countryName = 'Unknown';
    if (countryCode) {
      const countryRes = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
      const countryData = await countryRes.json();
      if (countryData && countryData[0] && countryData[0].name && countryData[0].name.common) {
        countryName = countryData[0].name.common;
      } else {
        countryName = countryCode; // Use the country code if name isn't available.
      }
    }

    const genderizeRes = await fetch(`https://api.genderize.io?name=${name}`);

    if (!genderizeRes.ok) {
        throw new Error('Failed to fetch nationality data.');
    }

    const genderizeData = await genderizeRes.json();
    const gender = genderizeData.gender ? capitalize(genderizeData.gender) : 'Unknown';

    const agifyRes = await fetch(`https://api.agify.io?name=${name}`);

    if (!agifyRes.ok) {
      throw new Error('Failed to fetch nationality data.');
    }

    const agifyData = await agifyRes.json();
    const age = agifyData.age ? agifyData.age : 'Unknown';

    setResult({
      nationality: countryName,
      gender: gender,
      age: age,
    });
    } catch (err) {
      console.error("Error detail:", err.message);

      // Display a more specific error message based on the error type
      if (err.message.includes('Failed to fetch')) {
        setError('There was an issue connecting to the server. Please try again later.');
      } else if (err.message.includes('some other identifiable error type')) {
        setError('Specific error message for that error type.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Display a toast message when the data is fetched successfully or an error occurs
  useEffect(() => {
    if (!loading && result) {
      toast.success('Data fetched successfully!', {
        position: toast.POSITION.BOTTOM_RIGHT,
        autoClose: 3000,  // closes after 3 seconds
        onClose: () => inputRef.current.focus()  // Refocuses the input after the toast is shown
      });
    } else if (error) {
      toast.error('An error occurred while fetching the data.', {
        position: toast.POSITION.BOTTOM_RIGHT,
        autoClose: 5000,  // closes after 5 seconds
        onClose: () => inputRef.current.focus()  // Refocuses the input after the toast is shown
      });
    }
  }, [loading, result, error]);

  // Auto-focus the input field when the component mounts
  useEffect(() => {
    // Auto-focus the input field when the component mounts
    inputRef.current.focus();
  }, []);

  // Capitalizes the first letter of a string
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return (
    <div  className="app-container">
      <ToastContainer />
      <header>
        <h1>Name Predictor</h1>
        <p>Enter a name to predict nationality, gender, and age.</p>
      </header>

      {/* Form to enter a name */}
      <form onSubmit={e => { e.preventDefault(); fetchData(); }}>
        <input 
        ref={inputRef} 
        value={name} onChange={e => 
        setName(e.target.value)}
        aria-label="Enter a name to predict nationality, gender, and age" 
        />
        <button 
        type="submit" 
        disabled={loading}
        aria-label="Click to predict nationality, gender, and age based on the provided name"
        >
          Predict
        </button>
      </form>

      {/* Display the result if there is one */}
      {loading && !error && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {result && !loading && !error && (
        <div className="result-container">
          <p>Nationality: {result.nationality}</p>
          <p>Gender: {result.gender}</p>
          <p>Age: {result.age}</p>
        </div>
      )}
      <footer>
        <p className="footer-text">Made by Arnold Twala</p>
      </footer>
    </div>
  );
}

export default App;
