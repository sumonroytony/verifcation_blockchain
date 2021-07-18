pragma solidity ^0.4.24;

contract Verify{
    mapping (uint => string) ipfs;
    
    
    function addPdfLink(uint id, string link) public{
       ipfs[id] = link;
    }
     function getPdfLink(uint id) public view returns (string) {
       return ipfs[id];
   }
   
   
}