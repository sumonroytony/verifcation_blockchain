pragma solidity ^0.4.26;

contract Verify{
    mapping (uint8 => bytes32) ipfs;
    function addPdfLink(uint8 id, bytes32 link) public{ 
        ipfs[id] = link;
    }
     function getPdfLink(uint8 id) public view returns (bytes32) {
       return ipfs[id];
   } 
   function sendViaCall(address  _to) public payable {
       _to.transfer(msg.value);
   }   
   
  }
     
   