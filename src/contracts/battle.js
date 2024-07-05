const json = {
  AddressSepolia: "0xc093178402300b4b2deceD9A78d49dA04645D6c4",
  Abi: [
    {
      inputs: [
        {
          internalType: "uint256",
          name: "count",
          type: "uint256",
        },
      ],
      name: "addDummy",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "battle",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "deleteDummy",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "initialOwner",
          type: "address",
        },
        {
          internalType: "address",
          name: "_dragonContract",
          type: "address",
        },
        {
          internalType: "address",
          name: "_questContract",
          type: "address",
        },
        {
          internalType: "address",
          name: "_drinkContract",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
      ],
      name: "OwnableInvalidOwner",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "OwnableUnauthorizedAccount",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "regiBattle",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "limit",
          type: "uint256",
        },
      ],
      name: "setDailyBattleLimit",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "unregiBattle",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "upgradeDragon",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "battleReward",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "dailyBattleLimit",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "dragonContract",
      outputs: [
        {
          internalType: "contract IToken",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "drinkContract",
      outputs: [
        {
          internalType: "contract IDragonDrink",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "getBattleRecord",
      outputs: [
        {
          internalType: "uint256",
          name: "win",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "lose",
          type: "uint256",
        },
        {
          components: [
            {
              components: [
                {
                  internalType: "uint256",
                  name: "tokenId",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "attack",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "defense",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "health",
                  type: "uint256",
                },
              ],
              internalType: "struct Battle.Dragon",
              name: "dragon",
              type: "tuple",
            },
            {
              internalType: "bool",
              name: "winStatus",
              type: "bool",
            },
          ],
          internalType: "struct Battle.OpponentRecord[]",
          name: "opponents",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "getDragonStatus",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "tokenId",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "attack",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "defense",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "health",
              type: "uint256",
            },
          ],
          internalType: "struct Battle.Dragon",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "player",
          type: "address",
        },
      ],
      name: "getPlayerRecords",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "win",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "lose",
              type: "uint256",
            },
            {
              components: [
                {
                  components: [
                    {
                      internalType: "uint256",
                      name: "tokenId",
                      type: "uint256",
                    },
                    {
                      internalType: "uint256",
                      name: "attack",
                      type: "uint256",
                    },
                    {
                      internalType: "uint256",
                      name: "defense",
                      type: "uint256",
                    },
                    {
                      internalType: "uint256",
                      name: "health",
                      type: "uint256",
                    },
                  ],
                  internalType: "struct Battle.Dragon",
                  name: "dragon",
                  type: "tuple",
                },
                {
                  internalType: "bool",
                  name: "winStatus",
                  type: "bool",
                },
              ],
              internalType: "struct Battle.OpponentRecord[]",
              name: "opponents",
              type: "tuple[]",
            },
          ],
          internalType: "struct Battle.BattleRecord",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "questContract",
      outputs: [
        {
          internalType: "contract IQuest",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "upgradePrice",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
};

export default json;
