// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;
pragma experimental ABIEncoderV2;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.4/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.4/contracts/utils/Counters.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.4/contracts/access/Ownable.sol";

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

    
    mapping(string => string)    public hashedHumanReadableLookup;
    mapping(bytes32 => string)    public upcHashToDomain;


    /**
     * override(ERC721, ERC721Enumerable, ERC721Pausable) 
     * here you're overriding _beforeTokenTransfer method of
     * three Base classes namely ERC721, ERC721Enumerable, ERC721Pausable
     * */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal
      override(ERC721) {
        super._beforeTokenTransfer(from, to, tokenId);
        //if(nftsToMintByAddress[from])
        /*
        NFTMeta memory toTransfer;

        toTransfer = addressToNFTMeta[from][tokenId];
        
        //before transferring a token, delete from original address position to the new owner's address position
        delete addressToNFTMeta[from][tokenId];
        toTransfer.staker = to;
        addressToNFTMeta[to][tokenId] = toTransfer;
   
        //before transferring a token, delete from original address position to the new owner's address position
        delete nftsToMintByAddress[from][tokenId];
        nftsToMintByAddress[to][tokenId] = toTransfer;        
        */
    }


    mapping(address => NFTMeta[])    public addressToNFTMeta;
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

    function mintNft(string memory upcId) public payable returns (uint256) {

        address staker = msg.sender;
        bytes32 upcHash = sha256(abi.encodePacked(upcId));

        require(msg.sender == nftsToMintByHash[upcHash].staker , "Only owner can mint this nft");
        require(nftsToMintByHash[upcHash].minted == false, "NFT already minted");
    
        uint256 tokenIdToMint = nftsToMintByHash[upcHash].tokenId;
        NFTMeta memory nftToMint;

        int indexToMint = findTokenIndexByAddress(msg.sender, tokenIdToMint);
        

        require(indexToMint > 0, "Error trying to mint an NFT that is not in range");
        
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

        
        _safeMint(staker, tokenIdToMint);
        _setTokenURI(tokenIdToMint, defaultIpfs);
        return tokenIdToMint;

    }
}
