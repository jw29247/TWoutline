// Script to generate base64-encoded Redis configuration for public endpoint

// You'll need to replace this with your actual public Redis hostname from Railway
const publicHost = "your-redis-service.railway.app"; // REPLACE THIS

const redisConfig = {
  host: publicHost,
  port: 6379, // or whatever port Railway provides
  password: "ZKeYnGPnprtYrsoVRyzaeJGMxsATwgjt",
  
  // SSL/TLS configuration for public endpoint
  tls: {
    rejectUnauthorized: false
  },
  
  // Connection options
  retryStrategy: function(times) {
    return Math.min(times * 100, 3000);
  },
  connectTimeout: 30000,
  lazyConnect: true,
  maxRetriesPerRequest: 20
};

// Convert to base64
const jsonString = JSON.stringify(redisConfig);
const base64Config = Buffer.from(jsonString).toString('base64');

console.log("Base64-encoded Redis configuration for public endpoint:");
console.log(`ioredis://${base64Config}`);