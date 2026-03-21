fetch('https://quickcook-jpo1.onrender.com/cooks', {
  method: 'OPTIONS',
  headers: { 'Origin': 'https://quickcook-frontend.vercel.app' }
})
.then(res => console.log('CORS Origin:', res.headers.get('access-control-allow-origin')))
.catch(err => console.error('Fetch error:', err));
