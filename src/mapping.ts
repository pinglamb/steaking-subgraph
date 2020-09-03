import { BigInt, BigDecimal } from "@graphprotocol/graph-ts"
import { Contract, Staked, Unstaked } from "../generated/Contract/Contract"
import { Staking, Staker, Stake } from "../generated/schema"

const STAKING_ADDRESS = '0x70551c66E8De5Edc44CC8f39d12BDBf63fBeF14f'
let ZERO_BD = BigDecimal.fromString('0')

function convertEthToDecimal(eth: BigInt): BigDecimal {
  return eth.toBigDecimal().div(BigDecimal.fromString('1000000000000000000'))
}

export function handleStaked(event: Staked): void {
  let staking = Staking.load(STAKING_ADDRESS)
  if (staking == null) {
    staking = new Staking(STAKING_ADDRESS)
    staking.stakerCount = 0
    staking.stakeCount = 0
    staking.totalStaked = ZERO_BD
  }

  let staker = Staker.load(event.params.user.toHexString())
  if (staker == null) {
    staker = new Staker(event.params.user.toHexString())
    staker.stakeCount = 0
    staker.totalStaked = ZERO_BD

    staking.stakerCount = staking.stakerCount + 1
  }

  let stake = new Stake(event.transaction.hash.toHexString())
  stake.staker = staker!.id
  stake.amount = convertEthToDecimal(event.params.amount)
  stake.save()

  staker.stakeCount = staker.stakeCount + 1
  staker.totalStaked = convertEthToDecimal(event.params.total)
  staker.save()

  staking.stakeCount = staking.stakeCount + 1
  staking.totalStaked = staking.totalStaked + stake.amount
  staking.save()

  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.getPersonalStakeUnlockedTimestamps(...)
  // - contract.getPersonalStakes(...)
  // - contract.totalStakedFor(...)
  // - contract.getPersonalStakeActualAmounts(...)
  // - contract.supportsHistory(...)
  // - contract.getPersonalStakeForAddresses(...)
  // - contract.totalStaked(...)
  // - contract.stakeHolders(...)
  // - contract.defaultLockInDuration(...)
  // - contract.token(...)
}

export function handleUnstaked(event: Unstaked): void {}
