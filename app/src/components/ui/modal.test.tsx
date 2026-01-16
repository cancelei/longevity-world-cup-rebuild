import { describe, it, expect} from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ModalClose,
} from './modal';

describe('Modal', () => {
  const renderModal = (props = {}) => {
    return render(
      <Modal {...props}>
        <ModalTrigger asChild>
          <button>Open Modal</button>
        </ModalTrigger>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Modal Title</ModalTitle>
            <ModalDescription>Modal description text</ModalDescription>
          </ModalHeader>
          <div>Modal content</div>
          <ModalFooter>
            <button>Close</button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  it('should render trigger button', () => {
    renderModal();
    expect(screen.getByRole('button', { name: 'Open Modal' })).toBeInTheDocument();
  });

  it('should not show modal content by default', () => {
    renderModal();
    expect(screen.queryByText('Modal Title')).not.toBeInTheDocument();
  });

  it('should open modal on trigger click', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: 'Open Modal' }));

    await waitFor(() => {
      expect(screen.getByText('Modal Title')).toBeInTheDocument();
    });
  });

  it('should show modal content when defaultOpen is true', async () => {
    renderModal({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText('Modal Title')).toBeInTheDocument();
    });
  });

  it('should close modal when clicking close button', async () => {
    const user = userEvent.setup();
    renderModal({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText('Modal Title')).toBeInTheDocument();
    });

    // Click the X close button (the one with sr-only "Close" text in the content)
    const closeButtons = screen.getAllByRole('button', { name: 'Close' });
    // Get the close button that's part of ModalContent (not the footer button)
    const xCloseButton = closeButtons.find(btn => btn.querySelector('.sr-only') || btn.querySelector('svg'));
    if (xCloseButton) {
      await user.click(xCloseButton);
    } else {
      await user.click(closeButtons[0]);
    }

    await waitFor(() => {
      expect(screen.queryByText('Modal Title')).not.toBeInTheDocument();
    });
  });

  it('should close modal when pressing Escape', async () => {
    const user = userEvent.setup();
    renderModal({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText('Modal Title')).toBeInTheDocument();
    });

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByText('Modal Title')).not.toBeInTheDocument();
    });
  });
});

describe('ModalContent', () => {
  const renderModalContent = (size?: 'sm' | 'md' | 'lg' | 'xl' | 'full') => {
    return render(
      <Modal defaultOpen>
        <ModalTrigger>Open</ModalTrigger>
        <ModalContent size={size} data-testid="modal-content">
          Content
        </ModalContent>
      </Modal>
    );
  };

  it('should render with default size (md)', async () => {
    renderModalContent();
    await waitFor(() => {
      expect(screen.getByTestId('modal-content')).toHaveClass('max-w-lg');
    });
  });

  it('should render with small size', async () => {
    renderModalContent('sm');
    await waitFor(() => {
      expect(screen.getByTestId('modal-content')).toHaveClass('max-w-sm');
    });
  });

  it('should render with large size', async () => {
    renderModalContent('lg');
    await waitFor(() => {
      expect(screen.getByTestId('modal-content')).toHaveClass('max-w-2xl');
    });
  });

  it('should render with xl size', async () => {
    renderModalContent('xl');
    await waitFor(() => {
      expect(screen.getByTestId('modal-content')).toHaveClass('max-w-4xl');
    });
  });

  it('should render with full size', async () => {
    renderModalContent('full');
    await waitFor(() => {
      const content = screen.getByTestId('modal-content');
      expect(content.className).toContain('max-w-[90vw]');
    });
  });

  it('should include close button', async () => {
    renderModalContent();
    await waitFor(() => {
      // Close button has sr-only "Close" text
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });
  });
});

describe('ModalHeader', () => {
  it('should render children', async () => {
    render(
      <Modal defaultOpen>
        <ModalTrigger>Open</ModalTrigger>
        <ModalContent>
          <ModalHeader data-testid="modal-header">Header content</ModalHeader>
        </ModalContent>
      </Modal>
    );

    await waitFor(() => {
      expect(screen.getByTestId('modal-header')).toHaveTextContent('Header content');
    });
  });

  it('should apply custom className', async () => {
    render(
      <Modal defaultOpen>
        <ModalTrigger>Open</ModalTrigger>
        <ModalContent>
          <ModalHeader className="custom-header" data-testid="modal-header">
            Header
          </ModalHeader>
        </ModalContent>
      </Modal>
    );

    await waitFor(() => {
      expect(screen.getByTestId('modal-header')).toHaveClass('custom-header');
    });
  });
});

describe('ModalFooter', () => {
  it('should render children', async () => {
    render(
      <Modal defaultOpen>
        <ModalTrigger>Open</ModalTrigger>
        <ModalContent>
          <ModalFooter data-testid="modal-footer">
            <button>Cancel</button>
            <button>Confirm</button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );

    await waitFor(() => {
      expect(screen.getByTestId('modal-footer')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });
  });

  it('should apply custom className', async () => {
    render(
      <Modal defaultOpen>
        <ModalTrigger>Open</ModalTrigger>
        <ModalContent>
          <ModalFooter className="custom-footer" data-testid="modal-footer">
            Footer
          </ModalFooter>
        </ModalContent>
      </Modal>
    );

    await waitFor(() => {
      expect(screen.getByTestId('modal-footer')).toHaveClass('custom-footer');
    });
  });
});

describe('ModalTitle', () => {
  it('should render title text', async () => {
    render(
      <Modal defaultOpen>
        <ModalTrigger>Open</ModalTrigger>
        <ModalContent>
          <ModalTitle>Test Title</ModalTitle>
        </ModalContent>
      </Modal>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });
  });

  it('should apply custom className', async () => {
    render(
      <Modal defaultOpen>
        <ModalTrigger>Open</ModalTrigger>
        <ModalContent>
          <ModalTitle className="custom-title" data-testid="modal-title">
            Title
          </ModalTitle>
        </ModalContent>
      </Modal>
    );

    await waitFor(() => {
      expect(screen.getByTestId('modal-title')).toHaveClass('custom-title');
    });
  });

  it('should forward ref', async () => {
    const ref = { current: null };
    render(
      <Modal defaultOpen>
        <ModalTrigger>Open</ModalTrigger>
        <ModalContent>
          <ModalTitle ref={ref}>Title</ModalTitle>
        </ModalContent>
      </Modal>
    );

    await waitFor(() => {
      expect(ref.current).toBeTruthy();
    });
  });
});

describe('ModalDescription', () => {
  it('should render description text', async () => {
    render(
      <Modal defaultOpen>
        <ModalTrigger>Open</ModalTrigger>
        <ModalContent>
          <ModalDescription>Description text here</ModalDescription>
        </ModalContent>
      </Modal>
    );

    await waitFor(() => {
      expect(screen.getByText('Description text here')).toBeInTheDocument();
    });
  });

  it('should apply custom className', async () => {
    render(
      <Modal defaultOpen>
        <ModalTrigger>Open</ModalTrigger>
        <ModalContent>
          <ModalDescription className="custom-desc" data-testid="modal-desc">
            Desc
          </ModalDescription>
        </ModalContent>
      </Modal>
    );

    await waitFor(() => {
      expect(screen.getByTestId('modal-desc')).toHaveClass('custom-desc');
    });
  });

  it('should forward ref', async () => {
    const ref = { current: null };
    render(
      <Modal defaultOpen>
        <ModalTrigger>Open</ModalTrigger>
        <ModalContent>
          <ModalDescription ref={ref}>Desc</ModalDescription>
        </ModalContent>
      </Modal>
    );

    await waitFor(() => {
      expect(ref.current).toBeTruthy();
    });
  });
});

describe('ModalTrigger', () => {
  it('should render as child element with asChild', () => {
    render(
      <Modal>
        <ModalTrigger asChild>
          <button data-testid="custom-trigger">Custom Trigger</button>
        </ModalTrigger>
        <ModalContent>Content</ModalContent>
      </Modal>
    );
    expect(screen.getByTestId('custom-trigger')).toBeInTheDocument();
  });

  it('should render default button without asChild', () => {
    render(
      <Modal>
        <ModalTrigger>Default Trigger</ModalTrigger>
        <ModalContent>Content</ModalContent>
      </Modal>
    );
    expect(screen.getByRole('button', { name: 'Default Trigger' })).toBeInTheDocument();
  });
});

describe('ModalClose', () => {
  it('should close modal when clicked', async () => {
    const user = userEvent.setup();
    render(
      <Modal defaultOpen>
        <ModalTrigger>Open</ModalTrigger>
        <ModalContent>
          <ModalClose asChild>
            <button data-testid="custom-close">Close Me</button>
          </ModalClose>
          <div>Modal content</div>
        </ModalContent>
      </Modal>
    );

    await waitFor(() => {
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('custom-close'));

    await waitFor(() => {
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    });
  });
});
