const fs = require('fs');

module.exports = {
    packet: [],

    //--------------------------
    //getpacket: returns the entire packet
    //--------------------------
    getPacket: function (version, responseType, sequenceNumber, timestamp, imagePath) {
        let imageData;
        // Read image file into byte array
        try {
            // Try to read the image file
            imageData = fs.readFileSync(imagePath);
        } catch (err) {
            // If the image doesn't exist, set response type to "not found" and imagedata to empty
            responseType = 2;
            imageData = [];
        }

        this.packet = new Array(12 + imageData.length).fill(0);

        // Store the ITP components to the packet (version, response type, sequence number, timestamp)
        storeBitPacket(this.packet, version, 0, 4);
        storeBitPacket(this.packet, responseType, 4, 2);
        storeBitPacket(this.packet, sequenceNumber, 6, 26);
        storeBitPacket(this.packet, timestamp, 32, 32);
        storeBitPacket(this.packet, imageData.length, 64, 32);
        
        // Store the image data to the packet
        for (let i = 0; i < imageData.length; i++) {
            this.packet[12 + i] = imageData[i];
        }

        return new Uint8Array(this.packet);
    }
};

//// Some usefull methods ////
// Feel free to use them, but DO NOT change or add any code in these methods.

// Store integer value into specific bit poistion the packet
function storeBitPacket(packet, value, offset, length) {
    // let us get the actual byte position of the offset
    let lastBitPosition = offset + length - 1;
    let number = value.toString(2);
    let j = number.length - 1;
    for (var i = 0; i < number.length; i++) {
        let bytePosition = Math.floor(lastBitPosition / 8);
        let bitPosition = 7 - (lastBitPosition % 8);
        if (number.charAt(j--) == "0") {
            packet[bytePosition] &= ~(1 << bitPosition);
        } else {
            packet[bytePosition] |= 1 << bitPosition;
        }
        lastBitPosition--;
    }
}