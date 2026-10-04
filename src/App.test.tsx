import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('wagmi', () => ({ useConnection: () => ({ isConnected: false }) }))
vi.mock('./components/TokenDashboard', () => ({ TokenDashboard: () => <section data-testid="overview" /> }))
vi.mock('./components/ContractMatrix', () => ({ ContractMatrix: () => <div data-testid="matrix" /> }))
vi.mock('./components/WalletConnect', () => ({ WalletConnect: ({ openRequest }: { openRequest: number }) => <div data-testid="wallet-request">{openRequest}</div> }))
vi.mock('./components/VaultDashboard', () => ({ VaultDashboard: ({ onConnect }: { onConnect: () => void }) => <section data-testid="workspace"><button onClick={onConnect}>Connect positions</button></section> }))
afterEach(cleanup)

it('prioritizes overview and wallet workspace before the matrix and history', () => {
  const { container } = render(<App />)
  const main = container.querySelector('main')!
  expect(main.children[0]).toBe(screen.getByTestId('overview'))
  expect(main.children[1]).toBe(screen.getByTestId('workspace'))
  expect(main.children[2].contains(screen.getByTestId('matrix'))).toBe(true)
})

it('routes the workspace connect action to the existing wallet control', () => {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Connect positions' }))
  expect(screen.getByTestId('wallet-request').textContent).toBe('1')
})
// @vitest-environment jsdom
