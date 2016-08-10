'use strict'

const _ = require('lodash')
const response = require('./input.js')

function groupByBlockNumber(input) {
  return _.groupBy(input, 'blockNumber')
}

const votesGroupedByBlock = groupByBlockNumber(response)

function backfillHistory(input) {

  const keys = Object.keys(input)

  for (let blockNumber in input) {
    const index = keys.indexOf(blockNumber)
    if (index >= 1) {
      keys.slice(index - 1, index).forEach(lastBlock => {
        input[blockNumber] = input[lastBlock].concat(input[blockNumber])
      })
    }
  }

  return input

}

function dedupeTransactions(input) {

  return input.reduce((memo, current) => {

    const previousVote = memo.find(item => {
      return item.from === current.from &&
             item.vote === current.vote
    })

    if (!previousVote) {
      memo.push(current)
    }

    return memo

  }, [])

}

function consolidateHistory(input) {

  const keys = Object.keys(input)

  for (let blockNumber in input) {
    const index = keys.indexOf(blockNumber)
    if (index >= 1) {
      input[blockNumber] = dedupeTransactions(input[blockNumber])
    }
  }

  return input

}

const result = consolidateHistory(backfillHistory(groupByBlockNumber(response)))

console.log(JSON.stringify(result, null, 2))
