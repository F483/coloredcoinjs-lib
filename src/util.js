var _ = require('lodash')

var bitcoin = require('./bitcoin')
var verify = require('./verify')


/**
 * @param {number} n
 * @param {number} [bits=32]
 * @return {number[]}
 */
function number2bitArray(n, bits) {
  if (_.isUndefined(bits)) { bits = 32 }

  verify.number(n)
  verify.number(bits)

  return _.range(bits).map(function (shift) { return (n >> shift) & 1 })
}

/**
 * @param {number[]} bits
 * @return {number}
 */
function bitArray2number(bits) {
  verify.array(bits)
  bits.forEach(verify.number)

  return bits.reduce(function (result, value, index) {
    return value === 0 ? result : result + Math.pow(2, index)
  }, 0)
}

/**
 * @typedef {Object} AbstractTarget
 * @property {function} getColorDefinition Return ColorDefiniton for target
 * @property {function} getColorId Return colorId of ColorDefiniton for target
 */

/**
 * Group targets by ColorId or return error if target is not uncolored
 *  or not instance of targetCls
 *
 * @param {AbstractTarget[]} targets
 * @param {function} targetCls ColorDefinition constructor for filter targets
 * @return {{colorId1: AbstractTarget[], colorIdN: AbstractTarget[]}}
 * @throws {Error} If ColorDefinition not Uncolored and not targetCls
 */
function groupTargetsByColor(targets, targetCls) {
  verify.array(targets)
  verify.function(targetCls)

  var targetsByColor = {}
  targets.forEach(function (target) {
    var colorDefinition = target.getColorDefinition()

    var UncoloredColorDefinition = require('./UncoloredColorDefinition')
    var isUncoloredCls = colorDefinition instanceof UncoloredColorDefinition
    var isTargetCls = colorDefinition instanceof targetCls

    if (isUncoloredCls || isTargetCls) {
      var colorId = target.getColorId()

      if (_.isUndefined(targetsByColor[colorId])) {
        targetsByColor[colorId] = []
      }

      targetsByColor[colorId].push(target)

      return
    }

    throw new Error('Incompatible color definition')
  })

  return targetsByColor
}

/**
 * @param {string} address
 * @return {bitcoinjs-lib.Script}
 */
function address2script(address) {
  verify.string(address)

  return bitcoin.Address.fromBase58Check(address).toOutputScript()
}


module.exports = {
  number2bitArray: number2bitArray,
  bitArray2number: bitArray2number,

  groupTargetsByColor: groupTargetsByColor,

  address2script: address2script
}
