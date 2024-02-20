// Some code need to be added here, that are common for the module

module.exports = {
  timestamp: null,
  intervall: null,
  sequenceNumber: null,

  init: function () {
    // Initialize the timestamp and sequence number to random values
    this.timestamp = Math.floor(Math.random() * 999) + 1;
    this.sequenceNumber = Math.floor(Math.random() * 999) + 1;

    // Set an interval to increment the timestamp every 10ms
    this.interval = setInterval(() => {
      this.timestamp += 1;

      // Reset the timestamp when it reaches 2^32
      if (this.timestamp >= Math.pow(2, 32)) {
        this.timestamp = 0;
      }
    }, 10);
    
  },

  //--------------------------
  //getSequenceNumber: return the current sequence number + 1
  //--------------------------
  getSequenceNumber: function () {
    this.sequenceNumber += 1;
    return this.sequenceNumber;
  },

  //--------------------------
  //getTimestamp: return the current timer value
  //--------------------------
  getTimestamp: function () {
    return this.timestamp;
  },
};
