const axios = require('axios');

const getPlaceDetails = async (req, res) => {
  const { placeId } = req.params;
  const apiKey = process.env.GOOGLE_API_KEY;

  try {
    const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=ALL&key=${apiKey}`;
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching place details:', error);
    res.status(500).json({ error: 'Failed to fetch place details' });
  }
};

module.exports = { getPlaceDetails };
