// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {Counter} from "../src/Counter.sol";

contract CounterTest is Test {
    Counter public counter;

    function setUp() public {
        counter = new Counter(
            address(this),      // _creator
            "MyToken",          // _name
            "MTK",              // _symbol
            1_000_000 ether     // _totalSupply
        );
    }
    
}
