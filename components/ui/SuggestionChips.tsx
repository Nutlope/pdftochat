'use client';

type Props = {
  questions: string[];
  onPick: (question: string) => void;
};

export default function SuggestionChips({ questions, onPick }: Props) {
  if (!questions.length) return null;
  return (
    <div className="suggestions" role="group" aria-label="Suggested questions">
      <p className="suggestions__eyebrow">Try asking…</p>
      <div className="suggestions__list">
        {questions.map((q) => (
          <button
            key={q}
            type="button"
            className="suggestions__chip"
            onClick={() => onPick(q)}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
