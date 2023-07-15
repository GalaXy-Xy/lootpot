import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PoolCard } from '../PoolCard'

const mockPool = {
  address: '0x1234567890123456789012345678901234567890',
  name: 'Test Pool',
  totalPrize: '1000000000000000000', // 1 ETH
  totalParticipants: 5,
  winProbability: 10,
  minParticipation: '10000000000000000', // 0.01 ETH
  timeRemaining: 86400, // 1 day
  isActive: true,
}

const mockOnParticipate = jest.fn()

describe('PoolCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders pool information correctly', () => {
    render(<PoolCard pool={mockPool} onParticipate={mockOnParticipate} />)
    
    expect(screen.getByText('Test Pool')).toBeInTheDocument()
    expect(screen.getByText('1 ETH')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('1 in 10')).toBeInTheDocument()
    expect(screen.getByText('0.01 ETH')).toBeInTheDocument()
    expect(screen.getByText('1d 0h')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('shows participation form for active pools', () => {
    render(<PoolCard pool={mockPool} onParticipate={mockOnParticipate} />)
    
    expect(screen.getByLabelText(/Participation Amount/)).toBeInTheDocument()
    expect(screen.getByText('Participate Now')).toBeInTheDocument()
  })

  it('hides participation form for inactive pools', () => {
    const inactivePool = { ...mockPool, isActive: false }
    render(<PoolCard pool={inactivePool} onParticipate={mockOnParticipate} />)
    
    expect(screen.queryByLabelText(/Participation Amount/)).not.toBeInTheDocument()
    expect(screen.queryByText('Participate Now')).not.toBeInTheDocument()
    expect(screen.getByText('Ended')).toBeInTheDocument()
  })

  it('validates participation amount', async () => {
    render(<PoolCard pool={mockPool} onParticipate={mockOnParticipate} />)
    
    const amountInput = screen.getByLabelText(/Participation Amount/)
    const participateButton = screen.getByText('Participate Now')
    
    // Try with amount below minimum
    fireEvent.change(amountInput, { target: { value: '0.005' } })
    expect(participateButton).toBeDisabled()
    
    // Try with valid amount
    fireEvent.change(amountInput, { target: { value: '0.02' } })
    expect(participateButton).not.toBeDisabled()
  })

  it('calls onParticipate with correct parameters', async () => {
    render(<PoolCard pool={mockPool} onParticipate={mockOnParticipate} />)
    
    const amountInput = screen.getByLabelText(/Participation Amount/)
    const participateButton = screen.getByText('Participate Now')
    
    fireEvent.change(amountInput, { target: { value: '0.02' } })
    fireEvent.click(participateButton)
    
    await waitFor(() => {
      expect(mockOnParticipate).toHaveBeenCalledWith(
        mockPool.address,
        '0.02'
      )
    })
  })

  it('shows loading state during participation', async () => {
    const mockOnParticipateAsync = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )
    
    render(<PoolCard pool={mockPool} onParticipate={mockOnParticipateAsync} />)
    
    const amountInput = screen.getByLabelText(/Participation Amount/)
    const participateButton = screen.getByText('Participate Now')
    
    fireEvent.change(amountInput, { target: { value: '0.02' } })
    fireEvent.click(participateButton)
    
    expect(screen.getByText('Participating...')).toBeInTheDocument()
    expect(participateButton).toBeDisabled()
  })

  it('formats time remaining correctly', () => {
    const poolWithHours = { ...mockPool, timeRemaining: 3600 } // 1 hour
    render(<PoolCard pool={poolWithHours} onParticipate={mockOnParticipate} />)
    
    expect(screen.getByText('1h 0m')).toBeInTheDocument()
  })

  it('shows ended status for expired pools', () => {
    const expiredPool = { ...mockPool, timeRemaining: 0 }
    render(<PoolCard pool={expiredPool} onParticipate={mockOnParticipate} />)
    
    expect(screen.getByText('Ended')).toBeInTheDocument()
  })
})
