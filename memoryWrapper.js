///*
//
// The goal of this class is to provide a way to easily handle the memory used by a wasm code
//
///*

class MemoryWrapper {

    constructor(memoryBuffer) {
        this.memoryView = new DataView(memoryBuffer);
    }

    // Reading methods

    read64bitsUnsigned(address) {
        return this.memoryView.getBigUint64(address, true);
    }

    read64bitsSigned(address) {
        return this.memoryView.getBigInt64(address, true);
    }

    read32bitsUnsigned(address) {
        return this.memoryView.getUint32(address, true);
    }

    read32bitsSigned(address) {
        return this.memoryView.getInt32(address, true);
    }

    read16bitsUnsigned(address) {
        return this.memoryView.getUint16(address, true);
    }

    read16bitsSigned(address) {
        return this.memoryView.getInt16(address, true);
    }

    read8bitsUnsigned(address) {
        return this.memoryView.getUint8(address);
    }

    read8bitsSigned(address) {
        return this.memoryView.getInt8(address);
    }

    readFloat32(address) {
        return this.memoryView.getFloat32(address, true);
    }

    readFloat64(address) {
        return this.memoryView.getFloat64(address, true);
    }

    // Writing methods

    write64bitsUnsigned(address, value) {
        this.memoryView.setBigUint64(address, BigInt(value), true);
    }

    write64bitsSigned(address, value) {
        this.memoryView.setBigInt64(address, BigInt(value), true);
    }

    write32bitsUnsigned(address, value) {
        this.memoryView.setUint32(address, value, true);
    }

    write32bitsSigned(address, value) {
        this.memoryView.setInt32(address, value, true);
    }

    write16bitsUnsigned(address, value) {
        this.memoryView.setUint16(address, value, true);
    }

    write16bitsSigned(address, value) {
        this.memoryView.setInt16(address, value, true);
    }

    write8bitsUnsigned(address, value) {
        this.memoryView.setUint8(address, value);
    }

    write8bitsSigned(address, value) {
        this.memoryView.setInt8(address, value);
    }

    writeFloat32(address, value) {
        this.memoryView.setFloat32(address, value, true);
    }

    writeFloat64(address, value) {
        this.memoryView.setFloat64(address, value, true);
    }

    // String and byte utilities

    readString(address) {
        let result = "";
        let i = 0;
        let currentChar = this.read8bitsUnsigned(address);
        while (currentChar !== 0) {
            result += String.fromCharCode(currentChar);
            i++;
            currentChar = this.read8bitsUnsigned(address + i);
        }
        return result;
    }

    writeString(address, value) {
        for (let i = 0; i < value.length; i++) {
            this.write8bitsUnsigned(address + i, value.charCodeAt(i));
        }
        this.write8bitsUnsigned(address + value.length, 0);
    }

    readBytes(address, length) {
        const result = [];
        for (let i = 0; i < length; i++) {
            result.push(this.read8bitsUnsigned(address + i));
        }
        return result;
    }

    writeBytes(address, values) {
        for (let i = 0; i < values.length; i++) {
            this.write8bitsUnsigned(address + i, values[i]);
        }
    }

    // Search methods

    searchValue(value, readFn, step) {
        const addresses = [];
        for (let i = 0; i <= this.memoryView.byteLength - step; i += step) {
            if (readFn.call(this, i) === value) {
                addresses.push(i);
            }
        }
        return addresses;
    }

    search64bitsUnsigned(value) {
        return this.searchValue(BigInt(value), this.read64bitsUnsigned, 8);
    }

    search64bitsSigned(value) {
        return this.searchValue(BigInt(value), this.read64bitsSigned, 8);
    }

    search32bitsUnsigned(value) {
        return this.searchValue(value, this.read32bitsUnsigned, 4);
    }

    search32bitsSigned(value) {
        return this.searchValue(value, this.read32bitsSigned, 4);
    }

    search16bitsUnsigned(value) {
        return this.searchValue(value, this.read16bitsUnsigned, 2);
    }

    search16bitsSigned(value) {
        return this.searchValue(value, this.read16bitsSigned, 2);
    }

    search8bitsUnsigned(value) {
        return this.searchValue(value, this.read8bitsUnsigned, 1);
    }

    search8bitsSigned(value) {
        return this.searchValue(value, this.read8bitsSigned, 1);
    }

    searchFloat32(value) {
        return this.searchValue(value, this.readFloat32, 4);
    }

    searchFloat64(value) {
        return this.searchValue(value, this.readFloat64, 8);
    }

    searchString(value) {
        const potAddresses = this.search8bitsUnsigned(value.charCodeAt(0));
        const addresses = [];
        for (let address of potAddresses) {
            if (this.readString(address) === value) {
                addresses.push(address);
            }
        }
        return addresses;
    }

    searchStringRegex(value) {
        try {
            value = new RegExp(value, 'g');
        } catch (e) {
            console.log("Invalid regular expression");
            return [];
        }

        const addresses = [];
        let currentAddress = 0;

        while (currentAddress < this.memoryView.byteLength) {
            if (this.read8bitsUnsigned(currentAddress) === 0) {
                currentAddress++;
            } else {
                const tmpString = this.readString(currentAddress);
                let match;
                while ((match = value.exec(tmpString)) !== null) {
                    addresses.push(currentAddress + match.index);
                }
                currentAddress += tmpString.length + 1;
            }
        }

        return addresses;
    }
}
