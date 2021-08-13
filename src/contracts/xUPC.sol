// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "./openzeppelin-contracts/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "./openzeppelin-contracts/contracts/utils/Context.sol";
//import "./stringUtils.sol";

/**
 * @title SimpleToken
 * @dev Very simple ERC20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `ERC20` functions.
 */
contract xUPC is Context, ERC20, ERC20Burnable {


    uint rehash = 3;
    address private owner;
    struct Reward {
        uint256  amount;
        string  winningHash;
    }
    
    Reward[] public rewards;
    /**
     * @dev Constructor that gives _msgSender() all of existing tokens.
     */
    constructor () ERC20("UPC Matrix", "XUPC") public{
        _mint(_msgSender(), 10000 * (10 ** uint256(decimals())));
        owner = msg.sender;
    }
    
    modifier onlyOwner
    {
        require(
            msg.sender == owner,
            "Sender not authorized."
        );
        // Do not forget the "_;"! It will
        // be replaced by the actual function
        // body when the modifier is used.
        _;
    }

    
    function addReward(uint256 amount, string memory winningHash) public payable onlyOwner {
        Reward memory newRewreward;
        newRewreward.amount = amount;
        newRewreward.winningHash = winningHash;
        rewards.push(newRewreward);
    }
    
    function clearRewards() public  onlyOwner{
        delete rewards;
    }
    

    function mine () public {
                _mint(msg.sender, 1 * (10 ** 16));
                _mint(address(this), 1 * (10 ** 18));
    }
    
}
