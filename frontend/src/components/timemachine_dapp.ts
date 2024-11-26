/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/timemachine_dapp.json`.
 */
export type TimemachineDapp = {
    "address": "EGVnVqs8pzjUFxjrovN9jsjipUGKh9J2g9vTtBZnaVBV",
    "metadata": {
      "name": "timemachineDapp",
      "version": "0.1.0",
      "spec": "0.1.0",
      "description": "Created with Anchor"
    },
    "instructions": [
      {
        "name": "createLetter",
        "discriminator": [
          105,
          124,
          226,
          159,
          194,
          16,
          57,
          90
        ],
        "accounts": [
          {
            "name": "letterAuthor",
            "writable": true,
            "signer": true
          },
          {
            "name": "letter",
            "writable": true
          },
          {
            "name": "capsule",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "capsule.open_date [.. MAX_DATE_LENGTH as usize]",
                  "account": "capsule"
                },
                {
                  "kind": "const",
                  "value": [
                    67,
                    65,
                    80,
                    83,
                    85,
                    76,
                    69,
                    95,
                    83,
                    69,
                    69,
                    68
                  ]
                },
                {
                  "kind": "account",
                  "path": "capsule.capsule_author",
                  "account": "capsule"
                }
              ]
            }
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "letterContent",
            "type": "string"
          }
        ]
      },
      {
        "name": "initialize",
        "discriminator": [
          175,
          175,
          109,
          31,
          13,
          152,
          155,
          237
        ],
        "accounts": [
          {
            "name": "capsuleAuthority",
            "writable": true,
            "signer": true
          },
          {
            "name": "capsule",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "arg",
                  "path": "openDate"
                },
                {
                  "kind": "const",
                  "value": [
                    67,
                    65,
                    80,
                    83,
                    85,
                    76,
                    69,
                    95,
                    83,
                    69,
                    69,
                    68
                  ]
                },
                {
                  "kind": "account",
                  "path": "capsuleAuthority"
                }
              ]
            }
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "openDate",
            "type": "string"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "capsule",
        "discriminator": [
          212,
          231,
          77,
          219,
          58,
          13,
          118,
          241
        ]
      },
      {
        "name": "letter",
        "discriminator": [
          209,
          169,
          19,
          117,
          140,
          190,
          145,
          212
        ]
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "capsuleClosed",
        "msg": "Capsule closed, wait more years to open."
      },
      {
        "code": 6001,
        "name": "letterTooLong",
        "msg": "Your letter is too long for the machine."
      },
      {
        "code": 6002,
        "name": "maximumLetterReached",
        "msg": "Sorry, this machine does not fit any more letter."
      }
    ],
    "types": [
      {
        "name": "capsule",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "capsuleAuthor",
              "type": "pubkey"
            },
            {
              "name": "openDate",
              "type": {
                "array": [
                  "u8",
                  10
                ]
              }
            },
            {
              "name": "letterCount",
              "type": "u8"
            },
            {
              "name": "bump",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "letter",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "letterAuthor",
              "type": "pubkey"
            },
            {
              "name": "capsule",
              "type": "pubkey"
            },
            {
              "name": "content",
              "type": {
                "array": [
                  "u8",
                  500
                ]
              }
            },
            {
              "name": "contentLength",
              "type": "u16"
            },
            {
              "name": "bump",
              "type": "u8"
            }
          ]
        }
      }
    ]
  };
  