let ITPpacket = require("./ITPResponse");
let singleton = require("./Singleton");

module.exports = {
  id: 0,

  // Function to handle connection with the client
  handleClientJoining: function (sock) {
    // Store timestamp to use as ID and verify connection
    this.id = singleton.getTimestamp();
    console.log(`\nClient-${this.id} is connected at timestamp: ${this.id}`);

    // Handle ITP packet from client
    sock.on("data", (data) => {
      // Print out packet in bits
      console.log("\nITP packet received: ");
      printPacketBit(data);

      // Parse the ITP packet contents
      let version = parseBitPacket(data, 0, 4);
      let requestType = parseBitPacket(data, 30, 2);
      let timestamp = parseBitPacket(data, 32, 32);
      let imageType = parseBitPacket(data, 64, 4);
      let type = imageType == 1 ? "PNG" : imageType == 2 ? "BMP" : imageType == 3 ? "TIFF" : imageType == 4 ? "JPEG" : imageType == 5 ? "GIF" : imageType == 15 ? "RAW" : "unknown";
      let fileNameLength = parseBitPacket(data, 68, 28);
      let fileName = bytesToString(data.subarray(12, 12 + fileNameLength));
      
      // Output requests to console
      console.log("\nClient-" + this.id + " requests: ");
      console.log(`    --ITP version: ${version}`);
      console.log(`    --Timestamp: ${timestamp}`);
      console.log(`    --Request type: ${requestType === 0 ? "Query" : "Unknown"}`);
      console.log(`    --Image file extension(s): ${type}`);
      console.log(`    --Image file name: ${fileName}`);

      // Create ITP response packet if version and request type are valid
      if (version === 9 && requestType === 0) {
        const packet = ITPpacket.getPacket(version, 1, singleton.getSequenceNumber(), singleton.getTimestamp(), "images/" + fileName + "." + type.toLowerCase());
        // Send the ITP response packet to the client
        sock.write(packet);
      }
    });

    // Handle disconnection from client
    sock.on("close", () => {
      console.log(`\nClient-${this.id} closed the connection`);
    })

    // Handle error from client
    sock.on("error", (err) => {
      console.log("\nError with Client-" + this.id + ". Closing connection");
      sock.end();
    });
  },
};

//// Some usefull methods ////
// Feel free to use them, but DO NOT change or add any code in these methods.

// Returns the integer value of the extracted bits fragment for a given packet
function parseBitPacket(packet, offset, length) {
  let number = "";
  for (var i = 0; i < length; i++) {
    // let us get the actual byte position of the offset
    let bytePosition = Math.floor((offset + i) / 8);
    let bitPosition = 7 - ((offset + i) % 8);
    let bit = (packet[bytePosition] >> bitPosition) % 2;
    number = (number << 1) | bit;
  }
  return number;
}

// Prints the entire packet in bits format
function printPacketBit(packet) {
  var bitString = "";

  for (var i = 0; i < packet.length; i++) {
    // To add leading zeros
    var b = "00000000" + packet[i].toString(2);
    // To print 4 bytes per line
    if (i > 0 && i % 4 == 0) bitString += "\n";
    bitString += " " + b.substr(b.length - 8);
  }
  console.log(bitString);
}

// Converts byte array to string
function bytesToString(array) {
  var result = "";
  for (var i = 0; i < array.length; ++i) {
    result += String.fromCharCode(array[i]);
  }
  return result;
}
