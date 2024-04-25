import {HTMLProps} from 'react';
import {useRoomContext} from '@/app/[room]/room';
import {mean, round, uniq} from 'lodash';
import {cn} from '@/lib/utils';

export function VotingResultSection({
                                        className,
                                        ...props
                                    }: HTMLProps<HTMLDivElement>) {
    const room = useRoomContext()!;

    const votes = Object.values(room.votes);
    const result = uniq(votes)
        .filter((e): e is string => e !== undefined && e !== null)
        .reduce(
            (acc, value) => {
                return [
                    ...acc,
                    {
                        vote: value,
                        count: votes.filter((e) => e === value).length,
                    },
                ];
            },
            [] as { vote: string; count: number }[],
        )
        .sort((a, b) => room.cards.indexOf(a.vote) - room.cards.indexOf(b.vote));

    const totalValidVotes = result.reduce((acc, {count}) => acc + count, 0);
    const highestVoteCount = Math.max(...result.map((e) => e.count));
    const numbersInVote = votes.map((e) => Number(e)).filter((e) => !isNaN(e));
    const canCalculateAverage = numbersInVote.length > 0;

    // FIXME: Temporarily disabled due to flickering issue
    // confetti({
    //   position: {
    //     x: 50,
    //     y: 100,
    //   },
    //   count: 20,
    //   spread: 120,
    // });

    return (
        <div {...props} className={cn('flex', className, 'voting-result-section')}>
            <div className="flex items-center gap-4">
                {result.map(({vote, count}) => {
                    const percentOfVoters = count / totalValidVotes;
                    const maxHeight = 80; // 80px ~ 5rem ~ h-20
                    const filledHeight = Math.round(maxHeight * percentOfVoters);
                    const isHighest = highestVoteCount === count;
                    return (
                        <div key={vote} className="flex flex-col items-center gap-y-2">
                            <div
                                style={{height: maxHeight}}
                                className="w-2 relative bg-gray-200 rounded overflow-clip"
                            >
                                <div
                                    style={{
                                        height: filledHeight,
                                    }}
                                    className={cn(
                                        'absolute bottom-0 inset-x-0 rounded bg-neutral-400',
                                        isHighest && 'bg-slate-800',
                                    )}
                                ></div>
                            </div>
                            <div
                                className={cn(
                                    'h-20 w-12 border-2 rounded-md flex justify-center items-center border-neutral-400',
                                    isHighest && 'border-slate-800',
                                )}
                            >
                <span
                    className={cn(
                        'font-bold text-neutral-400',
                        isHighest && 'text-slate-800',
                    )}
                >
                  {vote}
                </span>
                            </div>
                            <span
                                className={cn(
                                    'text-neutral-400',
                                    isHighest && 'text-slate-700',
                                )}
                            >
                {count} Vote{count > 1 && 's'}
              </span>
                        </div>
                    );
                })}
            </div>
            {canCalculateAverage && (
                <div className="ml-16 flex text-center flex-col items-center justify-center">
                    <span className="text-lg text-gray-700">Average:</span>
                    <div className="mt-2">
            <span className="text-3xl font-bold">
              {round(mean(numbersInVote), 1)}
            </span>
                    </div>
                </div>
            )}
        </div>
    );
}