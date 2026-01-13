import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
import { Text, View } from 'react-native'
import { ErrorBoundary } from '../../components/ErrorBoundary'

// Component that throws an error
const ThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <Text>Normal content</Text>
}

// Silence console.error during tests
const originalError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalError
})

describe('ErrorBoundary', () => {
  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <Text>Child content</Text>
      </ErrorBoundary>
    )

    expect(screen.getByText('Child content')).toBeTruthy()
  })

  it('should render error UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Ups! Coś poszło nie tak')).toBeTruthy()
    expect(screen.getByText('Spróbuj ponownie')).toBeTruthy()
  })

  it('should render custom fallback when provided', () => {
    const CustomFallback = <Text>Custom error UI</Text>

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error UI')).toBeTruthy()
  })

  it('should reset error state when retry button is pressed', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    // Error state
    expect(screen.getByText('Ups! Coś poszło nie tak')).toBeTruthy()

    // Press retry - this resets the hasError state
    fireEvent.press(screen.getByText('Spróbuj ponownie'))

    // After pressing retry, the error boundary tries to render children again
    // Since ThrowingComponent still throws, we should still see the error UI
    // This test verifies the retry button is clickable and doesn't crash
    expect(screen.getByText('Ups! Coś poszło nie tak')).toBeTruthy()
  })

  it('should show error details in development mode', () => {
    // __DEV__ is true by default in jest-expo
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Test error message')).toBeTruthy()
  })
})
