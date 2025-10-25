// Quick script to seed production database
const https = require('https');

const options = {
  hostname: 'hrisnextgen.vercel.app',
  port: 443,
  path: '/api/seed',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('🌱 Calling seed endpoint in production...');
console.log('URL: https://hrisnextgen.vercel.app/api/seed');
console.log('');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log('Response:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
      
      if (json.success) {
        console.log('');
        console.log('✅ Database seeded successfully!');
        console.log(`   - Roles: ${json.counts?.roles || 'N/A'}`);
        console.log(`   - Business Units: ${json.counts?.businessUnits || 'N/A'}`);
        console.log(`   - Users: ${json.counts?.users || 'N/A'}`);
      } else {
        console.log('');
        console.log('❌ Seeding failed:', json.error || json.message);
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.end();
