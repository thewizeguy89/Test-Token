pragma solidity ^0.5.0;

import "./CVTToken.sol";

contract CVTTokenSale {
    address payable admin;
    CVTToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    function CVTTokenSaleMSG(CVTToken _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        require(tokenContract.transfer(msg.sender, _numberOfTokens));

        tokensSold += _numberOfTokens;

        emit Sell(msg.sender, _numberOfTokens);
    }
            //Fix endSale to complete transaction
            
        // function endSale() public {
        // require(msg.sender == admin);
        // require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        // admin.transfer(address payable(this).balance);
        // }
}