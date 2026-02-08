import { PasskeySetupPrompt } from '../components/common';
import { HistoryTile } from '../components/home';

export default function HomePage() {
  return (
    <>
      <h2 className="mb-4">Hello there</h2>
      <PasskeySetupPrompt />
      <div className="row g-3">
        <div className="col-12">
          <HistoryTile />
        </div>
      </div>
    </>
  );
}
