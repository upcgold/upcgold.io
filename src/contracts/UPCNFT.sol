// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

pragma experimental ABIEncoderV2;

import "./openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "./openzeppelin-contracts/contracts/utils/Counters.sol";
import "./openzeppelin-contracts/contracts/access/Ownable.sol";

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
        string   vr;
        string   humanReadableName;
        bool     minted;
    }
    
    struct NFTLookup {
        address  staker;  //address of the staker
        bool     minted;
        bytes32  upcHash;
        string   word;
        string   ipfs;
        string   vr;
        string   humanReadableName;
        uint256  tokenId;
    }    

    
    mapping(string => string)    public hashedHumanReadableLookup;
    mapping(bytes32 => string)    public upcHashToDomain;

    mapping(address => NFTMeta[])    public addressToNFTMeta;
    mapping(address => NFTMeta[])    public nftsToMintByAddress;
    mapping(bytes32 => NFTLookup)    public nftsToMintByHash;
    string public defaultIpfs;
    string public defaultVr;
    address payable private  bank;
    uint    public totalBalance;
    uint256    currentNftPrice;
    xUPC    private _token;

    constructor() ERC721("UPCNFT", "UPCN") Ownable() public {
        bank = payable(msg.sender);
        defaultIpfs = "QmejN35QPpmJXZ55jgVjVU1NgTGwgGg5GufWd81rRCZPF4";
        defaultVr = "https://hubs.mozilla.com/KNWZVgf/austere-carefree-nation";
        currentNftPrice = 1 ether;
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


    function buyNft(string memory upcId, string memory humanReadableName) public {
        
        bytes memory testStr = bytes(humanReadableName); // Uses memory
        require(testStr.length > 0 , "Sorry, this UPC domain is already taken");        
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
        nftMeta.vr = defaultVr;
        nftsToMintByAddress[msg.sender].push(nftMeta);
        
        NFTLookup memory nftLookup;
        nftLookup.tokenId = newNftTokenId;
        nftLookup.minted = false;
        nftLookup.staker = msg.sender;
        
        nftLookup.ipfs = defaultIpfs;
        nftLookup.vr = defaultVr;

        nftsToMintByHash[upcHash] = nftLookup;
    }


    //returns the position in the address array that an nft holds
    function findTokenIndexByAddress(address owner, uint256 tokenId) public payable returns (int) {
        uint i = 0;
        int found = -1;
        for(i = 0; i < nftsToMintByAddress[owner].length; i++) {
            if(nftsToMintByAddress[owner][i].tokenId == tokenId) {
               found = int(i);
            }
        }
        return found;
    }
    
    
    function getVrByUpcId(string memory upcId) public view returns (string memory) {
        bytes32 upcHash = sha256(abi.encodePacked(upcId));
        return nftsToMintByHash[upcHash].vr;
    }
        
    
    function getVrByHash(bytes32 upcHash) public view returns (string memory) {
        return nftsToMintByHash[upcHash].vr;
    }
    
    
    function getIpfsByHash(bytes32 upcHash) public view returns (string memory) {
        return nftsToMintByHash[upcHash].ipfs;
    }    

    function getHumanReadableNameByHash(bytes32 upcHash) public view returns (string memory) {
        return nftsToMintByHash[upcHash].humanReadableName;
    }    


    
    function setVrByHash(bytes32 upcHash, string memory _vr) public {
        require(msg.sender == nftsToMintByHash[upcHash].staker , "Only owner can set VR");
        bytes memory testStr = bytes(_vr); // Uses memory
        require(testStr.length > 0 , "VR value must be set");
        nftsToMintByHash[upcHash].vr = _vr;
    }
    
    
    function setIpfsByHash(bytes32 upcHash, string memory _ipfs) public {
        require(msg.sender == nftsToMintByHash[upcHash].staker , "Only owner can set IPFS");
        
        bytes memory testStr = bytes(_ipfs); // Uses memory

        
        require(testStr.length > 0 , "IPFS value must be set");
        nftsToMintByHash[upcHash].ipfs = _ipfs;
    }    


    function mintNft(string memory upcId) public payable returns (uint256) {

        address staker = msg.sender;
        bytes32 upcHash = sha256(abi.encodePacked(upcId));

        require(msg.sender == nftsToMintByHash[upcHash].staker , "Only owner can mint this nft");
        require(nftsToMintByHash[upcHash].minted == false, "NFT already minted");
    
        uint256 tokenIdToMint = nftsToMintByHash[upcHash].tokenId;
        NFTMeta memory nftToMint;

        int indexToMint = findTokenIndexByAddress(msg.sender, tokenIdToMint);
        

        require(indexToMint >= 0, "Error trying to mint an NFT that is not in range");
        
        //cast the result to a uint
        nftToMint = nftsToMintByAddress[msg.sender][uint(indexToMint)];


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
        nftsToMintByHash[upcHash].staker = msg.sender;
        nftsToMintByHash[upcHash].humanReadableName = nftToMint.humanReadableName;
        
    
        _safeMint(staker, tokenIdToMint);
        //_setTokenURI(tokenIdToMint, defaultIpfs);
        return tokenIdToMint;

    }
}
