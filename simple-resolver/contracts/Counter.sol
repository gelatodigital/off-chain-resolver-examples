// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Counter {
    address public immutable ops;
    uint256 public count;
    uint256 public lastExecuted;

    modifier onlyOps() {
        require(msg.sender == ops, "OnlyOps");
        _;
    }

    constructor(address _ops) {
        ops = _ops;
    }

    // solhint-disable not-rely-on-time
    function increaseCount(uint256 amount) external onlyOps {
        require(
            ((block.timestamp - lastExecuted) > 180),
            "Counter: increaseCount: Time not elapsed"
        );

        count += amount;
        lastExecuted = block.timestamp;
    }
}
