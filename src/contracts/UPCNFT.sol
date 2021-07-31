// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;
pragma experimental ABIEncoderV2;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.4/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.4/contracts/utils/Counters.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.4/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.4/contracts/token/ERC20/IERC20.sol";

import "./xUPC.sol";

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
        bool     minted;
    }
    
    struct NFTLookup {
        uint256  tokenId;
        bool     minted;
        address  staker;  //address of the staker
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
    
    
    mapping(address => NFTMeta[])    public nftsToMintByAddress;
    mapping(bytes32 => NFTLookup)    public nftsToMintByHash;

    
    
    string public defaultIpfs;
    address payable private  bank;

    uint    public totalBalance;
    uint256    currentNftPrice;
    xUPC    private _token;



    constructor() ERC721("UPCNFT", "UPCN") Ownable() public {
        bank = msg.sender;
        defaultIpfs = "QmejN35QPpmJXZ55jgVjVU1NgTGwgGg5GufWd81rRCZPF4";
        currentNftPrice = 1 ether;
    }
    

        
    function getTotalCurrency() external view  returns(uint256) {
        return _token.totalSupply();
    }



    function setPayToken(address  addy) external onlyOwner {
        _token = xUPC(addy);
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

    
    function approvePurchase() public {
        _token.approve(address(this), currentNftPrice);
    }
    

    
    function buyNft(string memory upcId, string memory humanReadableName) public {
        _token.transferFrom(msg.sender, address(this), currentNftPrice);
        bytes32 upcHash = sha256(abi.encodePacked(upcId));
        _tokenIds.increment();
        uint256 newNftTokenId = _tokenIds.current();
        
        //add the metadata to the array to alert that an nft is available for minting
        NFTMeta memory nftMeta;
        nftMeta.tokenId = newNftTokenId;
        nftMeta.staker = msg.sender;
        nftMeta.upcHash = upcHash;
        nftMeta.word = upcId;
        nftMeta.ipfs = defaultIpfs;
        nftMeta.humanReadableName = humanReadableName;
        nftMeta.minted = false;
        nftsToMintByAddress[msg.sender].push(nftMeta);
        
        
        NFTLookup memory nftLookup;
        nftLookup.tokenId = newNftTokenId;
        nftLookup.minted = false;
        nftLookup.staker = msg.sender;
        nftsToMintByHash[upcHash] = nftLookup;
    }
    
    

    function mintNft(string memory upcId) public payable returns (uint256) {

        address staker = msg.sender;
        bytes32 upcHash = sha256(abi.encodePacked(upcId));

        require(msg.sender == nftsToMintByHash[upcHash].staker , "Only owner can mint this nft");
        require(nftsToMintByHash[upcHash].minted == false, "NFT already minted");
    
        uint256 tokenIdToMint = nftsToMintByHash[upcHash].tokenId;
        NFTMeta memory nftToMint;

        for(uint i = 0; i < nftsToMintByAddress[msg.sender].length; i++) {
            if(nftsToMintByAddress[msg.sender][i].tokenId == tokenIdToMint) {
               nftToMint = nftsToMintByAddress[msg.sender][i];
            }
        }
        

        
        NFTMeta memory nftMeta;
        nftMeta.tokenId = nftToMint.tokenId;
        nftMeta.staker = nftToMint.staker;
        nftMeta.upcHash = nftToMint.upcHash;
        nftMeta.word = nftToMint.word;
        nftMeta.ipfs = nftToMint.ipfs;
        nftMeta.humanReadableName = nftToMint.humanReadableName;
        
        addressToNFTMeta[staker].push(nftMeta);
        hashedHumanReadableLookup[nftToMint.humanReadableName] = defaultIpfs;
        
        upcHashToDomain[upcHash] = nftToMint.humanReadableName;
        
        //update this upc as minted
        nftsToMintByHash[upcHash].minted = true;

        
        
        _safeMint(staker, tokenIdToMint);
        _setTokenURI(tokenIdToMint, defaultIpfs);

        return tokenIdToMint;

    }
}
