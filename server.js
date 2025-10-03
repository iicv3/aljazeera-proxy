const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

// مسار صحي عشان Render يتأكد أن السيرفر شغال
app.get('/healthz', (req, res) => res.send('OK'));

app.get('/aljazeera-live', async (req, res) => {
  try {
    const { data } = await axios.get('https://www.aljazeera.net/news/liveblog');
    const $ = cheerio.load(data);

    const updates = [];
    $('.live-blog-post').each((i, el) => {
      const title = $(el).find('.post-title').text().trim();
      const time = $(el).find('.post-time').text().trim();
      if (title) updates.push({ title, time });
    });

    res.json({ updatedAt: new Date(), updates });
  } catch (err) {
    res.status(500).json({ error: 'فشل في جلب البيانات' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Proxy يعمل على المنفذ ${PORT}`));
