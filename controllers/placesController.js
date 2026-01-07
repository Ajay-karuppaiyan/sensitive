const axios = require('axios');

const getNearbyPlaces = async (req, res) => {
  const { latitude, longitude, radius, type } = req.query;

  if (!latitude || !longitude || !radius || !type) {
    return res.status(400).json({ message: 'Missing required query parameters' });
  }

  const apiKey = process.env.GOOGLE_API_KEY; // Make sure this prints value
  console.log("GOOGLE API KEY:", apiKey);

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius * 1000}&type=${type}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching nearby places:', error.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = { getNearbyPlaces };
