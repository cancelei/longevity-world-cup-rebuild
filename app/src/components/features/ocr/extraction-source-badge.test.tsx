import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  ExtractionSourceBadge,
  ExtractionSourceBadgeFull,
  ExtractionSourceInline,
} from './extraction-source-badge';

describe('ExtractionSourceBadge', () => {
  describe('source: ocr', () => {
    it('renders OCR badge with correct label', () => {
      render(<ExtractionSourceBadge source="ocr" />);

      expect(screen.getByText('OCR')).toBeInTheDocument();
    });

    it('renders OCR badge with icon', () => {
      render(<ExtractionSourceBadge source="ocr" />);

      // Badge uses div element, should contain an SVG icon
      const badge = screen.getByText('OCR').parentElement;
      expect(badge?.querySelector('svg')).toBeInTheDocument();
    });

    it('has correct title for tooltip', () => {
      render(<ExtractionSourceBadge source="ocr" />);

      // Badge uses div element
      const badge = screen.getByTitle('Automatically extracted from your uploaded document');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('source: manual', () => {
    it('renders Manual badge with correct label', () => {
      render(<ExtractionSourceBadge source="manual" />);

      expect(screen.getByText('Manual')).toBeInTheDocument();
    });

    it('has correct title for tooltip', () => {
      render(<ExtractionSourceBadge source="manual" />);

      const badge = screen.getByTitle('Manually entered by you');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('source: ocr_edited', () => {
    it('renders Edited badge with correct label', () => {
      render(<ExtractionSourceBadge source="ocr_edited" />);

      expect(screen.getByText('Edited')).toBeInTheDocument();
    });

    it('has correct title for tooltip', () => {
      render(<ExtractionSourceBadge source="ocr_edited" />);

      const badge = screen.getByTitle('Auto-extracted then manually edited');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('showLabel prop', () => {
    it('shows label when showLabel is true', () => {
      render(<ExtractionSourceBadge source="ocr" showLabel />);

      expect(screen.getByText('OCR')).toBeInTheDocument();
    });

    it('hides label when showLabel is false', () => {
      render(<ExtractionSourceBadge source="ocr" showLabel={false} />);

      expect(screen.queryByText('OCR')).not.toBeInTheDocument();
    });

    it('still shows icon when label is hidden', () => {
      render(<ExtractionSourceBadge source="ocr" showLabel={false} />);

      // Should still have the badge with icon
      const badge = screen.getByTitle('Automatically extracted from your uploaded document');
      expect(badge?.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('className prop', () => {
    it('applies custom className', () => {
      render(<ExtractionSourceBadge source="ocr" className="custom-badge" />);

      // Badge component uses div, so look for div with custom class
      const badge = screen.getByTitle('Automatically extracted from your uploaded document');
      expect(badge.classList.contains('custom-badge')).toBe(true);
    });
  });
});

describe('ExtractionSourceBadgeFull', () => {
  it('renders full label for OCR source', () => {
    render(<ExtractionSourceBadgeFull source="ocr" />);

    expect(screen.getByText('Auto-extracted')).toBeInTheDocument();
  });

  it('renders full label for manual source', () => {
    render(<ExtractionSourceBadgeFull source="manual" />);

    expect(screen.getByText('Manual entry')).toBeInTheDocument();
  });

  it('renders full label for edited source', () => {
    render(<ExtractionSourceBadgeFull source="ocr_edited" />);

    expect(screen.getByText('Edited')).toBeInTheDocument();
  });

  it('includes icon in full badge', () => {
    render(<ExtractionSourceBadgeFull source="ocr" />);

    // Badge uses div element
    const badge = screen.getByTitle('Automatically extracted from your uploaded document');
    expect(badge?.querySelector('svg')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ExtractionSourceBadgeFull source="ocr" className="custom-full-badge" />);

    // Badge component uses div
    const badge = screen.getByTitle('Automatically extracted from your uploaded document');
    expect(badge.classList.contains('custom-full-badge')).toBe(true);
  });
});

describe('ExtractionSourceInline', () => {
  it('renders inline indicator for OCR source', () => {
    render(<ExtractionSourceInline source="ocr" />);

    // Inline version only shows icon, not text
    const indicator = screen.getByTitle('Automatically extracted from your uploaded document');
    expect(indicator).toBeInTheDocument();
    expect(indicator.querySelector('svg')).toBeInTheDocument();
  });

  it('renders inline indicator for manual source', () => {
    render(<ExtractionSourceInline source="manual" />);

    const indicator = screen.getByTitle('Manually entered by you');
    expect(indicator).toBeInTheDocument();
  });

  it('renders inline indicator for edited source', () => {
    render(<ExtractionSourceInline source="ocr_edited" />);

    const indicator = screen.getByTitle('Auto-extracted then manually edited');
    expect(indicator).toBeInTheDocument();
  });

  it('does not show text label', () => {
    render(<ExtractionSourceInline source="ocr" />);

    expect(screen.queryByText('OCR')).not.toBeInTheDocument();
    expect(screen.queryByText('Auto-extracted')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ExtractionSourceInline source="ocr" className="custom-inline" />);

    const indicator = screen.getByTitle('Automatically extracted from your uploaded document');
    expect(indicator.classList.contains('custom-inline')).toBe(true);
  });

  it('uses text-xs styling for compact display', () => {
    render(<ExtractionSourceInline source="ocr" />);

    const indicator = screen.getByTitle('Automatically extracted from your uploaded document');
    expect(indicator.classList.contains('text-xs')).toBe(true);
  });
});
