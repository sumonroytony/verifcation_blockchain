pragma solidity ^0.4.24;

contract Verify{
    mapping (uint8 => bytes32) ipfs;
    
    
    function addPdfLink(uint8 id, bytes32 link) public{
       ipfs[id] = link;
    }
     function getPdfLink(uint8 id) public view returns (bytes32) {
       return ipfs[id];
   }
}