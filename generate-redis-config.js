// Script to generate base64-encoded Redis configuration for Outline

const redisConfig = {
  host: "redis.railway.internal",
  port: 6379,
  password: "ZKeYnGPnprtYrsoVRyzaeJGMxsATwgjt",
  
  // Additional options that might help with connection issues
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

console.log("Base64-encoded Redis configuration:");
console.log(`ioredis://${base64Config}`);

console.log("\nSet this as your REDIS_URL in Railway:");
console.log(`REDIS_URL=ioredis://${base64Config}`);