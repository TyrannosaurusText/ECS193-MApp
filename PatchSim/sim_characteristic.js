var bleno = require('bleno');
var util = require('util');

var guids = [];
guids['056b0f3d57d74842a4f13177fd883a97'] = 0;
guids['361427502a5a450aba699c072db93079'] = 1;
guids['156b0f3d57d74842a4f13177fd883a97'] = 2;
guids['ed887b1087e343d885957f8c0394a9ae'] = 3;
guids['3833073144ac462c93a3054f93a9a35a'] = 4;
guids['09ec3e8f4390439dbbdf2b79370aba51'] = 5;
guids['7ac8c0e7ebc74a449ee1eeea9fa2218d'] = 6;
guids['0ebc4973f784484988917d759fb1e3b7'] = 7;
guids['638e8cbfbc8b4b24a719d9f0dfe24784'] = 8;
guids['de76c06235dd44edb8c2cb28b98cdef4'] = 9;
guids['90f1a21f5d344b949797e3873c66fa78'] = 10;
guids['c3c8b0a0a540486da94e405f2f3d1334'] = 11;
guids['59a8a2b17e54419aa37ff59d01d80cae'] = 12;
guids['3acb209a3b544b2d8981c5d8e2b85db7'] = 13;
guids['3d2a633f5eea4346a073cbdd002040d1'] = 14;
guids['c3151bb73e2c48218eb94067a6585508'] = 15;

function SimCharacteristic (guid)
{
    bleno.Characteristic.call(this, 
    {
        uuid: guid,
        properties: ['read']
    });
}

util.inherits(SimCharacteristic, bleno.Characteristic);
module.exports = SimCharacteristic;
var count = 0;
var off = 10;

SimCharacteristic.prototype.onReadRequest = function(offset, callback)
{
    var buf = new Buffer(17);

    buf.writeFloatBE(Math.random() * 10 + off, 0);
    buf.writeFloatBE(Math.random() * 10 + off, 4);
    buf.writeFloatBE(Math.random() * 10 + off, 8);
    buf.writeFloatBE(Math.random() * 10 + off, 12);
    count++;
    if(count == 16){ 
    off += 10;
    count = 0;
    }
    if(off > 1000) off = 0;
    console.log(off);
    callback(this.RESULT_SUCCESS, buf);
};
