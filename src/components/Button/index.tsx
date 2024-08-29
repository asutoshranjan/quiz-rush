export default function Button({
  text,
  onClick,
  className = "",
}: {
  text: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <form action={onClick}>
      <button type="submit" className={className}>
        {text}
      </button>
    </form>
  );
}
