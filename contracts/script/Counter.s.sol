// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import {Script} from "forge-std/Script.sol";
import {Counter} from "../src/Counter.sol";

contract CounterScript is Script {
    Counter public counter;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        // Deploy Counter with proper constructor arguments
        
        counter = new Counter(
            msg.sender,      // _creator
            "MyToken",       // _name
            "MTK",           // _symbol
            1_000_000 ether  // _totalSupply
        );

        vm.stopBroadcast();
    }
}
