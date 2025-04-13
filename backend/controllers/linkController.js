import ShortLink from '../models/ShortLink.js';
import { nanoid } from 'nanoid';
import Click from '../models/Click.js';
import geoip from 'geoip-lite';
import {UAParser} from 'ua-parser-js';
import { trackClick } from './analyticsController.js';

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
      shortUrl: `https://shorturl-generator-xifp.onrender.com/${shortLink.shortCode}`,
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
      trackClick(req, shortLink._id).catch(console.error);
  
      res.redirect(shortLink.originalUrl);
    } catch (error) {
      res.status(500).send('Server error');
    }
  };

  export const getLinks = async (req, res) => {
    try {
      const links = await ShortLink.find({ user: req.user._id });
      res.json(links);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  