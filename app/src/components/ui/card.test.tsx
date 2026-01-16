import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card';

describe('Card', () => {
  it('should render with default variant', () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('Content');
  });

  it('should render with elevated variant', () => {
    render(<Card variant="elevated" data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('shadow-xl');
  });

  it('should render with glass variant', () => {
    render(<Card variant="glass" data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('glass');
  });

  it('should apply hoverable styles when hoverable prop is true', () => {
    render(<Card hoverable data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('cursor-pointer');
  });

  it('should not apply hoverable styles by default', () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).not.toHaveClass('cursor-pointer');
  });

  it('should apply custom className', () => {
    render(<Card className="custom-class" data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = { current: null };
    render(<Card ref={ref}>Content</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('should spread additional props', () => {
    render(<Card data-testid="card" aria-label="test card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveAttribute('aria-label', 'test card');
  });
});

describe('CardHeader', () => {
  it('should render children', () => {
    render(<CardHeader>Header Content</CardHeader>);
    expect(screen.getByText('Header Content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<CardHeader className="custom-header" data-testid="header">Header</CardHeader>);
    expect(screen.getByTestId('header')).toHaveClass('custom-header');
  });

  it('should forward ref', () => {
    const ref = { current: null };
    render(<CardHeader ref={ref}>Header</CardHeader>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('CardTitle', () => {
  it('should render as h3 element', () => {
    render(<CardTitle>Title</CardTitle>);
    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toHaveTextContent('Title');
  });

  it('should apply custom className', () => {
    render(<CardTitle className="custom-title" data-testid="title">Title</CardTitle>);
    expect(screen.getByTestId('title')).toHaveClass('custom-title');
  });

  it('should forward ref', () => {
    const ref = { current: null };
    render(<CardTitle ref={ref}>Title</CardTitle>);
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
  });
});

describe('CardDescription', () => {
  it('should render children', () => {
    render(<CardDescription>Description text</CardDescription>);
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<CardDescription className="custom-desc" data-testid="desc">Desc</CardDescription>);
    expect(screen.getByTestId('desc')).toHaveClass('custom-desc');
  });

  it('should forward ref', () => {
    const ref = { current: null };
    render(<CardDescription ref={ref}>Desc</CardDescription>);
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });
});

describe('CardContent', () => {
  it('should render children', () => {
    render(<CardContent>Main content</CardContent>);
    expect(screen.getByText('Main content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<CardContent className="custom-content" data-testid="content">Content</CardContent>);
    expect(screen.getByTestId('content')).toHaveClass('custom-content');
  });

  it('should forward ref', () => {
    const ref = { current: null };
    render(<CardContent ref={ref}>Content</CardContent>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('CardFooter', () => {
  it('should render children', () => {
    render(<CardFooter>Footer content</CardFooter>);
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<CardFooter className="custom-footer" data-testid="footer">Footer</CardFooter>);
    expect(screen.getByTestId('footer')).toHaveClass('custom-footer');
  });

  it('should forward ref', () => {
    const ref = { current: null };
    render(<CardFooter ref={ref}>Footer</CardFooter>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('Card composition', () => {
  it('should render complete card with all subcomponents', () => {
    render(
      <Card data-testid="full-card">
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test description</CardDescription>
        </CardHeader>
        <CardContent>Test content</CardContent>
        <CardFooter>Test footer</CardFooter>
      </Card>
    );

    expect(screen.getByTestId('full-card')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Title');
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByText('Test footer')).toBeInTheDocument();
  });
});
