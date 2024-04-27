import { cn } from '@/lib/utils';

export function SelectableCardButton(props: {
  onClick?: (value: string | null) => void;
  selected?: boolean;
  value: string;
}) {
  const onClick =
    props.onClick &&
    (() => props.onClick!(props.selected ? null : props.value));

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center justify-center w-12 h-20 border-2 border-blue-500 rounded-md transition-all',
        props.selected
          ? 'bg-blue-500 text-white -translate-y-2'
          : 'hover:-translate-y-1 text-blue-500 hover:bg-blue-50',
      )}
    >
      <div
        className={cn(
          'absolute flex items-center justify-center w-full h-full text-lg font-bold',
        )}
      >
        {props.value}
      </div>
    </button>
  );
}
