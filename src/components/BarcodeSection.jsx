import { Link } from 'react-router-dom'
import { ServingSize } from '../domain'
import NotesDisplay from './NotesDisplay'

/**
 * Displays a list of barcodes with their notes and optional serving size selection.
 */
export default function BarcodeSection({ barcodes, onSelectSize }) {
    if (!barcodes || barcodes.length === 0) return null

    return (
        <div className="mt-3">
            <h6 className="text-secondary mb-2">Barcodes</h6>
            <div className="list-group">
                {barcodes.map((bc, index) => (
                    <BarcodeItem
                        key={bc.code || index}
                        barcode={bc}
                        onSelectSize={onSelectSize}
                    />
                ))}
            </div>
        </div>
    )
}

function BarcodeItem({ barcode, onSelectSize }) {
    const { code, notes, servingSize: servingSizeData } = barcode
    const servingSize = ServingSize.fromObject(servingSizeData) || ServingSize.servings(1)

    const handleUse = () => {
        if (servingSize) {
            onSelectSize(servingSize)
        }
    }

    const hasNotes = notes && notes.length > 0

    return (
		<div className={`list-group-item`}>
			<div className={`d-flex justify-content-between align-items-center`}>
				<div className="d-flex flex-grow-1 align-items-center">
					<code className="fw-medium">{code}</code>
					{servingSize && (
						<span className="text-secondary ms-2 small">{servingSize.toString()}</span>
					)}
				</div>
				<div className="d-flex align-items-center ms-2">
					<Link
						to={`/lookup/${encodeURIComponent(code)}`}
						className="btn btn-outline-secondary btn-sm"
						title={`Look up ${code}`}
					>
						Lookup
					</Link>
					{servingSize && onSelectSize && (
						<button
							className="btn btn-outline-primary btn-sm ms-2"
							onClick={handleUse}
							title={`Set serving to ${servingSize.toString()}`}
						>
							Use
						</button>
					)}
				</div>
			</div>
			
			{hasNotes && (
				<div className="mt-1">
					<NotesDisplay notes={notes} />
				</div>
			)}
		</div>
    )
}
