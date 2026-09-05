import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { setEnergyDisplayPreference } from '../utils';

import NutritionEnergy from './NutritionEnergy';

describe('NutritionEnergy', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  describe('counting calories', () => {
    it('leads with the calorie count', () => {
      render(<NutritionEnergy calories={250} caloriesFromFat={null} />);
      expect(screen.getByText('Calories')).toBeInTheDocument();
      expect(screen.getByTestId('nutrition-energy')).toHaveTextContent('250');
    });

    it('gives the calories that come from fat', () => {
      render(<NutritionEnergy calories={250} caloriesFromFat={90} />);
      expect(screen.getByText('Calories from Fat 90')).toBeInTheDocument();
    });

    it('leaves out the kilojoule equivalent', () => {
      render(<NutritionEnergy calories={250} caloriesFromFat={null} />);
      expect(screen.queryByTestId('nutrition-energy-alternate')).not.toBeInTheDocument();
    });
  });

  describe('measuring kilojoules', () => {
    beforeEach(() => {
      setEnergyDisplayPreference('kilojoules');
    });

    it('leads with kilojoules, the way European packaging does', () => {
      render(<NutritionEnergy calories={250} caloriesFromFat={null} />);
      expect(screen.getByText('Energy')).toBeInTheDocument();
      expect(screen.getByTestId('nutrition-energy')).toHaveTextContent('1,046 kJ');
    });

    it('gives the calorie equivalent alongside it', () => {
      render(<NutritionEnergy calories={250} caloriesFromFat={null} />);
      expect(screen.getByTestId('nutrition-energy-alternate')).toHaveTextContent('250 kcal');
    });

    it('measures the energy that comes from fat too', () => {
      render(<NutritionEnergy calories={250} caloriesFromFat={90} />);
      expect(screen.getByText('Energy from fat 377 kJ')).toBeInTheDocument();
    });
  });

  it.each([['calories' as const], ['kilojoules' as const]])(
    'shows a dash when %s are unknown',
    (display) => {
      setEnergyDisplayPreference(display);
      render(<NutritionEnergy calories={null} caloriesFromFat={null} />);
      expect(screen.getByTestId('nutrition-energy')).toHaveTextContent('—');
      expect(screen.queryByTestId('nutrition-energy-alternate')).not.toBeInTheDocument();
    },
  );
});
