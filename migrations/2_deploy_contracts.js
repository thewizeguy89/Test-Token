var CVTToken = artifacts.require("./CVTToken.sol");
var CVTTokenSale = artifacts.require("./CVTTokenSale");

module.exports = function(deployer) {
	deployer.deploy(CVTToken, 50000).then(function() {
    // Token price is 0.001 Ether
    var tokenPrice = 1000000000000000;
    return deployer.deploy(CVTTokenSale, CVTToken.address, tokenPrice);
  });
};
