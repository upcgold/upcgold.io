// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.4/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.4/contracts/utils/Context.sol";


/**
 * @title SimpleToken
 * @dev Very simple ERC20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `ERC20` functions.
 */
contract xUPC is Context, ERC20 {


    address private owner;
    struct Reward {
        uint256  amount;
        string  winningHash;
        address payable miner;
    }
    
    /**
     * @dev Constructor that gives _msgSender() all of existing tokens.
     */
    constructor () public  ERC20("UPC Matrix", "XUPC") {
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

    
    function addReward(uint256 amount, string memory winningHash, address payable miner) public payable onlyOwner {
        
    }
    
    function clearRewards() public  onlyOwner{
        
    }
    
    function stringToBytes32(string memory source) public pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
    
        assembly {
            result := mload(add(source, 32))
        }
    }
    
    
    function bytes32ToString(bytes32 x) pure public returns (string memory) {
        bytes memory bytesString = new bytes(32);
        uint charCount = 0;
        uint j = 0;
        for (j = 0; j < 32; j++) {
            byte char = byte(bytes32(uint(x) * 2 ** (8 * j)));
            if (char != 0) {
                bytesString[charCount] = char;
                charCount++;
            }
        }
        bytes memory bytesStringTrimmed = new bytes(charCount);
        for (j = 0; j < charCount; j++) {
            bytesStringTrimmed[j] = bytesString[j];
        }
        return string(bytesStringTrimmed);
    }



    function mine(bytes32 _upcHash) public payable returns (uint256) {
        
    }
    
}
