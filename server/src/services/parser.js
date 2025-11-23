import logger from '../utils/logger.js';

const parseJob = (rawJob, feedName) => {
    try {
        // Normalize externalId (try multiple possible field names)
        // RSS uses 'guid', JSON APIs use 'id' or 'jobId'
        const externalId = rawJob.id || 
                          rawJob.jobId || 
                          rawJob.externalId || 
                          rawJob.guid || 
                          (rawJob.guid && typeof rawJob.guid === 'object' ? rawJob.guid['#text'] : null) || // RSS guid can be object
                          String(Date.now() + Math.random());
        
        // Normalize title
        const title = rawJob.title || 
                     rawJob.jobTitle || 
                     rawJob.name || 
                     rawJob.position || 
                     'Untitled Position';
        
        // Normalize company
        // RSS feeds might not have company, try to extract from description or use default
        const company = rawJob.company || 
                       rawJob.companyName || 
                       rawJob.employer || 
                       rawJob.organization ||
                       rawJob['dc:creator'] || // Dublin Core creator field
                       'Unknown Company';
        
        // Normalize URL
        // RSS uses 'link', JSON APIs use 'url' or 'jobUrl'
        const url = rawJob.url || 
                   rawJob.link || 
                   rawJob.jobUrl || 
                   rawJob.applyUrl ||
                   (rawJob.link && typeof rawJob.link === 'object' ? rawJob.link['@_href'] : null) || // Atom format
                   '';
        
        // Normalize description
        // RSS descriptions can be HTML, we'll store as-is
        const description = rawJob.description || 
                          rawJob.summary || 
                          rawJob.details || 
                          rawJob.content ||
                          rawJob['content:encoded'] || // RSS content:encoded
                          '';
        
        // Normalize location
        // RSS might have location in description or separate field
        const location = rawJob.location || 
                        rawJob.city || 
                        rawJob.address || 
                        rawJob.place ||
                        rawJob['job:location'] || // Some RSS extensions
                        '';
        
        // Return normalized object matching Job model
        return {
            externalId: String(externalId), // Ensure it's a string
            title: String(title).trim(),
            company: String(company).trim(),
            url: String(url).trim(),
            description: String(description).trim(),
            location: String(location).trim()
        };
    } catch (error) {
        logger.error(`Error parsing job from ${feedName}:`, error.message);
        return null;
    }
};

export default parseJob;