import { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function Home() {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    travelClass: 'ECONOMY'
  });
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const airports = [
    { code: 'LAX', name: 'Los Angeles' },
    { code: 'JFK', name: 'New York' },
    { code: 'ORD', name: 'Chicago' },
    { code: 'DFW', name: 'Dallas' },
    { code: 'ATL', name: 'Atlanta' },
    { code: 'SFO', name: 'San Francisco' },
    { code: 'MIA', name: 'Miami' },
    { code: 'SEA', name: 'Seattle' },
    { code: 'BOS', name: 'Boston' },
    { code: 'LAS', name: 'Las Vegas' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.from === formData.to) {
      setError('Please select different departure and destination airports');
      return;
    }

    setLoading(true);
    setError('');
    setFlights([]);

    try {
      const response = await axios.post(`${API_URL}/search`, formData);
      setFlights(response.data || []);
      
      if (!response.data || response.data.length === 0) {
        setError('No flights found for this route');
      }
    } catch (err) {
      setError('Error searching flights. Make sure your Go backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          ✈️ Flight Price Tracker
        </h1>
        
        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">From</label>
                <select
                  value={formData.from}
                  onChange={(e) => setFormData({...formData, from: e.target.value})}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Select departure</option>
                  {airports.map(airport => (
                    <option key={airport.code} value={airport.code}>
                      {airport.name} ({airport.code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">To</label>
                <select
                  value={formData.to}
                  onChange={(e) => setFormData({...formData, to: e.target.value})}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Select destination</option>
                  {airports.map(airport => (
                    <option key={airport.code} value={airport.code}>
                      {airport.name} ({airport.code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Travel Class</label>
                <select
                  value={formData.travelClass}
                  onChange={(e) => setFormData({...formData, travelClass: e.target.value})}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="ECONOMY">Economy</option>
                  <option value="PREMIUM_ECONOMY">Premium Economy</option>
                  <option value="BUSINESS">Business</option>
                  <option value="FIRST">First</option>
                </select>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? 'Searching...' : 'Search Flights'}
            </button>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center text-white text-xl mb-8">
            ✈️ Searching for flights...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flights.map((flight, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="text-3xl font-bold text-blue-600 mb-4">
                ${flight.price}
              </div>
              
              <div className="flex justify-between items-center mb-4 pb-4 border-b">
                <div>
                  <div className="font-semibold text-gray-800">{flight.departure_time}</div>
                  <div className="text-sm text-gray-600">Departure</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-800">{flight.arrival_time}</div>
                  <div className="text-sm text-gray-600">Arrival</div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">Duration: {flight.duration}</div>
                <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                  {flight.airline} - {flight.flight_number}
                </div>
              </div>
              
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                flight.stops === 'Non-stop' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {flight.stops}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}