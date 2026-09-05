import { useTranslation } from 'react-i18next';

import type { DeclarationRow } from '../utils/europeanDeclaration';

interface EuropeanNutritionRowProps {
  row: DeclarationRow;
  /** Rendered when the label shows a reference-intake column. */
  showReferenceIntake: boolean;
}

/** One nutrient line of a European declaration: name, an amount per column, and its share. */
export default function EuropeanNutritionRow({
  row,
  showReferenceIntake,
}: EuropeanNutritionRowProps) {
  const { t } = useTranslation();

  return (
    <tr>
      <th
        scope="row"
        className={row.indent ? 'fw-normal ps-4' : 'fw-normal'}
        style={row.indent ? { fontStyle: 'italic' } : undefined}
      >
        {t(row.labelKey)}
      </th>
      {row.amounts.map((amount, index) => (
        <td
          key={row.amounts.length === 1 ? 'serving' : `column-${index}`}
          className="text-end text-nowrap"
        >
          {amount ?? '—'}
        </td>
      ))}
      {showReferenceIntake && <td className="text-end">{row.referenceIntake ?? '—'}</td>}
    </tr>
  );
}
