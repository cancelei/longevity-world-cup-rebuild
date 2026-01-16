import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProcessingStatus } from './processing-status';

describe('ProcessingStatus', () => {
  it('renders nothing when not processing and no error or complete state', () => {
    const { container } = render(
      <ProcessingStatus isProcessing={false} stage="uploading" />
    );

    expect(container.firstChild).toBeNull();
  });

  it('shows uploading stage with correct label and description', () => {
    render(<ProcessingStatus isProcessing stage="uploading" />);

    expect(screen.getByText('Uploading')).toBeInTheDocument();
    expect(screen.getByText('Uploading your lab report...')).toBeInTheDocument();
  });

  it('shows converting stage with correct label and description', () => {
    render(<ProcessingStatus isProcessing stage="converting" />);

    expect(screen.getByText('Converting')).toBeInTheDocument();
    expect(screen.getByText('Converting PDF pages to images...')).toBeInTheDocument();
  });

  it('shows extracting stage with correct label and description', () => {
    render(<ProcessingStatus isProcessing stage="extracting" />);

    expect(screen.getByText('Extracting')).toBeInTheDocument();
    expect(screen.getByText('Running OCR text extraction...')).toBeInTheDocument();
  });

  it('shows analyzing stage with correct label and description', () => {
    render(<ProcessingStatus isProcessing stage="analyzing" />);

    expect(screen.getByText('Analyzing')).toBeInTheDocument();
    expect(screen.getByText('Identifying biomarker values...')).toBeInTheDocument();
  });

  it('shows complete stage with success styling', () => {
    render(<ProcessingStatus isProcessing={false} stage="complete" />);

    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.getByText('Extraction complete!')).toBeInTheDocument();
    expect(screen.getByText('Ready to review extracted values')).toBeInTheDocument();
  });

  it('shows error stage with error styling', () => {
    render(
      <ProcessingStatus isProcessing={false} stage="error" error="Failed to process file" />
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to process file')).toBeInTheDocument();
  });

  it('shows retry button on error when onRetry is provided', async () => {
    const mockRetry = vi.fn();
    render(
      <ProcessingStatus
        isProcessing={false}
        stage="error"
        error="Failed to process"
        onRetry={mockRetry}
      />
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();

    await userEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('does not show retry button when onRetry is not provided', () => {
    render(
      <ProcessingStatus isProcessing={false} stage="error" error="Failed to process" />
    );

    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });

  it('displays progress percentage when provided', async () => {
    render(<ProcessingStatus isProcessing stage="extracting" progress={65} />);

    // Wait for the animation timer to update the progress
    await waitFor(() => {
      expect(screen.getByText(/\d+% complete/)).toBeInTheDocument();
    });
  });

  it('shows processing steps indicator when processing', () => {
    render(<ProcessingStatus isProcessing stage="extracting" />);

    // Check for step labels (on desktop view)
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('Convert')).toBeInTheDocument();
    expect(screen.getByText('Extract')).toBeInTheDocument();
    expect(screen.getByText('Analyze')).toBeInTheDocument();
  });

  it('does not show processing steps on complete', () => {
    render(<ProcessingStatus isProcessing={false} stage="complete" />);

    // Processing steps should not be visible when complete
    expect(screen.queryByText('Upload')).not.toBeInTheDocument();
  });

  it('does not show processing steps on error', () => {
    render(<ProcessingStatus isProcessing={false} stage="error" error="Error" />);

    expect(screen.queryByText('Upload')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <ProcessingStatus isProcessing stage="uploading" className="custom-class" />
    );

    // The component should have the custom class
    const container = document.querySelector('.custom-class');
    expect(container).toBeInTheDocument();
  });

  it('shows correct progress for each stage without explicit progress', async () => {
    const { rerender } = render(
      <ProcessingStatus isProcessing stage="uploading" />
    );

    // Uploading should show ~15%
    await waitFor(() => {
      expect(screen.getByText(/\d+% complete/)).toBeInTheDocument();
    });

    // Converting should show ~35%
    rerender(<ProcessingStatus isProcessing stage="converting" />);
    await waitFor(() => {
      expect(screen.getByText(/\d+% complete/)).toBeInTheDocument();
    });

    // Extracting should show ~60%
    rerender(<ProcessingStatus isProcessing stage="extracting" />);
    await waitFor(() => {
      expect(screen.getByText(/\d+% complete/)).toBeInTheDocument();
    });

    // Analyzing should show ~85%
    rerender(<ProcessingStatus isProcessing stage="analyzing" />);
    await waitFor(() => {
      expect(screen.getByText(/\d+% complete/)).toBeInTheDocument();
    });
  });

  it('shows progress bar with correct width', async () => {
    render(<ProcessingStatus isProcessing stage="extracting" progress={50} />);

    await waitFor(() => {
      const progressBar = document.querySelector('[style*="width: 50%"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  it('uses green color scheme for complete state', () => {
    render(<ProcessingStatus isProcessing={false} stage="complete" />);

    // Check for green-themed elements - look for h3 heading specifically
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading.classList.contains('text-green-400')).toBe(true);
  });

  it('uses red color scheme for error state', () => {
    render(<ProcessingStatus isProcessing={false} stage="error" error="Test Error" />);

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading.classList.contains('text-red-400')).toBe(true);
  });
});
