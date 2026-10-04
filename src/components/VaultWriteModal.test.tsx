// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { VaultWriteModal } from './VaultWriteModal'
import { calculateEarlyWithdrawPenalty } from '../utils/vaultCalculator'
const inspect = vi.fn()
vi.mock('wagmi', () => ({ useConnection: () => ({ address: '0x1111111111111111111111111111111111111111', chainId: 42161 }) }))
vi.mock('../hooks/useVaultPositions', () => ({ useVaultPositions: () => ({ data: { positions: [{ name: 'AIDOGE', principal: 1000000000n, end: 2000000000n, expired: false }] } }) }))
vi.mock('../hooks/useVaultWriteProtection', () => ({ useVaultWriteProtection: () => ({ enabled: true, pending: false, error: '', reset: vi.fn(), inspect, review: { blockNumber: 42n, math: calculateEarlyWithdrawPenalty(1000000000n, 604799n, 0n) } }) }))
HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
afterEach(() => { cleanup(); inspect.mockClear() })
it('cannot unlock a transaction even when the user acknowledges a successful review', () => {
  render(<VaultWriteModal />)
  fireEvent.click(screen.getByRole('button', { name: 'Early exit review (HOLD)' }))
  fireEvent.click(screen.getByRole('checkbox'))
  expect((screen.getByRole('button', { name: 'Transaction unavailable - HOLD' }) as HTMLButtonElement).disabled).toBe(true)
  expect(screen.getByText(/The contract does not enforce this minimum/)).toBeTruthy()
})
it('rejects excess precision rather than silently rounding calldata', () => {
  render(<VaultWriteModal />)
  fireEvent.click(screen.getByRole('button', { name: 'Early exit review (HOLD)' }))
  fireEvent.change(screen.getByLabelText('Gross principal (AIDOGE)'), { target: { value: '1.0000001' } })
  fireEvent.change(screen.getByLabelText('Advisory minimum (AIDOGE)'), { target: { value: '0' } })
  fireEvent.click(screen.getByRole('button', { name: 'Run read-only review' }))
  expect(inspect).not.toHaveBeenCalled()
  expect(screen.getByRole('alert').textContent).toContain('six decimals')
})
it('uses locked principal for amount presets without defaulting the minimum', () => {
  render(<VaultWriteModal />)
  fireEvent.click(screen.getByRole('button', { name: 'Early exit review (HOLD)' }))
  fireEvent.change(screen.getByLabelText('Withdrawal amount'), { target: { value: '25' } })
  expect((screen.getByLabelText('Gross principal (AIDOGE)') as HTMLInputElement).value).toBe('250')
  expect((screen.getByLabelText('Advisory minimum (AIDOGE)') as HTMLInputElement).value).toBe('')
  expect(inspect).toHaveBeenCalledWith(250000000n, 0n)
})
it('offers exact bigint minimum suggestions from the nominal return', () => {
  render(<VaultWriteModal />)
  fireEvent.click(screen.getByRole('button', { name: 'Early exit review (HOLD)' }))
  fireEvent.change(screen.getByLabelText('Withdrawal amount'), { target: { value: '100' } })
  fireEvent.change(screen.getByLabelText('Minimum suggestion'), { target: { value: '99' } })
  expect((screen.getByLabelText('Advisory minimum (AIDOGE)') as HTMLInputElement).value).toBe('980.496')
  fireEvent.change(screen.getByLabelText('Withdrawal amount'), { target: { value: '50' } })
  expect((screen.getByLabelText('Minimum suggestion') as HTMLSelectElement).value).toBe('')
})
