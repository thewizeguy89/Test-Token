var CVTToken = artifacts.require("./CVTToken.sol");

contract('CVTToken', function(accounts) {
	var tokenInstance;

	it('initializes the contract with the correct values', function() {
		return CVTToken.deployed().then(function (instance) {
			tokenInstance = instance
			return tokenInstance.name();
		}).then(function(name) {
			assert.equal(name, 'CVTToken', 'has the correct name');
			return tokenInstance.symbol();
		}).then(function(symbol) {
			assert.equal(symbol, 'CVTT', 'has the correct symbol');
			return tokenInstance.standard();
		}).then(function(standard) {
			assert.equal(standard, 'CVTToken v1.0', 'has the correct standard')
		});
	})

	it('allocates the total supply upon deployment', function() {
		return CVTToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply) {
			assert.equal(totalSupply.tonumber(), 50000, 'sets the total supply to 50,000');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(adminBalance) {
			assert.equal(adminBalance.toNumber(), 50000, 'it allocatesthe initial supply to the admin account');
		});
	});

	it('transfers token ownership', function() {
		return CVTToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.transfer.call(accounts[1], 50000);
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf('revert') >=0, 'error message must contain revert');
			return tokenInstance.transfer.call(accounts[1], 2500, { from: accounts[0] });
		}).then(function(success) {
			assert.equal(success, true, 'it returns true');
		    return tokenInstance.transfer(accounts[1], 2500, { from: accounts[0] });
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
			assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
			assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transfered to');
			assert.equal(receipt.logs[0].args_value, 2500, 'logs the transfer ammount');
			return tokenInstance.balanceOf(accounts[1]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 2500, 'adds the ammount to the receiving account');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 47500, 'deducts the ammount from the sending account');
		})
	});
})