pragma solidity ^0.5.16;

contract UPCGoldBank {
    
    
    struct Deposit {
        uint amount;
        uint timestamps;
    }
    
    struct Balance {
        uint totalBalance;
        uint numPayments;
        mapping(uint => Deposit) deposits;
    }
    
    mapping(address => Balance) public balanceReceived;
    
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
    
    function depositMoney() public payable {
        balanceReceived[msg.sender].totalBalance += msg.value;
        
        Deposit memory deposit = Deposit(msg.value, now);
        balanceReceived[msg.sender].deposits[balanceReceived[msg.sender].numPayments] = deposit;
        balanceReceived[msg.sender].numPayments++;
    }
    
    function withdraw() public {
        
        uint toWithdraw = balanceReceived[msg.sender].totalBalance;
        address payable _to = msg.sender;
        balanceReceived[msg.sender].totalBalance = 0;
        _to.transfer(toWithdraw);
    }
    
}
