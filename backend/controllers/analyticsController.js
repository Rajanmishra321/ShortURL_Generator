// controllers/analyticsController.js
import Click from '../models/Click.js';

export const getLinkAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const { range } = req.query;

    let dateFilter = {};
    if (range === '1d') {
      dateFilter = { clickedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } };
    } else if (range === '7d') {
      dateFilter = { clickedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (range === '30d') {
      dateFilter = { clickedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
    }

    const clicks = await Click.find({
      shortLink: id,
      ...dateFilter
    });

    res.json({ clicks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};