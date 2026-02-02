import { API_DISPLAY_URL } from '../api'

export default function Footer() {
    return (
        <footer className="fixed-bottom bg-light border-top py-2">
            <div className="container text-center">
                <small className="text-muted">
                    API: {API_DISPLAY_URL}
                </small>
            </div>
        </footer>
    )
}
