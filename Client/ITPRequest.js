// You may need to add some statements here

module.exports = {
  packet: [],
  init: function () {
    this.packet = new Array(12 + fileName.length).fill(0);
  },

  //--------------------------
  //getBytePacket: returns the entire packet in bytes
  //--------------------------
  getBytePacket: function (version, imageType, fileName) {
    let timestamp = Math.floor(Math.random() * 999) + 1;

    // Convert image type to integer
    let type = imageType == "png" ? 1 : imageType == "bmp" ? 2 : imageType == "tiff" ? 3 : imageType == "jpeg" ? 4 : imageType == "gif" ? 5 : imageType == "raw" ? 15 : 0;

    // Store the ITP components to the packet (version, reserved, request type, timestamp, image type, file size)
    storeBitPacket(this.packet, version, 0, 4);
    storeBitPacket(this.packet, 0, 30, 2);
    storeBitPacket(this.packet, timestamp, 32, 32);
    storeBitPacket(this.packet, type, 64, 4);
    storeBitPacket(this.packet, fileName.length, 68, 28);

    // Store the file name to the packet
    let fileNameBytes = stringToBytes(fileName);
    for (let i = 0; i < fileNameBytes.length; i++) {
      this.packet[12 + i] = fileNameBytes[i];
    }

    return new Uint8Array(this.packet);
  },
};

//// Some usefull methods ////
// Feel free to use them, but DO NOT change or add any code in these methods.

// Convert a given string to byte array
function stringToBytes(str) {
  var ch,
    st,
    re = [];
  for (var i = 0; i < str.length; i++) {
    ch = str.charCodeAt(i); // get char
    st = []; // set up "stack"
    do {
      st.push(ch & 0xff); // push byte to stack
      ch = ch >> 8; // shift value down by 1 byte
    } while (ch);
    // add stack contents to result
    // done because chars have "wrong" endianness
    re = re.concat(st.reverse());
  }
  // return an array of bytes
  return re;
}

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
