pragma solidity ^0.5.16;

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
        bytes32  upcHash;
    }

    
    //declare an array of AddressToLeases
    //each will have the address of the staker and the upcHash/meta

    
    mapping(address  => LeaseMeta[])   public addressToLease;       //pass in the upcId and look up the meta about the upc
    mapping(address => Balance)     public balanceReceived;
    mapping(bytes32  => LeaseMeta)   public scannables;       //pass in the upcId and look up the meta about the upc
    uint public actionPot;

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
    
    function concatenate(bytes32 x, bytes32 y) public pure returns (bytes32 retval ) {
        //retval = bytes32(abi.encodePacked(x, y);
        //return retval;
    }

    
    function getMyScannables() public view returns(bytes32[] memory ) {
        
        bytes32[] memory localScannables = new bytes32[](addressToLease[msg.sender].length);

        for(uint i = 0; i< addressToLease[msg.sender].length; i++) {
            localScannables[i] = addressToLease[msg.sender][i].upcHash;
        }       

        return localScannables;
    }
    
    function getScannableCount() public view returns(uint) {
        return addressToLease[msg.sender].length;
    }
    
    function getCostToEvict(string memory upcId) public view returns(address currentStaker, uint currentAmountStaked, bool currentIsOwned, bytes32 upcHash) {
        upcHash = sha256(abi.encodePacked(upcId));
        currentStaker = scannables[upcHash].staker;
        currentAmountStaked = scannables[upcHash].amountStaked;
        currentIsOwned = scannables[upcHash].isOwned;
    }

    function depositMoney(string memory upcId) public payable {
        bytes32 upcHash = sha256(abi.encodePacked(upcId));
        uint _addToActionPot = this.calculateFee(msg.value);
        uint _addToBalance = msg.value - _addToActionPot; //take eth out to do good with

        //look into registering an unstoppable domain id.  verify on the blockchain that the msg.sender == the owner of the domain
        //(, uint currentAmountStaked ,) = this.getCostToEvict(upcId);
        bool currentIsOwned      = scannables[upcHash].isOwned;
        require(currentIsOwned == false, "Can not stake in an owned code without permission.");

        uint currentAmountStaked = scannables[upcHash].amountStaked;
        
        if(msg.sender != scannables[upcHash].staker) {
            require(_addToBalance > currentAmountStaked, "You must outstake the current stakeholder to win this lease.");
        }
        
        if(msg.sender != scannables[upcHash].staker) {
            uint evictionPrice = evict(upcHash);
            
            //after an eviction, currentAmountStaked should equal zero to make way for the new owner's currentAmountStaked
            currentAmountStaked = scannables[upcHash].amountStaked;
        }

        LeaseMeta memory lm;
        lm.staker = msg.sender;
        lm.amountStaked = currentAmountStaked + _addToBalance;
        lm.isOwned =  false;
        lm.stakingStartTimestamp = now;
        lm.upcHash = upcHash;
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

        address payable _actionPot = address(0x22F23F59A19a5EEd1eE9c546F64CC645B92a4263);
        _actionPot.transfer(_addToActionPot);
        actionPot += _addToActionPot;

    }
    
    function calculateFee(uint amount) external pure returns (uint) {
        require((amount / 10000) * 10000 == amount , 'too small');
        return amount * 200 / 10000;  //2%
    }

    function evict(bytes32 upcHash) private returns (uint) {
        
        uint toWithdraw = scannables[upcHash].amountStaked;
        address payable _to = address(uint160(scannables[upcHash].staker));
        balanceReceived[_to].totalBalance -= toWithdraw;
        scannables[upcHash].amountStaked = 0;
        _to.transfer(toWithdraw);
        return toWithdraw;
    }
    
    function remove(uint index)  private {
        if (index >= addressToLease[msg.sender].length) return;

        for (uint i = index; i<addressToLease[msg.sender].length-1; i++){
            addressToLease[msg.sender][i] = addressToLease[msg.sender][i+1];
        }
        delete addressToLease[msg.sender][addressToLease[msg.sender].length-1];
        addressToLease[msg.sender].length--;
    }
    
    function withdraw(string memory upcId) public {
        bytes32 upcHash = sha256(abi.encodePacked(upcId));
        require(msg.sender == scannables[upcHash].staker, "Only the staker can withdraw funds" );
        
        uint _addToActionPot = this.calculateFee(scannables[upcHash].amountStaked);
        uint toWithdraw = scannables[upcHash].amountStaked - _addToActionPot;
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
            remove(deleteIndex);
        }

        address payable _actionPot = address(0x22F23F59A19a5EEd1eE9c546F64CC645B92a4263);
        _actionPot.transfer(_addToActionPot);
        actionPot += _addToActionPot;

        _to.transfer(toWithdraw);
    }
    
}
