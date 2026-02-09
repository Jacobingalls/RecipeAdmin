import { PasskeySetupPrompt } from '../components/common';
import { HistoryTile } from '../components/home';

export default function HomePage() {
  return (
    <>
      <h1 className="h2 mb-4">Hello there</h1>
      <PasskeySetupPrompt />
      <div className="row g-3">
        <div className="col-12">
          <HistoryTile />
        </div>
      </div>
    </>
  );
}
