const url = 'https://api.firecrawl.dev/v2/map';
const options = {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer process.env.FIRECRAWL_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    "url": "<domain.com>",
    "limit": 5000,
    "includeSubdomains": false,
    "sitemap": "include"
  })
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}

// Success response:
// 
// {
//   "success": true,
//   "links": [
//     {
//       "url": "<string>",
//     }
//   ]
// }