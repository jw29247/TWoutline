const Redis = require('ioredis');

const redisUrl = 'redis://default:ZKeYnGPnprtYrsoVRyzaeJGMxsATwgjt@centerbeam.proxy.rlwy.net:37983';

console.log('Testing Redis connection to:', redisUrl);

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    console.log(`Retry attempt ${times}`);
    if (times > 3) {
      return null; // Stop retrying
    }
    return Math.min(times * 100, 3000);
  },
  enableReadyCheck: true,
  connectTimeout: 10000,
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis successfully!');
});

redis.on('ready', () => {
  console.log('✅ Redis is ready to accept commands');
  
  // Test basic operations
  redis.ping()
    .then(result => {
      console.log('✅ PING response:', result);
      return redis.set('test-key', 'test-value');
    })
    .then(() => {
      console.log('✅ SET operation successful');
      return redis.get('test-key');
    })
    .then(value => {
      console.log('✅ GET operation successful, value:', value);
      return redis.del('test-key');
    })
    .then(() => {
      console.log('✅ Cleanup successful');
      console.log('\n🎉 All Redis operations completed successfully!');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Redis operation error:', err);
      process.exit(1);
    });
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
  console.error('Error details:', err);
});

redis.on('close', () => {
  console.log('Redis connection closed');
});

// Set a timeout to exit if connection takes too long
setTimeout(() => {
  console.error('❌ Connection timeout - could not connect to Redis after 15 seconds');
  process.exit(1);
}, 15000);