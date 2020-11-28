pragma solidity ^0.6.2;
pragma experimental ABIEncoderV2;


contract Permissions { 
 
    bytes32 private currentGuid = "96320a6545aa4d0d29427a9929be3f0a";
    struct ClientMode {
        address client;
        uint timestamp;
        bytes32 hash;
    }
 
    mapping(address => ClientMode)     public clients;
    address public owner;
    
    //use block100 modifier to control access to the payout function
    modifier ownerGuid() {
        require( owner == msg.sender , "Error: Only owner can see the guid");
        _;
    }

    constructor () public {
        owner = msg.sender;
    }
    
    
    
    function getGuid() public ownerGuid view returns(bytes32) {
        return currentGuid;
    }
        
    
    function isClient() public view returns(uint) {
        return clients[msg.sender].timestamp;
    }
    
    
    function addClient(address addy) public {
        require(msg.sender == owner , "Only owner can add client.");
        currentGuid = sha256(abi.encodePacked(currentGuid));
        ClientMode memory cm = ClientMode(addy, now, currentGuid);
        clients[addy] = cm;
    }

}
