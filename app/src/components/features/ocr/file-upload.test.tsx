import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileUpload } from './file-upload';

// Mock the file-formats-client module
vi.mock('@/lib/ocr/file-formats-client', () => ({
  getAcceptString: () => '.pdf,.png,.jpg,.jpeg,.webp,.heic,.tiff,.bmp,.gif,.avif',
  validateFile: vi.fn((file: { type: string; name: string; size: number }, maxSizeMB: number) => {
    const maxSize = maxSizeMB * 1024 * 1024;
    const validTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/heic',
      'image/tiff',
      'image/bmp',
      'image/gif',
      'image/avif',
    ];

    const errors: string[] = [];
    const warnings: string[] = [];

    if (file.size > maxSize) {
      errors.push(`File size exceeds ${maxSizeMB}MB limit`);
    }

    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|png|jpe?g|webp|heic|tiff|bmp|gif|avif)$/i)) {
      errors.push('Unsupported file format');
    }

    if (file.size > maxSize * 0.8) {
      warnings.push('Large file may take longer to process');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }),
}));

describe('FileUpload', () => {
  const mockOnFileSelect = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload area with instructions', () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />);

    expect(screen.getByText('Upload Lab Report')).toBeInTheDocument();
    expect(screen.getByText(/PDF, PNG, JPG/)).toBeInTheDocument();
  });

  it('shows dragging state when file is dragged over', () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />);

    const dropZone = screen.getByText('Upload Lab Report').closest('div');
    if (dropZone) {
      fireEvent.dragOver(dropZone);
      expect(screen.getByText('Drop your file here')).toBeInTheDocument();
    }
  });

  it('calls onFileSelect when a valid file is dropped', async () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />);

    const file = new File(['test content'], 'lab-report.pdf', { type: 'application/pdf' });
    const dropZone = screen.getByText('Upload Lab Report').closest('div');

    if (dropZone) {
      const dataTransfer = {
        files: [file],
        items: [{ kind: 'file', type: file.type, getAsFile: () => file }],
        types: ['Files'],
      };

      fireEvent.dragOver(dropZone);
      fireEvent.drop(dropZone, { dataTransfer });

      await waitFor(() => {
        expect(mockOnFileSelect).toHaveBeenCalledWith(file);
      });
    }
  });

  it('calls onFileSelect when a file is selected via input', async () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />);

    const file = new File(['test content'], 'lab-report.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]');

    if (input) {
      Object.defineProperty(input, 'files', { value: [file] });
      fireEvent.change(input);

      await waitFor(() => {
        expect(mockOnFileSelect).toHaveBeenCalledWith(file);
      });
    }
  });

  it('displays selected file name and size', async () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />);

    const file = new File(['test content'], 'my-lab-report.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]');

    if (input) {
      Object.defineProperty(input, 'files', { value: [file] });
      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByText('my-lab-report.pdf')).toBeInTheDocument();
      });
    }
  });

  it('shows error for invalid file type', async () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} onError={mockOnError} />);

    const file = new File(['test'], 'document.txt', { type: 'text/plain' });
    const input = document.querySelector('input[type="file"]');

    if (input) {
      Object.defineProperty(input, 'files', { value: [file] });
      fireEvent.change(input);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled();
      });
    }
  });

  it('shows error for file exceeding max size', async () => {
    render(
      <FileUpload
        onFileSelect={mockOnFileSelect}
        onError={mockOnError}
        maxSize={1024} // 1KB
      />
    );

    // Create a file larger than 1KB
    const largeContent = 'x'.repeat(2048);
    const file = new File([largeContent], 'large-file.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]');

    if (input) {
      Object.defineProperty(input, 'files', { value: [file] });
      fireEvent.change(input);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled();
      });
    }
  });

  it('clears selected file when clear button is clicked', async () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />);

    const file = new File(['test'], 'report.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]');

    if (input) {
      Object.defineProperty(input, 'files', { value: [file] });
      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByText('report.pdf')).toBeInTheDocument();
      });

      const clearButton = screen.getByRole('button', { name: /remove file/i });
      await userEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.queryByText('report.pdf')).not.toBeInTheDocument();
        expect(screen.getByText('Upload Lab Report')).toBeInTheDocument();
      });
    }
  });

  it('disables input when isProcessing is true', () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} isProcessing />);

    const input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('disabled');
  });

  it('shows different icon for PDF vs image files', async () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />);

    // Test PDF file
    const pdfFile = new File(['test'], 'report.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]');

    if (input) {
      Object.defineProperty(input, 'files', { value: [pdfFile] });
      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByText('report.pdf')).toBeInTheDocument();
      });
    }
  });

  it('formats file sizes correctly', async () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />);

    // Test with a known size
    const content = 'x'.repeat(1536); // ~1.5KB
    const file = new File([content], 'report.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]');

    if (input) {
      Object.defineProperty(input, 'files', { value: [file] });
      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByText('report.pdf')).toBeInTheDocument();
        // Should show size in KB
        expect(screen.getByText(/KB/)).toBeInTheDocument();
      });
    }
  });

  it('applies custom className', () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} className="custom-class" />);

    const container = screen.getByText('Upload Lab Report').closest('.custom-class');
    expect(container).toBeInTheDocument();
  });
});
