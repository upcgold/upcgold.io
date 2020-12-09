//pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;
pragma solidity ^0.6.2;
import "./ERC20.sol";
import "./UPCGoldBank.sol";

contract RewardGranter is ERC20 {

    //will not remove items from this array.  the rewarding class will loop through and will reward only scannables that have a staker
    bytes32[] public rewardToScannable;  //the scannables that will recieve the reward for staking
    uint public testVal = 0;
    mapping(bytes32 => PayoutMeta)     public payouts;
    address public owner;


    //uint public ownershipWaitingPeriod = 86400;
    uint private ownershipWaitingPeriod = 600;


    //the bank setter can only be called once
    bool bankPresent = false;
    UPCGoldBank bank;    
    

    struct PayoutMeta {
        address currentStaker;
        uint amountStaked;
        bool isOwned;
        uint lastRewardTimestamp;
        uint stakingStartTimestamp;
        uint rewards;
        string  word;
        uint gameId;
    }


    event GrantRewardEvent (
        address currentStaker,
        uint amountStaked,
        bool isOwned,
        uint lastRewardTimestamp,
        uint stakingStartTimestamp,
        uint rewards,
        bytes32 upcHash
    );    

    
    constructor () public ERC20("UPCGold", "UPCG") {
        owner = msg.sender;
        _mint(msg.sender, 1000 * (10 ** uint256(decimals())));
    }
    
    function getOwnershipPeroid() public view returns (uint) {
        return ownershipWaitingPeriod;
    }
    
    function setOwnershipPeroid(uint duration) public {
        require(msg.sender == owner , 'Unauthorized to set ownership period');
        ownershipWaitingPeriod = duration;
    }
    
    function calculateInterest(uint amount) private pure returns (uint) {
        require((amount / 10000) * 10000 == amount , 'too small');
        return amount * 700 / 10000;  //7%
    }    
    

    //TODO: access control for this function
    //returns the array of scannables that are elgible for a reward
    function getRewardableScannables() public view returns(bytes32[] memory ) {
        return rewardToScannable;
    }
 
    //function can be called once
    function setBank(address address1) public returns (uint) {
        bank = UPCGoldBank(address1);
        bankPresent = true;
    }
    
 
     function isOwned(bytes32 upcHash) public view returns (bool) {
         return payouts[upcHash].isOwned;
    }
    
    
    function getOwner(bytes32 upcHash) public view returns (address) {
         return payouts[upcHash].currentStaker;
    }
 
 
     
    function getPayoutByHash(bytes32 upcHash) public view returns (address currentStaker, uint totalBalance, string memory upcId, bool isOwned, uint stakingStartTimestamp, uint rewards) {
        currentStaker = payouts[upcHash].currentStaker;
        totalBalance = payouts[upcHash].amountStaked;
        isOwned = payouts[upcHash].isOwned;
        //lastRewardTimestamp = payouts[upcHash].lastRewardTimestamp;
        stakingStartTimestamp = payouts[upcHash].stakingStartTimestamp;
        rewards =  payouts[upcHash].rewards;
        upcId = payouts[upcHash].word;
    }
 
 
 
 
 
         //pass the upcHash, total balance, word, starttimestamp, user
        //rewardGranter.addRewardableScannable(upcHash, balanceReceived[msg.sender].totalBalance, upcId, lm.stakingStartTimestamp, msg.sender);






    function addGameToScannable(bytes32 upcHash, uint gameId) public {
        payouts[upcHash].gameId = gameId;
    }
    







    function addRewardableScannable(bytes32 upcHash, uint totalBalance, string memory upcId, uint stakingStartTimestamp, address currentStaker) public {
        bool doAdd = true;
        for(uint i=0; i<rewardToScannable.length; i++) {
            if(upcHash == rewardToScannable[i]) {
                doAdd=false;
            }
        }
        if(doAdd) {
            rewardToScannable.push(upcHash);
        }
        payouts[upcHash].currentStaker = currentStaker;
        payouts[upcHash].amountStaked = totalBalance;
        payouts[upcHash].stakingStartTimestamp = stakingStartTimestamp;
        payouts[upcHash].word = upcId;
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
        
        payouts[upcHash].currentStaker = address(0x0);
        payouts[upcHash].amountStaked = 0;
        payouts[upcHash].isOwned = false;
        payouts[upcHash].lastRewardTimestamp = 0;
        payouts[upcHash].rewards = 0;
        payouts[upcHash].word = "";



        for (uint i = removeIndex; i<rewardToScannable.length-1; i++){
            rewardToScannable[i] = rewardToScannable[i+1];
        }
        
        if(doRemove) {
            delete rewardToScannable[rewardToScannable.length-1];
            rewardToScannable.pop();   
        }

    }


 
 
    function cashOutRewards(bytes32 upcHash) public {
        /*
        (address currentStaker, uint amountStaked, bool isOwned, , , ,string memory word) = bank.getScannable(upcHash);
        
        require( currentStaker == msg.sender, 'Must own scannable code before cashing out rewards.');
        require( isOwned == true, 'Must own scannable code before cashing out rewards.');

        address payable _to = msg.sender;
        uint payoutAmount = payouts[upcHash].rewards;
        
        //reset the rewards
        payouts[upcHash].rewards = 0;
        
        _mint(_to, payoutAmount);
        */
    }
   
   
   
   function getGameIdByHash(bytes32 upcHash) public view returns(uint) {
       return payouts[upcHash].gameId;
   }


    function grantRewards() public returns(uint interestPaid, uint addressesPaid) {
        require(msg.sender == owner , 'Unauthorized to grant rewards');

        for (uint i = 0; i<=rewardToScannable.length-1; i++) {
            bytes32 upcHash = rewardToScannable[i];
            (address currentStaker, uint amountStaked, string memory word, bool isOwned, uint stakingStartTimestamp, uint rewards) = getPayoutByHash(upcHash);
            uint currentReward = payouts[upcHash].rewards;
            uint cycleInterestPayment = calculateInterest(amountStaked);
            uint newInterestAmount = currentReward + cycleInterestPayment;

            PayoutMeta memory pm;
            
            pm.currentStaker = currentStaker;
            pm.amountStaked = amountStaked;
            
            
            if( (now - stakingStartTimestamp > ownershipWaitingPeriod) && (isOwned==false)) {
                isOwned = true;
            }
            
            pm.isOwned = isOwned;
            uint currentTimestamp = now;
            pm.lastRewardTimestamp = currentTimestamp;
            pm.stakingStartTimestamp = currentTimestamp;
            pm.rewards = newInterestAmount;
            pm.word = word;

            payouts[upcHash] = pm;
            //emit GrantRewardEvent(currentStaker, amountStaked, isOwned, currentTimestamp, currentTimestamp, newInterestAmount, upcHash);
            //interestPaid += newInterestAmount;
            addressesPaid = i;
        }
    }   

}
