// Script to generate Redis configuration using Railway proxy endpoint

const redisUrl = "redis://default:ZKeYnGPnprtYrsoVRyzaeJGMxsATwgjt@centerbeam.proxy.rlwy.net:37983";

console.log("Standard Redis URL using Railway proxy:");
console.log(redisUrl);

// Also generate base64 config version
const redisConfig = {
  host: "centerbeam.proxy.rlwy.net",
  port: 37983,
  password: "ZKeYnGPnprtYrsoVRyzaeJGMxsATwgjt",
  username: "default",
  
  // Connection options
  connectTimeout: 30000,
  lazyConnect: true,
  maxRetriesPerRequest: 20,
  enableReadyCheck: false,
  retryStrategy: function(times) {
    return Math.min(times * 100, 3000);
  }
};

// Convert to base64
const jsonString = JSON.stringify(redisConfig);
const base64Config = Buffer.from(jsonString).toString('base64');

console.log("\nBase64-encoded Redis configuration:");
console.log(`ioredis://${base64Config}`);

console.log("\nSet one of these as your REDIS_URL in Railway:");
console.log(`Option 1: REDIS_URL=${redisUrl}`);
console.log(`Option 2: REDIS_URL=ioredis://${base64Config}`);