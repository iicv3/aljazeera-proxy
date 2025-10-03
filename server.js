app.get('/aljazeera-live', async (req, res) => {
  try {
    const { data } = await axios.get('https://www.aljazeera.net/news/liveblog');
    const $ = cheerio.load(data);

    const updates = [];
    $('.live-blog-post').each((i, el) => {
      const title = $(el).find('.post-title').text().trim();
      const time = $(el).find('.post-time').text().trim();
      const content = $(el).find('.post-body').text().trim(); // 👈 النص/العنوان الفرعي

      if (title) updates.push({ title, time, content });
    });

    res.json({ updatedAt: new Date(), updates });
  } catch (err) {
    res.status(500).json({ error: 'فشل في جلب البيانات' });
  }
});
