// Some code need to be added here, that are common for the module

module.exports = {
  timestamp: null,
  intervall: null,

  init: function () {
    this.timestamp = Math.floor(Math.random() * 999) + 1;
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
    // Enter your code here //
    return "this should be a correct sequence number";
  },

  //--------------------------
  //getTimestamp: return the current timer value
  //--------------------------
  getTimestamp: function () {
    return this.timestamp;
  },
};
