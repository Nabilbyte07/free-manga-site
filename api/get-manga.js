const axios = require('axios');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { action, query, mangaId, chapterId } = req.query;

  try {
    // 1. Search Manga
    if (action === 'search') {
      const response = await axios.get('https://api.mangadex.org/manga', {
        params: {
          title: query || '',
          limit: 12,
          'includes[]': ['cover_art']
        }
      });
      return res.status(200).json(response.data);
    }

    // 2. Get Chapter Pages
    if (action === 'chapter' && chapterId) {
      const response = await axios.get(`https://api.mangadex.org/at-home/server/${chapterId}`);
      const host = response.data.baseUrl;
      const hash = response.data.chapter.hash;
      const pageFiles = response.data.chapter.data;

      // Construct direct image URLs
      const imageUrls = pageFiles.map(file => `${host}/data/${hash}/${file}`);
      return res.status(200).json({ pages: imageUrls });
    }

    return res.status(400).json({ error: 'Invalid action or parameters' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
