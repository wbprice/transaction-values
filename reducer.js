'use strict'

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
