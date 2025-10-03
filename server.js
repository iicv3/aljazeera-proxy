const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

let cachedUpdates = []; // نخزن آخر أخبار هنا
let lastFetchTime = null;

// مسار صحي
app.get('/healthz', (req, res) => res.send('OK'));

// جلب الأخبار
app.get('/aljazeera-live', async (req, res) => {
  try {
    const { data } = await axios.get('https://www.aljazeera.net/news/liveblog', {
      timeout: 10000, // 10 ثواني مهلة
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AljazeeraProxy/1.0)'
      }
    });

    const $ = cheerio.load(data);
    const updates = [];

    $('.live-blog-post').each((i, el) => {
      const title = $(el).find('.post-title').text().trim();
      const time = $(el).find('.post-time').text().trim();
      const content = $(el).find('.post-body').text().trim();

      if (title) {
        updates.push({
          title,
          time: time || "بدون وقت",
          content: content || "—"
        });
      }
    });

    if (updates.length > 0) {
      cachedUpdates = updates.slice(0, 5); // نخزن آخر 5
      lastFetchTime = new Date();
    }

    res.json({
      updatedAt: new Date(),
      source: "Al Jazeera Live",
      lastFetchTime,
      updates: cachedUpdates
    });

  } catch (err) {
    console.error("❌ خطأ في جلب الأخبار:", err.message);

    // fallback: نرجع الكاش بدل ما نرجع خطأ
    res.json({
      updatedAt: new Date(),
      source: "Cache",
      lastFetchTime,
      updates: cachedUpdates
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Proxy يعمل على المنفذ ${PORT}`));
