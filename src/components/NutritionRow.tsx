import type { NutritionInformationData } from '../domain';

export type NutrientKey = keyof NutritionInformationData;

export interface NutrientData {
  formatted: string | null;
  percentDV: number | null;
  dvFormatted: string | null;
}

interface NutritionRowProps {
  label: string;
  nutrient: NutrientData;
  bold?: boolean;
  indent?: boolean;
  doubleIndent?: boolean;
  thick?: boolean;
}

function getIndentPadding(doubleIndent?: boolean, indent?: boolean): number {
  if (doubleIndent) return 24;
  if (indent) return 12;
  return 0;
}

export default function NutritionRow({
  label,
  nutrient,
  bold,
  indent,
  doubleIndent,
  thick,
}: NutritionRowProps) {
  if (!nutrient || !nutrient.formatted) return null;

  const { formatted, percentDV, dvFormatted } = nutrient;

  return (
    <tr className={`nutrition-row ${thick ? 'border-4' : ''}`}>
      <th
        scope="row"
        className={`border-bottom ${bold ? 'fw-bold' : 'fw-normal'}`}
        style={{ paddingLeft: getIndentPadding(doubleIndent, indent) }}
      >
        {label}
      </th>
      <td className="border-bottom text-end">{formatted}</td>
      <td
        className="border-bottom fw-bold text-end"
        title={percentDV !== null ? `${percentDV}% of ${dvFormatted}` : undefined}
      >
        {percentDV !== null ? `${percentDV}%` : ''}
      </td>
    </tr>
  );
}
