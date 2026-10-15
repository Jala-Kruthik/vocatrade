require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const users = await User.find({}, 'name email phone role tradeCategory location isCertified createdAt');

  const dir = path.join(__dirname, 'data/users');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const all = [];
  for (const u of users) {
    const rec = {
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      role: u.role,
      tradeCategory: u.tradeCategory || '',
      location: u.location || '',
      isCertified: u.isCertified || false,
      registeredAt: u.createdAt,
    };
    const fname = u.email.replace(/[^a-zA-Z0-9]/g, '_') + '.json';
    fs.writeFileSync(path.join(dir, fname), JSON.stringify(rec, null, 2));
    all.push(rec);
    console.log('Saved:', u.name, '|', u.email, '|', u.phone || 'no phone');
  }
  fs.writeFileSync(path.join(dir, 'all_users.json'), JSON.stringify(all, null, 2));
  console.log('\nDone. Total:', all.length, 'users saved to backend/data/users/');
  mongoose.disconnect();
}).catch(e => { console.error(e.message); process.exit(1); });
