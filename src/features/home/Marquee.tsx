interface MarqueeProps {
  words: string[]
}

export function Marquee({ words }: MarqueeProps) {
  return (
    <div className="marq" aria-hidden="true">
      <div className="marq__t">
        {[0, 1].map((round) =>
          words.map((word) => <span key={`${round}-${word}`}>{word}</span>),
        )}
      </div>
    </div>
  )
}
