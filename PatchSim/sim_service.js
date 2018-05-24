var bleno = require('bleno');
var util = require('util');

var SimCharacteristic = require('./sim_characteristic');
var SimNotifyCharacteristic = require('./sim_notify_characteristic');

function SimService ()
{
	bleno.PrimaryService.call(this,
	{
		uuid: '72369d5c94e141d7acaba88062c506a8',
		characteristics:
		[
			new SimNotifyCharacteristic('222b99a037cc479991527c35d5c5fe07'),
			
			new SimCharacteristic('056b0f3d57d74842a4f13177fd883a97'),
			new SimCharacteristic('361427502a5a450aba699c072db93079'),
			new SimCharacteristic('156b0f3d57d74842a4f13177fd883a97'),
			new SimCharacteristic('ed887b1087e343d885957f8c0394a9ae'),
			new SimCharacteristic('3833073144ac462c93a3054f93a9a35a'),
			new SimCharacteristic('09ec3e8f4390439dbbdf2b79370aba51'),
			new SimCharacteristic('7ac8c0e7ebc74a449ee1eeea9fa2218d'),
			new SimCharacteristic('0ebc4973f784484988917d759fb1e3b7'),
			new SimCharacteristic('638e8cbfbc8b4b24a719d9f0dfe24784'),
			new SimCharacteristic('de76c06235dd44edb8c2cb28b98cdef4'),
			new SimCharacteristic('90f1a21f5d344b949797e3873c66fa78'),
			new SimCharacteristic('c3c8b0a0a540486da94e405f2f3d1334'),
			new SimCharacteristic('59a8a2b17e54419aa37ff59d01d80cae'),
			new SimCharacteristic('3acb209a3b544b2d8981c5d8e2b85db7'),
			new SimCharacteristic('3d2a633f5eea4346a073cbdd002040d1'),
			new SimCharacteristic('c3151bb73e2c48218eb94067a6585508')
		]
	});
}

util.inherits(SimService, bleno.PrimaryService);
module.exports = SimService;
