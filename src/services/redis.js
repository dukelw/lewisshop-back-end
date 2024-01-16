const Redis = require("ioredis");
const { reservationInventory } = require("../models/function/Inventory");
const redisClient = new Redis();

const acquireLock = async (product_id, quantity, cart_id) => {
  const key = `lock_v2024_${product_id}`;
  const retryTimes = 10;
  const expireTime = 3000;

  for (let i = 0; i < retryTimes; i++) {
    const result = await redisClient.set(key, "1", "NX", "PX", expireTime);
    if (result === "OK") {
      try {
        const isReservation = await reservationInventory({
          product_id,
          quantity,
          cart_id,
        });
        if (isReservation.modifiedCount) {
          return key;
        }
      } finally {
        // Release the lock if the reservation fails or completes
        await releaseLock(key);
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
};

const releaseLock = async (keyLock) => {
  // Release the lock by deleting the key
  await redisClient.del(keyLock);
};

module.exports = {
  acquireLock,
  releaseLock,
};
