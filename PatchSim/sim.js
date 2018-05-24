var bleno = require('bleno');
var SimService = require('./sim_service');

var name = 'PatchSim';
var simService = new SimService();

bleno.on('stateChange', function(state)
{
	if (state == 'poweredOn')
		bleno.startAdvertising(name, [simService.uuid], function(err) { if (err) console.log(err); });
	else 
		bleno.stopAdvertising();
});

bleno.on('advertisingStart', function(err)
{
	if (!err)
	{
		console.log('Advertising...');
		bleno.setServices([simService]);
	}
});

bleno.on('accept', function(clientAddress)
{
	console.log('Accepted: ', clientAddress);
	bleno.stopAdvertising();
});

bleno.on('disconnect', function(clientAddress)
{
	console.log('Disconnected: ', clientAddress);
	bleno.startAdvertising(name, [simService.uuid], function(err) { if (err) console.log(err); });
});