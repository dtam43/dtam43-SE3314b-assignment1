let net = require("net");
let argv = require("minimist")(process.argv.slice(2));
let fs = require("fs");
let open = require("open");
let ITPpacket = require("./ITPRequest");

// Variables from command line arguments
let HOST = argv.s.split(":")[0];
let PORT = argv.s.split(":")[1];
let image = argv.q.split(".");
let imageName = image[0];
let imageType = image[1];
let version = argv.v;

// Create a new client socket and connect to the server
let client = new net.Socket();
client.connect(PORT, HOST, function () {
  console.log("Connected to ImageDB server on: " + HOST + ":" + PORT);

  // Create ITP packet
  const packet = ITPpacket.getBytePacket(
    version,
    imageType.toLowerCase(),
    imageName
  );

  // Send the ITP packet to the server
  client.write(packet);
});

// Handle the response from the server
client.on("data", function (data) {
  
  // Print out packet in bits
  console.log("\nITP packet header received: ");
  printPacketBit(data.subarray(0, 12));

  // Parse the ITP packet contents
  let version = parseBitPacket(data, 0, 4);
  let responseType = parseBitPacket(data, 4, 2);
  let type = responseType == 0 ? "Query" : responseType == 1 ? "Found" : responseType == 2 ? "Not found" : responseType == 3 ? "Busy" : "Unknown";
  let sequenceNumber = parseBitPacket(data, 6, 26);
  let timestamp = parseBitPacket(data, 32, 32);
  let imageSize = parseBitPacket(data, 64, 32);

  // Output requests to console
  console.log("\nServer sent: ");
  console.log(`    --ITP version = ${version}`);
  console.log(`    --Response Type = ${type}`);
  console.log(`    --Sequence Number = ${sequenceNumber}`);
  console.log(`    --Timestamp = ${timestamp}`);

  // Open the image data if the response type is "Found"
  if (responseType === 1) {
    // Extract the image data from the packet
    let imageData = data.subarray(12, 12 + imageSize);

    // Write the image data to a file
    let imagePath = `./${imageName}.${imageType}`;
    fs.writeFileSync(imagePath, imageData);

    // Open the image file
    open(imagePath);
  }

  // Close the connection
  client.end();
  console.log("\nDisconnected from the server");
});

// Confirm connection closed
client.on("close", () => {
  console.log("Connection closed");
});

// Handle error from server
client.on("error", (err) => {
  console.log("Error with the server. Closing connection");
  client.end();
});

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
