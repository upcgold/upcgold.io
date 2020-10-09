//pragma solidity ^0.5.16;
pragma solidity ^0.6.2;
import "./ERC20.sol";


contract RewardGranter is ERC20 {

    //will not remove items from this array.  the rewarding class will loop through and will reward only scannables that have a staker
    bytes32[] public rewardToScannable;  //the scannables that will recieve the reward for staking
    uint public testVal = 0;
    
    constructor () public ERC20("UPCGold", "UPCG") {
        _mint(msg.sender, 1000000 * (10 ** uint256(decimals())));
    }
    

    //TODO: access control for this function
    //returns the array of scannables that are elgible for a reward
    function getRewardableScannables() public view returns(bytes32[] memory ) {
        return rewardToScannable;
    }
 
    function addRewardableScannable(bytes32 upcHash) public {
        bool doAdd = true;
        for(uint i=0; i<rewardToScannable.length; i++) {
            if(upcHash == rewardToScannable[i]) {
                doAdd=false;
            }
        }
        if(doAdd) {
            rewardToScannable.push(upcHash);
        }
    }
    
    
    //remove upc from the address to lease structure
    function removeRewardableScannable(bytes32 upcHash)  public {
        
        bool doRemove = false;
        uint removeIndex;
        for(uint i=0; i<rewardToScannable.length; i++) {
            if(upcHash == rewardToScannable[i]) {
                doRemove=true;
                removeIndex = i;
            }
        }

        for (uint i = removeIndex; i<rewardToScannable.length-1; i++){
            rewardToScannable[i] = rewardToScannable[i+1];
        }
        
        delete rewardToScannable[rewardToScannable.length-1];
        rewardToScannable.pop();
    }
    
        

    function doMyTest(address  addy) public returns (uint) {
        testVal++;
    }
}
