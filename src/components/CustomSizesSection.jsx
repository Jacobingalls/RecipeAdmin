import { ServingSize } from '../domain'
import NotesDisplay from './NotesDisplay'

/**
 * Displays a list of custom sizes with their descriptions and a button to select each one.
 */
export default function CustomSizesSection({ customSizes, onSelectSize }) {
    if (!customSizes || customSizes.length === 0) return null

    return (
        <div className="mt-3">
            <h6 className="text-secondary mb-2">Custom Sizes</h6>
            <div className="list-group">
                {customSizes.map((cs, index) => (
                    <CustomSizeItem
                        key={cs.id || cs.name || index}
                        customSize={cs}
                        onSelect={() => onSelectSize(ServingSize.customSize(cs.name, 1))}
                    />
                ))}
            </div>
        </div>
    )
}

function CustomSizeItem({ customSize, onSelect }) {
    const { name, description, notes } = customSize
    const hasNotes = notes && notes.length > 0

    return (
        <div className={`list-group-item d-flex justify-content-between ${hasNotes ? 'align-items-start' : 'align-items-center'}`}>
            <div className="flex-grow-1">
                <div className="d-flex align-items-baseline">
                    <span className="fw-medium">{name}</span>
                    {description && (
                        <span className="text-secondary ms-2 small">({description})</span>
                    )}
                </div>
                {hasNotes && (
                    <div className="mt-1">
                        <NotesDisplay notes={notes} />
                    </div>
                )}
            </div>
            <button
                className="btn btn-outline-primary btn-sm ms-2"
                onClick={onSelect}
                title={`Set serving to 1 ${name}`}
            >
                Use
            </button>
        </div>
    )
}
