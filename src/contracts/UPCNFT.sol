// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;
pragma experimental ABIEncoderV2;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.4/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.4/contracts/utils/Counters.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.4/contracts/access/Ownable.sol";

contract UPCNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;


    struct NFTMeta {
        uint256  tokenId;
        address  staker;  //address of the staker
        bytes32  upcHash;
        string   word;
        string   ipfs;
        string   humanReadableName;
    }


     
    struct Deposit {
        uint amount;
        uint timestamps;
    }
    
    struct Balance {
        uint                        totalBalance;
        uint                        numPayments;
        mapping(uint => Deposit)    deposits;
    }
    
    mapping(address => Balance)     public balanceReceived;
    mapping(address => NFTMeta[])    public addressToNFTMeta;
    mapping(string => string)    public hashedHumanReadableLookup;
    mapping(bytes32 => string)    public upcHashToDomain;
    
    
    string public defaultIpfs;
    address payable private  bank;
    uint    public totalBalance;
    uint    currentNftPrice;


    

    constructor() ERC721("UPCNFT", "UPCN") Ownable() public {
        bank = msg.sender;
        defaultIpfs = "QmejN35QPpmJXZ55jgVjVU1NgTGwgGg5GufWd81rRCZPF4";
        currentNftPrice = 50000000000000000;
    }
    
    
    function getMyNfts() external view returns(NFTMeta[] memory) {
        return addressToNFTMeta[msg.sender];
    }

    
    function setCurrentNftPrice(uint  _price) external onlyOwner {
        currentNftPrice = _price;
    }

    
    function setOwner(address  _owner) external onlyOwner {
        transferOwnership(_owner);
    }
    
    
    
    function setHumanReadableName(address _staker, bytes32 _upcHash, string memory _humanReadableName) external onlyOwner {
        for (uint i = 0; i<addressToNFTMeta[_staker].length-1; i++){
            bytes32 hashTemp = addressToNFTMeta[_staker][i].upcHash;
            if( hashTemp == _upcHash ) {
                addressToNFTMeta[_staker][i].humanReadableName = _humanReadableName;
                //hashToNFTMeta[_upcHash].humanReadableName = _humanReadableName;
            }
        }
    }

    
    function isAlphanum(string memory str) public pure returns (bool){
        bytes memory b = bytes(str);
        if(b.length > 13) return false;
    
        for(uint i; i<b.length; i++){
            bytes1 char = b[i];
    
            if(
                !(char >= 0x30 && char <= 0x39) && //9-0
                !(char >= 0x41 && char <= 0x5A) && //A-Z
                !(char >= 0x61 && char <= 0x7A) && //a-z
                !(char == 0x2E) &&//.
                !(char == 0x2D) &&//.
                !(char == 0x5F) //.

                
            )
                return false;
        }
    
        return true;
    }


    function mintNft(string memory upcId, string memory humanReadableName) external payable returns (uint256) {

        address staker = msg.sender;
        uint payedPrice = msg.value;
        
        uint remainderAfterPaying = payedPrice - currentNftPrice;
        
        require(payedPrice >= currentNftPrice , "Please send proper price to mint NFT");

        
        bank.transfer(msg.value);
        totalBalance += msg.value;
        

        bytes32 upcHash = sha256(abi.encodePacked(upcId));

        string memory testHumanReadable = hashedHumanReadableLookup[humanReadableName];
        string memory upcExistsTest  = upcHashToDomain[upcHash];

        
        
        bytes memory tempEmptyStringTest = bytes(testHumanReadable); // Uses memory
        bytes memory tempUpcExistTest = bytes(upcExistsTest); // Uses memory

        require(tempUpcExistTest.length == 0  , "Sorry, this UPC already purchased");
        require(tempEmptyStringTest.length  == 0  , "Sorry, this .upc domain is already taken ");  //make sure that the domain has not been registered
        

        if(remainderAfterPaying > 0) {
            balanceReceived[msg.sender].totalBalance += remainderAfterPaying;
            Deposit memory deposit = Deposit(remainderAfterPaying, now);
            balanceReceived[msg.sender].deposits[balanceReceived[msg.sender].numPayments] = deposit;
            balanceReceived[msg.sender].numPayments++; 
        }



        _tokenIds.increment();
        uint256 newNftTokenId = _tokenIds.current();

        NFTMeta memory nftMeta;
        nftMeta.tokenId = newNftTokenId;
        nftMeta.staker = staker;
        nftMeta.upcHash = upcHash;
        nftMeta.word = upcId;
        nftMeta.ipfs = defaultIpfs;
        nftMeta.humanReadableName = humanReadableName;
        
        addressToNFTMeta[staker].push(nftMeta);
        hashedHumanReadableLookup[humanReadableName] = defaultIpfs;
        
        upcHashToDomain[upcHash] = humanReadableName;
        
        _safeMint(staker, newNftTokenId);
        _setTokenURI(newNftTokenId, defaultIpfs);

        return newNftTokenId;
    }
}
