import { render, screen } from '@testing-library/react';

import SparklineCard from './SparklineCard';
import type { SparklinePoint } from './SparklineCard';

const defaultPoints: SparklinePoint[] = [
  { hour: 0, amount: 0 },
  { hour: 8, amount: 500 },
  { hour: 12, amount: 1200 },
  { hour: 18, amount: 1800 },
];

const GREEN = 'rgb(25, 135, 84)';
const YELLOW = 'rgb(255, 193, 7)';
const RED = 'rgb(220, 53, 69)';

describe('SparklineCard', () => {
  it('renders label, value, and unit', () => {
    render(
      <SparklineCard
        label="Calories"
        unit="kcal"
        currentAmount={1843}
        dailyValue={{ amount: 2000, unit: 'kcal' }}
        points={defaultPoints}
        currentHour={14}
        goal="target"
      />,
    );

    expect(screen.getByTestId('sparkline-label')).toHaveTextContent('Calories');
    expect(screen.getByTestId('sparkline-value')).toHaveTextContent('1,843');
    const unitElements = screen.getAllByTestId('sparkline-unit');
    expect(unitElements).toHaveLength(2);
    expect(unitElements[1]).toHaveTextContent('kcal');
  });

  it('renders %DV subtitle with correct calculation', () => {
    render(
      <SparklineCard
        label="Calories"
        unit="kcal"
        currentAmount={1843}
        dailyValue={{ amount: 2000, unit: 'kcal' }}
        points={defaultPoints}
        currentHour={14}
        goal="target"
      />,
    );

    // 1843 / 2000 = 0.9215 → 92.2%
    expect(screen.getByTestId('sparkline-percent')).toHaveTextContent('92.2% of 2,000 kcal');
  });

  it('renders SVG with aria-hidden', () => {
    const { container } = render(
      <SparklineCard
        label="Protein"
        unit="g"
        currentAmount={45}
        dailyValue={{ amount: 50, unit: 'g' }}
        points={defaultPoints}
        currentHour={14}
        goal="more"
      />,
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders step-chart path', () => {
    render(
      <SparklineCard
        label="Protein"
        unit="g"
        currentAmount={45}
        dailyValue={{ amount: 50, unit: 'g' }}
        points={defaultPoints}
        currentHour={14}
        goal="more"
      />,
    );

    const stepChart = screen.getByTestId('step-chart');
    expect(stepChart).toBeInTheDocument();
    expect(stepChart.tagName).toBe('path');
  });

  it('renders fill area path', () => {
    render(
      <SparklineCard
        label="Protein"
        unit="g"
        currentAmount={45}
        dailyValue={{ amount: 50, unit: 'g' }}
        points={defaultPoints}
        currentHour={14}
        goal="more"
      />,
    );

    const fillArea = screen.getByTestId('fill-area');
    expect(fillArea).toBeInTheDocument();
    expect(fillArea.tagName).toBe('path');
  });

  it('renders continuation line from currentHour to end of day', () => {
    render(
      <SparklineCard
        label="Protein"
        unit="g"
        currentAmount={45}
        dailyValue={{ amount: 50, unit: 'g' }}
        points={defaultPoints}
        currentHour={14}
        goal="more"
      />,
    );

    const continuation = screen.getByTestId('continuation-line');
    expect(continuation).toBeInTheDocument();
    expect(continuation.getAttribute('d')).toContain('H 24');
  });

  describe('target goal (e.g. calories)', () => {
    it('red when far below target (<50%)', () => {
      render(
        <SparklineCard
          label="Calories"
          unit="kcal"
          currentAmount={800}
          dailyValue={{ amount: 2000, unit: 'kcal' }}
          points={[{ hour: 0, amount: 0 }]}
          currentHour={14}
          goal="target"
        />,
      );

      expect(screen.getByTestId('sparkline-value').style.color).toBe(RED);
    });

    it('yellow when somewhat below target (50–80%)', () => {
      render(
        <SparklineCard
          label="Calories"
          unit="kcal"
          currentAmount={1200}
          dailyValue={{ amount: 2000, unit: 'kcal' }}
          points={[{ hour: 0, amount: 0 }]}
          currentHour={14}
          goal="target"
        />,
      );

      expect(screen.getByTestId('sparkline-value').style.color).toBe(YELLOW);
    });

    it('green when near target (80–120%)', () => {
      render(
        <SparklineCard
          label="Calories"
          unit="kcal"
          currentAmount={1900}
          dailyValue={{ amount: 2000, unit: 'kcal' }}
          points={[{ hour: 0, amount: 0 }]}
          currentHour={14}
          goal="target"
        />,
      );

      expect(screen.getByTestId('sparkline-value').style.color).toBe(GREEN);
    });

    it('yellow when somewhat above target (120–150%)', () => {
      render(
        <SparklineCard
          label="Calories"
          unit="kcal"
          currentAmount={2500}
          dailyValue={{ amount: 2000, unit: 'kcal' }}
          points={[{ hour: 0, amount: 0 }]}
          currentHour={14}
          goal="target"
        />,
      );

      expect(screen.getByTestId('sparkline-value').style.color).toBe(YELLOW);
    });

    it('red when far above target (>150%)', () => {
      render(
        <SparklineCard
          label="Calories"
          unit="kcal"
          currentAmount={3200}
          dailyValue={{ amount: 2000, unit: 'kcal' }}
          points={[{ hour: 0, amount: 0 }]}
          currentHour={14}
          goal="target"
        />,
      );

      expect(screen.getByTestId('sparkline-value').style.color).toBe(RED);
    });
  });

  describe('more goal (e.g. protein, fiber)', () => {
    it('red when very low (<50%)', () => {
      render(
        <SparklineCard
          label="Protein"
          unit="g"
          currentAmount={20}
          dailyValue={{ amount: 50, unit: 'g' }}
          points={[{ hour: 0, amount: 0 }]}
          currentHour={14}
          goal="more"
        />,
      );

      expect(screen.getByTestId('sparkline-value').style.color).toBe(RED);
    });

    it('yellow when getting there (50–80%)', () => {
      render(
        <SparklineCard
          label="Protein"
          unit="g"
          currentAmount={30}
          dailyValue={{ amount: 50, unit: 'g' }}
          points={[{ hour: 0, amount: 0 }]}
          currentHour={14}
          goal="more"
        />,
      );

      expect(screen.getByTestId('sparkline-value').style.color).toBe(YELLOW);
    });

    it('green when at or above target (>=80%)', () => {
      render(
        <SparklineCard
          label="Protein"
          unit="g"
          currentAmount={45}
          dailyValue={{ amount: 50, unit: 'g' }}
          points={[{ hour: 0, amount: 0 }]}
          currentHour={14}
          goal="more"
        />,
      );

      expect(screen.getByTestId('sparkline-value').style.color).toBe(GREEN);
    });

    it('green even when well over target', () => {
      render(
        <SparklineCard
          label="Fiber"
          unit="g"
          currentAmount={50}
          dailyValue={{ amount: 28, unit: 'g' }}
          points={[{ hour: 0, amount: 0 }]}
          currentHour={14}
          goal="more"
        />,
      );

      expect(screen.getByTestId('sparkline-value').style.color).toBe(GREEN);
    });
  });

  describe('less goal (e.g. fat, sodium)', () => {
    it('green when at or below target (<=100%)', () => {
      render(
        <SparklineCard
          label="Sodium"
          unit="mg"
          currentAmount={1800}
          dailyValue={{ amount: 2300, unit: 'mg' }}
          points={[{ hour: 0, amount: 0 }]}
          currentHour={14}
          goal="less"
        />,
      );

      expect(screen.getByTestId('sparkline-value').style.color).toBe(GREEN);
    });

    it('yellow when slightly over (100–120%)', () => {
      render(
        <SparklineCard
          label="Sodium"
          unit="mg"
          currentAmount={2500}
          dailyValue={{ amount: 2300, unit: 'mg' }}
          points={[{ hour: 0, amount: 0 }]}
          currentHour={14}
          goal="less"
        />,
      );

      expect(screen.getByTestId('sparkline-value').style.color).toBe(YELLOW);
    });

    it('red when well over (>120%)', () => {
      render(
        <SparklineCard
          label="Sodium"
          unit="mg"
          currentAmount={3000}
          dailyValue={{ amount: 2300, unit: 'mg' }}
          points={[{ hour: 0, amount: 0 }]}
          currentHour={14}
          goal="less"
        />,
      );

      expect(screen.getByTestId('sparkline-value').style.color).toBe(RED);
    });
  });

  it('uses green when no dailyValue', () => {
    render(
      <SparklineCard
        label="Custom"
        unit="g"
        currentAmount={10}
        dailyValue={null}
        points={[{ hour: 0, amount: 0 }]}
        currentHour={14}
        goal="target"
      />,
    );

    expect(screen.getByTestId('sparkline-value').style.color).toBe(GREEN);
  });

  it('does not render %DV subtitle when dailyValue is null', () => {
    render(
      <SparklineCard
        label="Custom"
        unit="g"
        currentAmount={10}
        dailyValue={null}
        points={[{ hour: 0, amount: 0 }]}
        currentHour={14}
        goal="target"
      />,
    );

    expect(screen.queryByTestId('sparkline-percent')).not.toBeInTheDocument();
  });

  it('has rounded container', () => {
    render(
      <SparklineCard
        label="Calories"
        unit="kcal"
        currentAmount={1000}
        dailyValue={{ amount: 2000, unit: 'kcal' }}
        points={[{ hour: 0, amount: 0 }]}
        currentHour={14}
        goal="target"
      />,
    );

    const card = screen.getByTestId('sparkline-card-calories');
    expect(card.classList.contains('rounded-3')).toBe(true);
  });

  it('renders hidden balancing unit span for centering', () => {
    render(
      <SparklineCard
        label="Calories"
        unit="kcal"
        currentAmount={1000}
        dailyValue={{ amount: 2000, unit: 'kcal' }}
        points={[{ hour: 0, amount: 0 }]}
        currentHour={14}
        goal="target"
      />,
    );

    const unitElements = screen.getAllByTestId('sparkline-unit');
    expect(unitElements[0].style.visibility).toBe('hidden');
  });

  it('applies text-shadow for separation from background', () => {
    render(
      <SparklineCard
        label="Calories"
        unit="kcal"
        currentAmount={1000}
        dailyValue={{ amount: 2000, unit: 'kcal' }}
        points={[{ hour: 0, amount: 0 }]}
        currentHour={14}
        goal="target"
      />,
    );

    const label = screen.getByTestId('sparkline-label');
    expect(label.style.textShadow).toContain('var(--bs-card-bg)');
  });
});
