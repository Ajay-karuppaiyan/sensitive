import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import gmbCategories from '../../components/GmbCategoriesData';

function SearchLeads() {
    const [searchData, setSearchData] = useState({
        type: "",
        latitude: "",
        longitude: "",
        radius: 10
    });
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const navigate = useNavigate();
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [placeDetails, setPlaceDetails] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSearchData((prev) => ({ ...prev, [name]: value }));

        if (name === "type") {
            const filtered = gmbCategories
                .filter(category =>
                    category.toLowerCase().includes(value.toLowerCase())
                )
                .sort();
            setSuggestions(value ? filtered.slice(0, 10) : []);
        }
    };

    const handleSelectSuggestion = (item) => {
        setSearchData((prev) => ({ ...prev, type: item }));
        setSuggestions([]);
    };

    const handleFetchLocation = () => {
        if (navigator.geolocation) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude.toFixed(6);
                    const lng = position.coords.longitude.toFixed(6);
                    setSearchData((prev) => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng
                    }));
                    setLoading(false);
                },
                (error) => {
                    console.error("Error fetching location:", error);
                    setError("Failed to fetch your location. Please check your permissions.");
                    setLoading(false);
                }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
        }
    };

    const fetchPlacesData = async () => {
        try {
            setLoading(true);
            setError(null);

            const { latitude, longitude, radius, type } = searchData;
            const encodedType = encodeURIComponent(type.replace(/\s+/g, '_').toLowerCase());

            const apiUrl = `https://sensitivetechcrm.onrender.com/api/places?latitude=${latitude}&longitude=${longitude}&radius=${radius}&type=${encodedType}`;

            console.log('Fetching from URL:', apiUrl);

            const response = await fetch(apiUrl);
            const data = await response.json();
            console.log('API Response Data:', data);

            if (data.status === "OK") {
                setResults(data.results || []);
                setShowResults(true);
            } else {
                setError(`API Error: ${data.status || 'Unknown error'}`);
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching places:', err);
            setError("Failed to fetch data from API. Please check console for details.");
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!searchData.latitude || !searchData.longitude) {
            setError("Latitude and longitude are required.");
            return;
        }
        if (!searchData.type) {
            setError("Search type is required.");
            return;
        }
        fetchPlacesData();
    };

    const handleNewSearch = () => {
        setShowResults(false);
        setError(null);
        setResults([]);
    };
    const handleViewPlace = async (place) => {
        try {
            setSelectedPlace(place);
            setLoadingDetails(true);
            setShowPopup(true);
            const response = await fetch(`https://sensitivetechcrm.onrender.com/api/place-details/${place.place_id}`);
            console.log(response)
            const data = await response.json();

            if (data && data.result) {
                setPlaceDetails(data.result);
            } else {
                setError("Failed to fetch place details");
            }
        } catch (err) {
            console.error("Error fetching place details:", err);
            setError("Error loading place details");
        } finally {
            setLoadingDetails(false);
        }
    };
    const closePopup = () => {
        setShowPopup(false);
        setPlaceDetails(null);
        setSelectedPlace(null);
    };

    const formatType = (types) => {
        if (!types || types.length === 0) return "N/A";
        return types[0].split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const formatCoordinate = (coord) => {
        if (typeof coord === 'number') {
            return coord.toFixed(6);
        }
        return coord;
    };

    if (loading) {
        return (
            <div className="container mx-auto p-8 mt-20 text-center">
                <p className="text-xl">Loading...</p>
                <div className="mt-4 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 mt-12">
            {!showResults ? (
                <>
                    <h2 className="text-4xl font-bold mb-6 text-center mt-20">Location Search</h2>
                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-lg bg-gray-50 shadow-lg border border-gray-300"
                    >
                        {error && (
                            <div className="col-span-2 text-red-600 bg-red-50 p-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="relative flex flex-col col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium pb-2">Search Type:</label>
                            <input
                                type="text"
                                name="type"
                                value={searchData.type}
                                onChange={handleChange}
                                placeholder="e.g. restaurant, hospital, atm"
                                className="border border-gray-300 p-3 rounded-lg"
                                required
                            />
                            {suggestions.length > 0 && (
                                <ul className="absolute z-10 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-md w-full top-20">
                                    {suggestions.map((item, index) => (
                                        <li
                                            key={index}
                                            onClick={() => handleSelectSuggestion(item)}
                                            className="p-2 hover:bg-blue-100 cursor-pointer"
                                        >
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <label className="block text-sm font-medium pb-2">Latitude:</label>
                            <input
                                type="text"
                                name="latitude"
                                value={searchData.latitude}
                                onChange={handleChange}
                                placeholder="e.g. 12.909694"
                                className="border border-gray-300 p-3 rounded-lg"
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="block text-sm font-medium pb-2">Longitude:</label>
                            <input
                                type="text"
                                name="longitude"
                                value={searchData.longitude}
                                onChange={handleChange}
                                placeholder="e.g. 77.573394"
                                className="border border-gray-300 p-3 rounded-lg"
                                required
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={handleFetchLocation}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors w-full"
                            >
                                Fetch My Location
                            </button>
                        </div>

                        <div className="col-span-2 flex flex-col">
                            <label className="block text-sm font-medium pb-2">
                                Radius: {searchData.radius} km
                            </label>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{ width: `${(searchData.radius / 100) * 100}%` }}
                                ></div>
                            </div>
                            <input
                                type="range"
                                name="radius"
                                min="1"
                                max="100"
                                value={searchData.radius}
                                onChange={handleChange}
                                className="w-full"
                            />
                        </div>

                        <div className="col-span-2 text-center">
                            <button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-colors"
                            >
                                Search
                            </button>
                        </div>
                    </form>
                </>
            ) : (
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold">Search Results</h2>
                        <button
                            onClick={handleNewSearch}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
                        >
                            New Search
                        </button>
                    </div>

                    {results.length === 0 ? (
                        <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xl text-gray-600">No results found. Please try different search criteria.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto shadow-lg rounded-lg">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Address</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Type</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Rating</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Location</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {results.map((place, index) => (
                                        <tr key={place.place_id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                            <td className="py-4 px-4 text-sm font-medium text-gray-900">{place.name || "N/A"}</td>
                                            <td className="py-4 px-4 text-sm text-gray-500">{place.vicinity || "N/A"}</td>
                                            <td className="py-4 px-4 text-sm text-gray-500">{formatType(place.types || [])}</td>
                                            <td className="py-4 px-4 text-sm text-gray-500">
                                                {place.rating ? (
                                                    <div className="flex items-center">
                                                        <span className="mr-1">{place.rating}</span>
                                                        <span className="text-yellow-500">★</span>
                                                        <span className="ml-1 text-xs text-gray-400">({place.user_ratings_total || 0})</span>
                                                    </div>
                                                ) : (
                                                    "N/A"
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-sm">
                                                {place.business_status === "OPERATIONAL" ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Open
                                                    </span>
                                                ) : place.business_status ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                        Closed
                                                    </span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                        N/A
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-gray-500">
                                                {place.geometry?.location ? (
                                                    `${formatCoordinate(place.geometry.location.lat)}, ${formatCoordinate(place.geometry.location.lng)}`
                                                ) : "N/A"}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-gray-500">
                                                <button
                                                    onClick={() => handleViewPlace(place)}
                                                    className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                                    title="View details"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Place Details Popup */}
            {showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold">
                                {selectedPlace?.name || "Place Details"}
                            </h3>
                            <button
                                onClick={closePopup}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            {loadingDetails ? (
                                <div className="flex justify-center items-center h-40">
                                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : placeDetails ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div>
                                        <div className="mb-6">
                                            <h4 className="font-bold text-lg mb-2">Basic Information</h4>
                                            <p className="text-gray-700"><span className="font-medium">Name:</span> {placeDetails.name}</p>
                                            <p className="text-gray-700"><span className="font-medium">Address:</span> {placeDetails.formatted_address}</p>
                                            {placeDetails.formatted_phone_number && (
                                                <p className="text-gray-700">
                                                    <span className="font-medium">Phone:</span> {placeDetails.formatted_phone_number}
                                                </p>
                                            )}
                                            {placeDetails.website && (
                                                <p className="text-gray-700">
                                                    <span className="font-medium">Website:</span>{" "}
                                                    <a href={placeDetails.website} target="_blank" rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline">
                                                        {placeDetails.website}
                                                    </a>
                                                </p>
                                            )}
                                        </div>

                                        {placeDetails.opening_hours && (
                                            <div className="mb-6">
                                                <h4 className="font-bold text-lg mb-2">Opening Hours</h4>
                                                <ul className="text-sm">
                                                    {placeDetails.opening_hours.weekday_text.map((day, index) => (
                                                        <li key={index} className="mb-1">{day}</li>
                                                    ))}
                                                </ul>
                                                <p className="mt-2 text-sm">
                                                    <span className={`px-2 py-1 rounded ${placeDetails.opening_hours.open_now
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                        }`}>
                                                        {placeDetails.opening_hours.open_now ? "Open now" : "Closed now"}
                                                    </span>
                                                </p>
                                            </div>
                                        )}

                                        {placeDetails.editorial_summary && (
                                            <div className="mb-6">
                                                <h4 className="font-bold text-lg mb-2">Summary</h4>
                                                <p className="text-gray-700">{placeDetails.editorial_summary.overview}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Column */}
                                    <div>
                                        {placeDetails.photos && placeDetails.photos.length > 0 && (
                                            <div className="mb-6">
                                                <h4 className="font-bold text-lg mb-2">Photos</h4>
                                                <div className="grid grid-cols-2 gap-2 overflow-auto max-h-80">
                                                    {placeDetails.photos.slice(0, 6).map((photo, index) => (
                                                        <div
                                                            key={index}
                                                            className="bg-gray-200 h-32 rounded overflow-hidden"
                                                        >
                                                            <img
                                                                src={`/api/placeholder/400/320`}
                                                                alt={`${placeDetails.name} - Photo ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {placeDetails.reviews && Array.isArray(placeDetails.reviews) && placeDetails.reviews.length > 0 && (
                                            <div>
                                                <h4 className="font-bold text-lg mb-2">Reviews</h4>
                                                <div className="space-y-4 max-h-80 overflow-y-auto">
                                                    {placeDetails.reviews.map((review, index) => {
                                                        // Safety check to ensure review is an object
                                                        if (!review || typeof review !== 'object') {
                                                            return null;
                                                        }

                                                        return (
                                                            <div key={index} className="border-b pb-4">
                                                                <div className="flex items-center mb-2">
                                                                    <div className="mr-3 h-8 w-8 bg-gray-300 rounded-full overflow-hidden">
                                                                        <img
                                                                            src={review.profile_photo_url || `/api/placeholder/40/40`}
                                                                            alt={review.author_name || 'Reviewer'}
                                                                            className="h-full w-full object-cover"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium">{review.author_name || 'Anonymous'}</p>
                                                                        <div className="flex items-center">
                                                                            <div className="flex text-yellow-500">
                                                                                {[...Array(5)].map((_, i) => (
                                                                                    <span key={i}>
                                                                                        {i < (review.rating || 0) ? "★" : "☆"}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                            <span className="ml-2 text-sm text-gray-500">
                                                                                {review.relative_time_description || 'No date'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <p className="text-gray-700 text-sm">{review.text || 'No review text'}</p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-8">
                                    <p className="text-red-500">Failed to load place details. Please try again.</p>
                                </div>
                            )}
                        </div>

                        <div className="sticky bottom-0 bg-white p-4 border-t">
                            <button
                                onClick={closePopup}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors w-full"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SearchLeads;
