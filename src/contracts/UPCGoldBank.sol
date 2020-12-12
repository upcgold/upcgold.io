pragma solidity ^0.6.2;
pragma experimental ABIEncoderV2;
import "./RewardGranter.sol";

contract UPCGoldBank { 
     
    struct Deposit {
        uint amount;
        uint timestamps;
    }
    
    struct Balance {
        uint                        totalBalance;
        uint                        numPayments;
        mapping(uint => Deposit)    deposits;
    }
    
    struct LeaseMeta {
        address  staker;  //address of the staker
        uint     amountStaked;
        bool     isOwned;
        uint     interestGained;
        uint     stakingStartTimestamp;
        uint     lastRewardTimestamp;
        bytes32  upcHash;
        string   word;
    }

    
    //declare an array of AddressToLeases
    //each will have the address of the staker and the upcHash/meta
    mapping(address  => LeaseMeta[])   public addressToLease;       //one-to-many relation between an address and scannables (leases/upcs)
    mapping(address => Balance)     public balanceReceived;
    
    /*
    *  all possible scannables already exist.  this mapping defines the current information about the scannables
    *  the addressToLease mapping defines which address owns which scannable
    */
    mapping(bytes32  => LeaseMeta)   public scannables;       //pass in the upcId and look up the meta about the upc
    uint public actionPot;
    RewardGranter rewardGranter;
    bool isRewardGranterPresent = false;
    address payable[] payees;  //addresss of the wallets to pay back
    address private owner;


    constructor () public {
        owner = msg.sender;
    }
   

    //use block100 modifier to control access to the payout function
    modifier ownerGuid() {
        require( owner == msg.sender , "Error: Only owner can see the guid");
        _;
    }
    

    function addPayee(address payable addy) public ownerGuid {
        payees.push(addy);
    }


    function getScannable(bytes32 upcHash) public view returns(address currentStaker, uint amountStaked, bool isOwned, uint rewards,  uint stakingStartTimestamp, string memory word, string memory gameId) {

        (address _currentStaker, uint _amountStaked, string memory _word, bool _isOwned, uint _stakingStartTimestamp, uint _rewards) = rewardGranter.getPayoutByHash(upcHash);
        gameId = rewardGranter.getGameIdByHash(upcHash);
        
        //(address currentStaker, uint totalBalance, string memory upcId, bool isOwned, uint stakingStartTimestamp, uint rewards, uint lastRewardTimestamp)


        currentStaker = _currentStaker;
        amountStaked = _amountStaked;
        word = _word;
        isOwned = _isOwned;
        stakingStartTimestamp = _stakingStartTimestamp;
        rewards = _rewards;
        //lastRewardTimestamp = _lastRewardTimestamp;
    }



    function setRewardGranter(address addy) public ownerGuid {
        //to harvest a reward from a scannable, the caller must be the staker
        //require(isRewardGranterPresent == false , 'reward granter already set');
        //rewardGranter =  RewardGranter();
        rewardGranter = RewardGranter(addy);
    }

    
    
    function harvestRewardForScannable(uint amount) external pure returns (uint) {
        //to harvest a reward from a scannable, the caller must be the staker
        require((amount / 10000) * 10000 == amount , 'too small');
        return amount * 200 / 10000;  //2%
    }
    

    function internalTransfer(address _to, uint _amount) public {
        require(balanceReceived[msg.sender].totalBalance >= _amount, "Insufficient funds for internal transfer" );
        balanceReceived[msg.sender].totalBalance -= _amount;
        balanceReceived[_to].totalBalance += _amount; 
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }

    function getAddressBalance() public view returns(uint) {
        return balanceReceived[msg.sender].totalBalance;
    }

    
    function getMyScannables() public view returns(bytes32[] memory ) {
        //initialize array to the length of the scannables array
        bytes32[] memory localScannables = new bytes32[](addressToLease[msg.sender].length);

        for(uint i = 0; i< addressToLease[msg.sender].length; i++) {
            localScannables[i] = addressToLease[msg.sender][i].upcHash;
        }       

        return localScannables;
    }
    
    
    function getCostToEvict(string memory upcId) public view returns(address currentStaker, uint currentAmountStaked, bool currentIsOwned, bytes32 upcHash) {
        upcHash = sha256(abi.encodePacked(upcId));
        currentStaker = scannables[upcHash].staker;
        currentAmountStaked = scannables[upcHash].amountStaked;
        currentIsOwned = scannables[upcHash].isOwned;
    }

    function depositMoney(string memory upcId, string memory gameId) public payable {
        bytes32 upcHash = sha256(abi.encodePacked(upcId));

        
        uint _coinsToPayBills = this.calculateFee(msg.value);  //half goes to the pot, half goes to pay bills
        
        
        uint _addToBalance = msg.value - _coinsToPayBills; //take eth out to do good with

        //look into registering an unstoppable domain id.  verify on the blockchain that the msg.sender == the owner of the domain
        //(, uint currentAmountStaked ,) = this.getCostToEvict(upcId);
        bool owned = rewardGranter.isOwned(upcHash);
        address currentStaker;
        if(owned) {
            currentStaker = rewardGranter.getOwner(upcHash);
        }
        
        if(owned) {
            require(currentStaker == msg.sender , "Get your own code.  This one is taken :p");
        }

        uint currentAmountStaked = scannables[upcHash].amountStaked;
        bool restaking = false;
        
        if( (scannables[upcHash].staker != address(0x0)) && (msg.sender != scannables[upcHash].staker) ) {
            require(_addToBalance > currentAmountStaked, "You must outstake the current stakeholder to win this lease.");
        }
        else {
            restaking = true;
        }
        
        if(msg.sender != scannables[upcHash].staker) {
            uint evictionPrice = evict(upcHash);
            
            //after an eviction, currentAmountStaked should equal zero to make way for the new owner's currentAmountStaked
            currentAmountStaked = scannables[upcHash].amountStaked;
            
            //AFTER EVICTION, REMOVE THE UPC FROM THE UPC TO ADDRESS MAPPING AND ADD IT TO THE NEW OWNER'S MAPPING
        }

        LeaseMeta memory lm;
        lm.staker = msg.sender;
        lm.amountStaked = currentAmountStaked + _addToBalance;
        
        if(!restaking) {
            lm.isOwned =  false;
        }
        else {
            lm.isOwned =  true;
        }
        
        lm.stakingStartTimestamp = now;
        lm.upcHash = upcHash;
        lm.word = upcId;
        scannables[upcHash] = lm;
        
        //look through the current scannables and only add if 
        //the upcId is not already with user.  dont want to add new entry if user increases their stake
        bool addScannableToAddress = true;
        
        for(uint i = 0; i< addressToLease[msg.sender].length; i++) {
            if(addressToLease[msg.sender][i].upcHash == upcHash) {
                addScannableToAddress = false;
            }
        }
        
        if(addScannableToAddress) {
            addressToLease[msg.sender].push(lm);
        }

        //require(balanceReceived[msg.sender].totalBalance >= _amount, "Insufficient funds for internal transfer" );

        balanceReceived[msg.sender].totalBalance += _addToBalance;
        Deposit memory deposit = Deposit(_addToBalance, now);
        balanceReceived[msg.sender].deposits[balanceReceived[msg.sender].numPayments] = deposit;
        balanceReceived[msg.sender].numPayments++;
        
        
        
        //rewardGranter = RewardGranter(address1);
        //add this scannable to the rewards array
        //pass the upcHash, total balance, word, starttimestamp, user
        rewardGranter.addRewardableScannable(upcHash, (currentAmountStaked + _addToBalance), upcId, lm.stakingStartTimestamp, msg.sender);
        rewardGranter.addGameToScannable(upcHash, gameId);


        payBills(_coinsToPayBills);

    }
    
    function payBills(uint coins) public returns (uint) {
        uint numPayees = payees.length;
        for(uint i=0; i<numPayees; i++) {
            uint myShare = coins / numPayees;
            payees[i].transfer(myShare);
        }
    }
    
    
    function calculateFee(uint amount) external pure returns (uint) {
        require((amount / 10000) * 10000 == amount , 'too small');
        return amount * 200 / 10000;  //2%
    }

    function evict(bytes32 upcHash) private returns (uint) {

        //require(scannables[upcHash].isOwned == false, "Can not evict from an occupied scannable.");
        uint toWithdraw = scannables[upcHash].amountStaked;
        address payable _to = address(uint160(scannables[upcHash].staker));
        balanceReceived[_to].totalBalance -= toWithdraw;
        scannables[upcHash].amountStaked = 0;
        
        
        //find current owner and remove them so that the new owner can be recorded in the addressToLease
        address currentOwner = scannables[upcHash].staker;
        uint deleteIndex = 0;
        for(uint i = 0; i< addressToLease[currentOwner].length; i++) {
            if(addressToLease[currentOwner][i].upcHash == upcHash) {
                deleteIndex = i;
            }
        }
        
        removeUpcFromA2L(deleteIndex,currentOwner);
        
        _to.transfer(toWithdraw);
        return toWithdraw;
    }
    
    //remove upc from the address to lease structure
    function removeUpcFromA2L(uint index, address sender)  private {
        if (index >= addressToLease[sender].length) return;

        for (uint i = index; i<addressToLease[sender].length-1; i++){
            addressToLease[sender][i] = addressToLease[sender][i+1];
        }
        delete addressToLease[sender][addressToLease[sender].length-1];
        addressToLease[sender].pop();
    }
    
    
    
    //withdraw function should be the only instance where the scannable is removed from the rewardToScannable structure
    function withdraw(string memory upcId) public {
        bytes32 upcHash = sha256(abi.encodePacked(upcId));
        require(msg.sender == scannables[upcHash].staker, "Only the staker can withdraw funds" );
        
        uint _coinsToPayBills = this.calculateFee(scannables[upcHash].amountStaked);
        uint toWithdraw = scannables[upcHash].amountStaked - _coinsToPayBills;
        address payable _to = msg.sender;
        balanceReceived[msg.sender].totalBalance = 0;
        scannables[upcHash].amountStaked = 0;
        scannables[upcHash].staker = address(0x0);
        
        bool doDelete = false;
        uint deleteIndex = 0;
        for(uint i = 0; i< addressToLease[msg.sender].length; i++) {
            if(addressToLease[msg.sender][i].upcHash == upcHash) {
                doDelete = true;
                deleteIndex = i;
            }
        }
        
        if(doDelete) {
            removeUpcFromA2L(deleteIndex,msg.sender);
        }
        
        //
        rewardGranter.removeRewardableScannable(upcHash);

        _to.transfer(toWithdraw);
        payBills(_coinsToPayBills);

    }
    
}
