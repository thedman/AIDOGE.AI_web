import { useEffect, useRef, useState } from 'react'
import { useConnect, useConnectors, useDisconnect, useSwitchChain } from 'wagmi'
import { formatUnits } from 'viem'
import { LogOut, Wallet, X } from 'lucide-react'
import { arbitrum } from '../config/chains'
import { useUserAidogeBalance } from '../hooks/useUserAidogeBalance'

export function WalletConnect() {
  const account = useUserAidogeBalance()
  const connectors = useConnectors()
  const connect = useConnect()
  const disconnect = useDisconnect()
  const switchChain = useSwitchChain()
  const dialog = useRef<HTMLDialogElement>(null)
  const [available, setAvailable] = useState<Record<string, boolean>>({})
  useEffect(() => {
    let active = true
    void Promise.all(connectors.map(async connector => [connector.uid, !!await connector.getProvider()] as const))
      .then(entries => { if (active) setAvailable(Object.fromEntries(entries)) })
      .catch(() => { if (active) setAvailable({}) })
    return () => { active = false }
  }, [connectors])
  const shortAddress = account.address ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}` : ''
  const token = account.tokenError ? 'Unavailable' : account.tokenBalance !== undefined && account.decimals !== undefined
    ? formatUnits(account.tokenBalance, account.decimals) : account.tokenLoading ? 'Loading' : 'Unavailable'
  const gas = account.gasError ? 'Unavailable' : account.gasBalance
    ? formatUnits(account.gasBalance.value, account.gasBalance.decimals) : account.gasLoading ? 'Loading' : 'Unavailable'
  const errorMessage = connect.error ? 'Connection declined or unavailable. Try again in your wallet.'
    : switchChain.error ? 'Network switch declined or unavailable. Switch to Arbitrum One in your wallet.'
    : disconnect.error ? 'Disconnect failed. Try again.' : undefined
  return <div className="wallet-control">
    <button className="wallet-trigger" type="button" onClick={() => { connect.reset(); switchChain.reset(); dialog.current?.showModal() }}>
      <Wallet size={18} aria-hidden="true" /><span>{account.isConnected ? shortAddress : account.isReconnecting ? 'Reconnecting' : 'Connect Wallet'}</span>
    </button>
    {account.isConnected && !account.enabled && <div className="network-banner" role="alert">
      <strong>Unsupported Network - Switch to Arbitrum One</strong>
      <button disabled={switchChain.isPending} onClick={() => switchChain.mutate({ chainId: arbitrum.id })}>{switchChain.isPending ? 'Switching...' : 'Switch to Arbitrum One'}</button>
      <button title="Disconnect wallet" aria-label="Disconnect wallet" disabled={disconnect.isPending} onClick={() => disconnect.mutate({ connector: account.connector })}><LogOut size={18} /></button>
      {switchChain.error && <span>Switch declined. Select Arbitrum One in your wallet.</span>}
    </div>}
    <dialog className="wallet-dialog" ref={dialog} aria-labelledby="wallet-title" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close() }}>
      <button className="wallet-close" title="Close account" aria-label="Close account" onClick={() => dialog.current?.close()}><X size={20} /></button>
      <h2 id="wallet-title">{account.isConnected ? 'Your account' : 'Connect wallet'}</h2>
      {!account.isConnected ? <div className="wallet-options">
        {account.isReconnecting && <p role="status">Reconnecting to wallet...</p>}
        {connectors.map(connector => <button className="button button-primary" key={connector.uid} disabled={connect.isPending || account.isReconnecting || !available[connector.uid]} onClick={() => connect.mutate({ connector })}>
          <Wallet size={18} aria-hidden="true" />{connect.isPending && connect.variables?.connector === connector ? 'Connecting...' : `Connect ${connector.name}`}
        </button>)}
        {!connectors.some(connector => available[connector.uid]) && <p role="status">No browser wallet detected. Open this page in a browser with MetaMask, Rabby, or Frame.</p>}
      </div> : <>
        <p className="wallet-address" title={account.address}>{shortAddress}</p>
        {!account.enabled ? <div className="network-warning" role="alert">
          <strong>Unsupported Network - Switch to Arbitrum One</strong>
          <p>Connected chain: {account.chainId ?? 'Unknown'}</p>
          <button className="button button-primary" disabled={switchChain.isPending} onClick={() => switchChain.mutate({ chainId: arbitrum.id })}>{switchChain.isPending ? 'Switching...' : 'Switch to Arbitrum One'}</button>
        </div> : <>
          <p className="wallet-network">Arbitrum One</p>
          <dl className="account-balances"><div><dt>ETH gas balance</dt><dd>{gas}</dd></div><div><dt>AIDOGE balance</dt><dd>{token}</dd></div></dl>
        </>}
        <button className="wallet-disconnect" disabled={disconnect.isPending} onClick={() => { disconnect.mutate({ connector: account.connector }); switchChain.reset(); connect.reset() }}><LogOut size={18} aria-hidden="true" />{disconnect.isPending ? 'Disconnecting...' : 'Disconnect'}</button>
      </>}
      {errorMessage && <p className="wallet-error" role="alert">{errorMessage}</p>}
    </dialog>
  </div>
}
