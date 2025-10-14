// SPDX-License-Identifier: MIT
pragma solidity >=0.8.20;

import {Script} from "forge-std/Script.sol";
import {Factory} from "../src/Factory.sol";
import {Token} from "../src/Token.sol";
import {console} from "forge-std/console.sol";

contract DeployFactory is Script {
    function run() external returns (Factory) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy Factory with 0.01 ETH fee
        Factory factory = new Factory(0.01 ether);
        
        console.log("Factory deployed at:", address(factory));
        console.log("Factory owner:", factory.owner());
        console.log("Creation fee:", factory.fee());
        
        vm.stopBroadcast();
        
        return factory;
    }
}
