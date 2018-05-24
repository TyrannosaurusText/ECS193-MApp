var bleno = require('bleno');
var util = require('util');

function SimNotifyCharacteristic (guid)
{
	bleno.Characteristic.call(this, 
	{
		uuid: guid,
		properties: ['notify']
	});
}

util.inherits(SimNotifyCharacteristic, bleno.Characteristic);
module.exports = SimNotifyCharacteristic;

SimNotifyCharacteristic.prototype.onSubscribe = function(offset, updateValueCallback)
{
	console.log("HELLO");
	setInterval(function()
	{

		console.log("New cycle");
		var count = 0;
		var cycle = setInterval(function()
		{

			console.log("Notify");
			updateValueCallback(new Buffer([count]));
			count++;
			if (count >= 5)
				clearInterval(cycle);
		},
		3000);
	},
	30000);
};
