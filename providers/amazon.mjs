// @ts-check
/** @typedef {import('./_types.js').Provider} Provider */

// Amazon provider — hits the public search.json endpoint.
// Auto-detects from careers_url pattern `https://www.amazon.jobs`.

/** @type {Provider} */
export default {
  id: 'amazon',

  detect(entry) {
    const url = entry.careers_url || '';
    if (url.includes('amazon.jobs')) {
      return { url };
    }
    return null;
  },

  async fetch(entry, ctx) {
    // @ts-ignore
    const query = entry.query || 'Machine Learning';
    // @ts-ignore
    const location = entry.location || '';
    
    const searchParams = new URLSearchParams({
      query: query,
      result_limit: '100',
    });
    if (location) {
      searchParams.set('location', location);
    }
    
    const apiUrl = `https://www.amazon.jobs/en/search.json?${searchParams.toString()}`;
    const json = await ctx.fetchJson(apiUrl, { redirect: 'error' });
    
    // @ts-ignore
    const jobs = Array.isArray(json?.jobs) ? json.jobs : [];
    
    return jobs.map(j => {
      const path = j.job_path || '';
      const url = path.startsWith('http') ? path : `https://www.amazon.jobs${path}`;
      
      const locParts = [j.city, j.state, j.country_code].filter(Boolean);
      const location = locParts.join(', ');
      
      return {
        title: j.title || '',
        url,
        company: entry.name || 'Amazon',
        location,
        description: j.description_short || j.description || '',
        postedAt: j.posted_date ? new Date(j.posted_date).getTime() : undefined,
      };
    });
  },
};
