var CVTToken = artifacts.require("./CVTToken.sol");

contract('CVTToken', function(accounts) {

	it('sets the total supply upon deployment', function() {
		return CVTToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply) {
			assert.equal(totalSupply.tonumber(), 50,000, 'sets the total supply to 50,000');
		});
	});
})