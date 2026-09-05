import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import NutritionEnergy from './NutritionEnergy';

describe('NutritionEnergy', () => {
  it('leads with the calorie count', () => {
    render(<NutritionEnergy calories={250} caloriesFromFat={null} />);
    expect(screen.getByText('Calories')).toBeInTheDocument();
    expect(screen.getByTestId('nutrition-energy')).toHaveTextContent('250');
  });

  it('gives the calories that come from fat', () => {
    render(<NutritionEnergy calories={250} caloriesFromFat={90} />);
    expect(screen.getByText('Calories from Fat 90')).toBeInTheDocument();
  });

  it('leaves the from-fat line out when the product has no figure for it', () => {
    render(<NutritionEnergy calories={250} caloriesFromFat={null} />);
    expect(screen.queryByText(/Calories from Fat/)).not.toBeInTheDocument();
  });

  it('shows a dash when the calories are unknown', () => {
    render(<NutritionEnergy calories={null} caloriesFromFat={null} />);
    expect(screen.getByTestId('nutrition-energy')).toHaveTextContent('—');
  });
});
