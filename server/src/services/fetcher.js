import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import logger from '../utils/logger.js';

const fetchFeed = async (feedUrl, feedType = null) => {
    try {
        const response = await axios.get(feedUrl);
        const data = response.data;
        
        // Get Content-Type from response headers
        const contentType = response.headers['content-type'] || '';
        
        // Determine if data is XML based on:
        // 1. Explicit type parameter
        // 2. Content-Type header
        // 3. URL extension
        const isXML = feedType === 'xml' || 
                     contentType.includes('xml') || 
                     contentType.includes('rss') ||
                     feedUrl.endsWith('.xml') || 
                     feedUrl.includes('xml') ||
                     feedUrl.includes('rss');
        
        if (isXML) {
            const parser = new XMLParser({
                ignoreAttributes: false,
                attributeNamePrefix: '@_'
            });
            const jsonData = parser.parse(data);
            return jsonData;
        }
        
        // Already JSON, return as-is
        return data;
    } catch (error) {
        logger.error(`Error fetching feed ${feedUrl}:`, error.message);
        throw error;
    }
};

// Helper function to extract items from RSS/XML structure
// Handles different RSS/XML formats
const extractItems = (parsedData) => {
    // RSS 2.0 format: rss.channel.item[]
    if (parsedData.rss?.channel?.item) {
        return Array.isArray(parsedData.rss.channel.item) 
            ? parsedData.rss.channel.item 
            : [parsedData.rss.channel.item];
    }
    
    // Atom format: feed.entry[]
    if (parsedData.feed?.entry) {
        return Array.isArray(parsedData.feed.entry) 
            ? parsedData.feed.entry 
            : [parsedData.feed.entry];
    }
    
    // Direct channel.item[] format
    if (parsedData.channel?.item) {
        return Array.isArray(parsedData.channel.item) 
            ? parsedData.channel.item 
            : [parsedData.channel.item];
    }
    
    // Direct item[] array
    if (Array.isArray(parsedData.item)) {
        return parsedData.item;
    }
    
    // Single item object
    if (parsedData.item) {
        return [parsedData.item];
    }
    
    // If it's already an array, return it
    if (Array.isArray(parsedData)) {
        return parsedData;
    }
    
    // If no items found, return empty array
    return [];
};

export { extractItems };
export default fetchFeed;