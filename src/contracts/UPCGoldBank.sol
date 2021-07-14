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
    
    struct UpcMeta {
        address  staker;  //address of the staker
        uint     amountStaked;
        bool     isOwned;
        uint     interestGained;
        uint     stakingStartTimestamp;
        uint     lastRewardTimestamp;
        bytes32  upcHash;
        string   word;
        string   gameId;
        string   ipfs;
    }

    
    //declare an array of AddressToUpcs
    //each will have the address of the staker and the upcHash/meta
    mapping(address  => UpcMeta[])   public addressToUpc;       //one-to-many relation between an address and scannables (leases/upcs)
    mapping(address => Balance)     public balanceReceived;
    
    /*
    *  all possible scannables already exist.  this mapping defines the current information about the scannables
    *  the addressToUpc mapping defines which address owns which scannable
    */
    mapping(bytes32  => UpcMeta)   public scannables;       //pass in the upcId and look up the meta about the upc
    uint public actionPot;
    RewardGranter rewardGranter;
    bool isRewardGranterPresent = false;
    address payable[] payees;  //addresss of the wallets to pay back
    address private owner;
    string public defaultIpfs;




    constructor () public {
        owner = msg.sender;
        defaultIpfs = "QmejN35QPpmJXZ55jgVjVU1NgTGwgGg5GufWd81rRCZPF4";
    }
   

    //use block100 modifier to control access to the payout function
    modifier ownerGuid() {
        require( owner == msg.sender , "Error: Only owner can see the guid");
        _;
    }
    

    function addPayee(address payable addy) public ownerGuid {
        payees.push(addy);
    }



    function setIpfsForScannable(bytes32 upcHash, string memory ipfsHash) public {
        require(msg.sender == scannables[upcHash].staker, "Only the staker can set IPFS" );
        scannables[upcHash].ipfs = ipfsHash;
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
        bytes32[] memory localScannables = new bytes32[](addressToUpc[msg.sender].length);

        for(uint i = 0; i< addressToUpc[msg.sender].length; i++) {
            localScannables[i] = addressToUpc[msg.sender][i].upcHash;
        }       

        return localScannables;
    }
    
    function setDefaultIPFSSite(string memory _ipfs) public  {
        require( owner == msg.sender , "Error: Only owner can see the guid");
        defaultIpfs = _ipfs;
    }
    


    function depositMoney(string memory upcId, string memory gameId) public payable {
        bytes32 upcHash = sha256(abi.encodePacked(upcId));
        require(scannables[upcHash].isOwned  == false, "UPC is already owned" );


        uint _coinsToPayBills = this.calculateFee(msg.value);  //half goes to the pot, half goes to pay bills
        
        
        uint _addToBalance = msg.value - _coinsToPayBills; //take eth out to do good with

        //look into registering an unstoppable domain id.  verify on the blockchain that the msg.sender == the owner of the domain
        //(, uint currentAmountStaked ,) = this.getCostToEvict(upcId);
        //bool owned = rewardGranter.isOwned(upcHash);
        address currentStaker;
        //if(owned) {
        //    currentStaker = rewardGranter.getOwner(upcHash);
        //}
        
        //if(owned) {
        //    require(currentStaker == msg.sender , "Code is already owned");
        //}

        uint currentAmountStaked = scannables[upcHash].amountStaked;
        bool restaking = false;
        
        //code is owned and the sender is not the owner/staker
        if( (scannables[upcHash].staker != address(0x0)) && (msg.sender != scannables[upcHash].staker) ) {
            require(_addToBalance > currentAmountStaked, "You must outstake the current stakeholder to win this lease.");
        }
        else {
            restaking = true;
        }
        

        UpcMeta memory upcMeta;
        upcMeta.staker = msg.sender;
        upcMeta.amountStaked = currentAmountStaked + _addToBalance;
        upcMeta.ipfs = defaultIpfs;
        upcMeta.isOwned =  true;
        upcMeta.stakingStartTimestamp = now;
        upcMeta.upcHash = upcHash;
        upcMeta.word = upcId;
        upcMeta.gameId = gameId;

        scannables[upcHash] = upcMeta;
        
        //look through the current scannables and only add if 
        //the upcId is not already with user.  dont want to add new entry if user increases their stake
        bool addScannableToAddress = true;
        
        for(uint i = 0; i< addressToUpc[msg.sender].length; i++) {
            if(addressToUpc[msg.sender][i].upcHash == upcHash) {
                addScannableToAddress = false;
            }
        }
        
        if(addScannableToAddress) {
            addressToUpc[msg.sender].push(upcMeta);
        }

        //require(balanceReceived[msg.sender].totalBalance >= _amount, "Insufficient funds for internal transfer" );

        balanceReceived[msg.sender].totalBalance += _addToBalance;
        Deposit memory deposit = Deposit(_addToBalance, now);
        balanceReceived[msg.sender].deposits[balanceReceived[msg.sender].numPayments] = deposit;
        balanceReceived[msg.sender].numPayments++;
        
        
        
        //rewardGranter = RewardGranter(address1);
        //add this scannable to the rewards array
        //pass the upcHash, total balance, word, starttimestamp, user
        //rewardGranter.addRewardableScannable(upcHash, (currentAmountStaked + _addToBalance), upcId, upcMeta.stakingStartTimestamp, msg.sender);
        //rewardGranter.addGameToScannable(upcHash, gameId);
        //rewardGranter.addIpfsToScannable(upcHash, defaultIpfs);



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


    
    //remove upc from the address to lease structure
    function removeUpcFromA2L(uint index, address sender)  private {
        if (index >= addressToUpc[sender].length) return;

        for (uint i = index; i<addressToUpc[sender].length-1; i++){
            addressToUpc[sender][i] = addressToUpc[sender][i+1];
        }
        delete addressToUpc[sender][addressToUpc[sender].length-1];
        addressToUpc[sender].pop();
    }
    
    
    
    //withdraw function should be the only instance where the scannable is removed from the rewardToScannable structure
    function withdraw(string memory upcId) public {
        bytes32 upcHash = sha256(abi.encodePacked(upcId));
        require(msg.sender == scannables[upcHash].staker, "Only the staker can withdraw funds" );
        
        //uint _coinsToPayBills = this.calculateFee(scannables[upcHash].amountStaked);
        uint toWithdraw = scannables[upcHash].amountStaked;
        address payable _to = msg.sender;
        balanceReceived[msg.sender].totalBalance = 0;
        scannables[upcHash].amountStaked = 0;
        scannables[upcHash].staker = address(0x0);
        
        scannables[upcHash].stakingStartTimestamp = 0;
        scannables[upcHash].word = "";
        scannables[upcHash].gameId = "";
        scannables[upcHash].ipfs = "";

        
        
        
        
        bool doDelete = false;
        uint deleteIndex = 0;
        for(uint i = 0; i< addressToUpc[msg.sender].length; i++) {
            if(addressToUpc[msg.sender][i].upcHash == upcHash) {
                doDelete = true;
                deleteIndex = i;
            }
        }
        
        if(doDelete) {
            removeUpcFromA2L(deleteIndex,msg.sender);
        }
        
        //
        //rewardGranter.removeRewardableScannable(upcHash);

        _to.transfer(toWithdraw);
        //payBills(_coinsToPayBills);

    }
    
}
