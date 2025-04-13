import Click from '../models/Click.js';
import ShortLink from '../models/ShortLink.js';
import geoip from 'geoip-lite';
import {UAParser} from 'ua-parser-js';

// Track click analytics
export const trackClick = async (req, shortLinkId) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const referrer = req.headers['referer'];
  
  const parser = new UAParser(userAgent);
  const geo = geoip.lookup(ip);

  await Click.create({
    shortLink: shortLinkId,
    referrer,
    ipAddress: ip,
    country: geo?.country,
    city: geo?.city,
    deviceType: getDeviceType(parser),
    browser: parser.getBrowser().name,
    os: parser.getOS().name
  });
};

// Get analytics for a specific link
export const getLinkAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const { range = '7d' } = req.query;

    // Calculate date range
    let startDate;
    switch (range) {
      case '1d': startDate = new Date(Date.now() - 24 * 60 * 60 * 1000); break;
      case '7d': startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); break;
      case '30d': startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); break;
      default: startDate = null; // All time
    }

    const filter = { shortLink: id };
    if (startDate) filter.clickedAt = { $gte: startDate };

    const [clicks, link] = await Promise.all([
      Click.find(filter),
      ShortLink.findById(id)
    ]);

    // Process data for charts
    const dailyClicks = processDailyClicks(clicks);
    const deviceData = processDeviceData(clicks);
    const browserData = processBrowserData(clicks);
    const locationData = processLocationData(clicks);

    res.json({
      totalClicks: clicks.length,
      dailyClicks,
      devices: deviceData,
      browsers: browserData,
      locations: locationData,
      linkDetails: {
        originalUrl: link.originalUrl,
        shortUrl: link.shortUrl,
        createdAt: link.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper functions
function processDailyClicks(clicks) {
  const dailyData = {};
  clicks.forEach(click => {
    const date = click.clickedAt.toISOString().split('T')[0];
    dailyData[date] = (dailyData[date] || 0) + 1;
  });
  return Object.entries(dailyData).map(([date, count]) => ({ date, clicks: count }));
}

function processDeviceData(clicks) {
  const deviceCounts = {};
  clicks.forEach(click => {
    deviceCounts[click.deviceType] = (deviceCounts[click.deviceType] || 0) + 1;
  });
  return Object.entries(deviceCounts).map(([device, count]) => ({ device, count }));
}

function processBrowserData(clicks) {
  const browserCounts = {};
  clicks.forEach(click => {
    browserCounts[click.browser] = (browserCounts[click.browser] || 0) + 1;
  });
  return Object.entries(browserCounts).map(([browser, count]) => ({ browser, count }));
}

function processLocationData(clicks) {
  const locationCounts = {};
  clicks.forEach(click => {
    if (click.country) {
      const key = click.city ? `${click.city}, ${click.country}` : click.country;
      locationCounts[key] = (locationCounts[key] || 0) + 1;
    }
  });
  return Object.entries(locationCounts).map(([location, count]) => ({ location, count }));
}

function getDeviceType(parser) {
  const device = parser.getDevice();
  if (!device.type) return 'desktop';
  return device.type;
}