const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

let cachedUpdates = []; // 👈 نخزن آخر أخبار هنا

app.get('/healthz', (req, res) => res.send('OK'));

app.get('/aljazeera-live', async (req, res) => {
  try {
    const { data } = await axios.get('https://www.aljazeera.net/news/liveblog');
    const $ = cheerio.load(data);

    const updates = [];
    $('.live-blog-post').each((i, el) => {
      const title = $(el).find('.post-title').text().trim();
      const time = $(el).find('.post-time').text().trim();
      const content = $(el).find('.post-body').text().trim();
      if (title) updates.push({ title, time, content });
    });

    if (updates.length > 0) {
      // لو فيه أخبار جديدة نخزنها
      cachedUpdates = updates.slice(0, 5);
    }

    // نرجع آخر نسخة سواء جديدة أو من الكاش
    res.json({ updatedAt: new Date(), updates: cachedUpdates });
  } catch (err) {
    // في حالة خطأ نرجع الكاش بدل ما نرجع خطأ
    res.json({ updatedAt: new Date(), updates: cachedUpdates });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Proxy يعمل على المنفذ ${PORT}`));
