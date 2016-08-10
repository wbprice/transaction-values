'use strict'

const assert = require('assert')
const _ = require('lodash')
const response = require('./input.js')

function groupByBlockNumber(input) {
  return _.groupBy(input, 'blockNumber')
}

function backfillHistory(input) {
  const keys = Object.keys(input)
  for (let blockNumber in input) {
    const index = keys.indexOf(blockNumber)
    if (index >= 1) {
      keys.slice(index - 1, index).forEach(lastBlock => {
        input[blockNumber] = dedupeTransactions(input[lastBlock].concat(input[blockNumber]))
      })
    }
  }
  return input
}

function dedupeTransactions(input) {
  let output = []
  const grouped = _.groupBy(input, 'from')
  for (let address in grouped) {
    output = [
      ...output,
      ...grouped[address].slice(-1)
    ]
  }
  return output
}

function calculateSignal(input) {

  let output = []

  for (let address in input) {
    input[address] = input[address].reduce((memo, current) => {
      if (current.vote === '1') memo.pro.push(current)
      if (current.vote === '0') memo.against.push(current)
      return memo
    }, {blockNumber: address, pro: [], against: []})
    output.push(input[address])
  }

  output = output.map(block => {
    block.pro = block.pro.reduce((memo, block) => {
      memo += Number(block.signal)
      return memo
    }, 0)
    block.against = block.against.reduce((memo, block) => {
      memo -= Number(block.signal)
      return memo
    }, 0)
    return block
  })

  return output

}

const result = calculateSignal(backfillHistory(groupByBlockNumber(response)))

console.log(JSON.stringify(result, null, 2))

/**
 * Tests
 **/

// At block 1, there should be negative signal of 15
assert.equal(result[0].pro, 0)
assert.equal(result[0].against, -15)

// At block 2, there should be negative signal of 15
assert.equal(result[1].pro, 0)
assert.equal(result[1].against, -15)

// At block 3, there should be negative signal of 15
// At block 3, there should be positive signal of 30
assert.equal(result[2].pro, 30)
assert.equal(result[2].against, -15)

// At block 4, there should be negative signal of 35
// At block 4, there should be positive signal of 10
assert.equal(result[3].pro, 10)
assert.equal(result[3].against, -35)

// At block 5, there should be negative signal of 15
// At block 5, there should be positive signal of 30
assert.equal(result[4].pro, 30)
assert.equal(result[4].against, -15)

// At block 6, there should be negative signal of 15
// At block 6, there should be positive signal of 30
assert.equal(result[5].pro, 30)
assert.equal(result[5].against, -15)

// At block 7, there should be negative signal of 15
// At block 7, there should be positive signal of 30
assert.equal(result[6].pro, 30)
assert.equal(result[6].against, -15)

// At block 8, there should be negative signal of 15
// At block 8, there should be positive signal of 30
assert.equal(result[7].pro, 30)
assert.equal(result[7].against, -15)
