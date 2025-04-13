import ShortLink from '../models/ShortLink.js';
import { nanoid } from 'nanoid';
import Click from '../models/Click.js';
import geoip from 'geoip-lite';
import {UAParser} from 'ua-parser-js';

// Create short link
export const createShortLink = async (req, res) => {
  try {
    const { originalUrl } = req.body;
    
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

    const shortLink = await ShortLink.create({
      originalUrl,
      shortCode: nanoid(6),
      user: req.user._id // From auth middleware
    });

    res.status(201).json({
      originalUrl: shortLink.originalUrl,
      shortUrl: `http://localhost:5000/${shortLink.shortCode}`,
      clicks: shortLink.clicks
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Redirect to original URL
export const redirect = async (req, res) => {
    try {
      const { shortCode } = req.params;
      const shortLink = await ShortLink.findOne({ shortCode });
      
      if (!shortLink) return res.status(404).send('Link not found');
  
      // Async analytics (fire-and-forget)
      trackAnalytics(req, shortLink._id);
  
      res.redirect(shortLink.originalUrl);
    } catch (error) {
      res.status(500).send('Server error');
    }
  };
  
  // Separate function for cleaner code
  const trackAnalytics = async (req, shortLinkId) => {
    try {
      const ip = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');
      const parser = new UAParser(userAgent);
      
      await Click.create({
        shortLink: shortLinkId,
        ipAddress: ip,
        country: geoip.lookup(ip)?.country,
        deviceType: getDeviceType(parser),
        userAgent: userAgent
      });
      
      // Still increment total clicks in ShortLink
      await ShortLink.updateOne(
        { _id: shortLinkId },
        { $inc: { clicks: 1 } }
      );
    } catch (err) {
      console.error('Analytics error:', err);
    }
  };
  
  // Helper function
  const getDeviceType = (parser) => {
    const device = parser.getDevice();
    if (!device.type) return 'desktop';
    return device.type;
  };