'use client';

export default function Toggle({
  chatOnlyView,
  setChatOnlyView,
}: {
  chatOnlyView: boolean;
  setChatOnlyView: (v: boolean) => void;
}) {
  return (
    <div className="view-toggle" role="group" aria-label="Pane layout">
      <button
        type="button"
        className="view-toggle__btn"
        aria-pressed={!chatOnlyView}
        onClick={() => setChatOnlyView(false)}
      >
        PDF + Chat
      </button>
      <button
        type="button"
        className="view-toggle__btn"
        aria-pressed={chatOnlyView}
        onClick={() => setChatOnlyView(true)}
      >
        Chat only
      </button>
    </div>
  );
}
