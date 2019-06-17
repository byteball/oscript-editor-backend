var aa_validation = require('ocore/aa_validation.js');

var aa = ['autonomous agent', {
	bounce_fees: { base: 10000 },
	messages: {
		cases: [
			{
			//	no if in 1st case
				messages: [
					{
						app: 'payment',
						payload: {
							asset: 'base',
							outputs: [
								{address: "{trigger.address}", amount: "{trigger.output[[asset=base]] - 500}"}
							]
						}
					}
				]
			},
			{
				if: "{trigger.data.y}",
				init: "{$c = trigger.data.y;}",
				messages: [
					{
						app: 'payment',
						payload: {
							asset: 'base',
							outputs: [
								{address: "{trigger.address}", amount: "{trigger.output[[asset=base]] - 500 - $c}"}
							]
						}
					}
				]
			},
		]
	}
}]
aa_validation.validateAADefinition(aa, err => {
	console.log(err);
});
