import { VStack, Text, Flex, Separator, Spacer, Box, HStack, SegmentGroup, Icon } from "@chakra-ui/react";
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { API_URL } from "../lib/Constants";
import { Flag } from "./Flag";
import { COUNTRIES } from "../lib/Countries";
import { FaCaretLeft } from "react-icons/fa";
import { LiveBadge } from "./LiveBadge";
import { useLiveMatch, MatchData } from "../LiveMatchContext";

const ROUND_NAMES: Record<number,string> = {
    2: 'Round of 32',
    3: 'Round of 16', 
    4: 'Quarter-finals', 
    5: 'Semi-finals', 
    6: 'Final'
};

const CARD_HEIGHT = 96;
const GAP = 16;
const ROUND_WIDTH = 280;
const ROUND_GAP = 32;
const FOCUSED_HEIGHTS: Record<number, number> = {
    2: 16*CARD_HEIGHT + 15*GAP,
    3: 8*CARD_HEIGHT + 7*GAP,
    4: 4*CARD_HEIGHT + 3*GAP,
    5: 2*CARD_HEIGHT + GAP,
    6: CARD_HEIGHT
}

type BracketRoundData = {
    id: number,
    name: string,
    matches: MatchData[]
}

interface KnockoutRoundProps {
    round: BracketRoundData,
    slotHeight: number
}

interface KnockoutMatchProps {
    data: MatchData
}

interface RoundsHeaderProps {
    focusRound: number,
    setFocusRound: Dispatch<SetStateAction<number>>,
    segmentBarRef: React.RefObject<HTMLDivElement | null>,
    rounds: BracketRoundData[]
}

const emptyBMData = (r: number, m: number) => {
    return {
        date: 0,
        elapsed: null,
        extra: null,
        round: r,
        homeID: null,
        awayID: null,
        homeScore: 0,
        awayScore: 0,
        homeET: null,
        awayET: null,
        homePen: null,
        awayPen: null,
        winnerID: null,
        status: 'NS',
        number: m,
        homeEvents: [],
        awayEvents: []
    };
}

const defaultBM = () => {
    return [...Array(16).fill(emptyBMData(2,1)),
            ...Array(8).fill(emptyBMData(3,1)),
            ...Array(4).fill(emptyBMData(4,1)),
            ...Array(2).fill(emptyBMData(5,1)),
            ...Array(1).fill(emptyBMData(6,1)),
    ];
}

function timeString(time: number | null, extra: number | null) {
    if (extra !== null) {
        return `${time}+${extra}'`;
    } else {
        return `${time}'`;
    }
}

function KnockoutMatch({data}: KnockoutMatchProps) {
    const home_flag_code = data.homeID ? COUNTRIES[data.homeID].flag_code : '';
    const away_flag_code = data.awayID ? COUNTRIES[data.awayID].flag_code : '';
    const home_name = data.homeID ? COUNTRIES[data.homeID].name : 'TBD';
    const away_name = data.awayID ? COUNTRIES[data.awayID].name : 'TBD';

    const started = data.status !== 'NS';
    const finished = (data.status === 'FT' || data.status === 'AET' || data.status === 'PEN');
    const live = started && !finished;
    const home_win = finished && data.winnerID === data.homeID;
    const away_win = finished && data.winnerID === data.awayID;

    const home_score_text = started ? `${data.homeET ?? data.homeScore}${(data.homePen !== null) ? ` (${data.homePen})` : ''}` : '-';
    const away_score_text = started ? `${data.awayET ?? data.awayScore}${(data.awayPen !== null) ? ` (${data.awayPen})` : ''}` : '-';

    const topRightText = (status: string) => {
        switch(status) {
            case '1H':
            case '2H':
            case 'ET':
            case 'LIVE':
                return timeString(data.elapsed, data.extra);
            case 'HT':
                return 'HT';
            case 'BT':
                return 'ET Break';
            case 'P':
            case 'PEN':
                return `PEN`;
            case 'FT':
            case 'AET':
                return status;
            default:
                return '';
        }
    }

    return (
        <Box w='full' h={`${CARD_HEIGHT}px`} border='1px solid' borderColor='gray.200' borderRadius='md' px='2.5' pt='1' pb='2' fontSize='0.8rem' whiteSpace='nowrap'>
            <VStack gap='0' h='100%'>
                <Flex w='100%' mb='1' fontSize='0.7rem' gap='1'>
                    <Text fontWeight='600' color='gray.600'>Match {data.number}</Text>
                    <Spacer />
                    {live ? <LiveBadge /> : <></>}
                    <Text fontWeight={started ? '600' : 'normal'} 
                        color={started ? 'gray.800' : 'gray.600'}>
                        {topRightText(data.status)}
                    </Text>
                </Flex>
                <Flex gap='2' mt='auto' align='stretch' direction='column' w='100%' fontWeight='bold'>
                    <Flex position='relative' gap='1' color={away_win ? 'gray.500' : 'gray.800'}>
                        <Flag countryCode={home_flag_code} w='28px'/>
                        {home_name}
                        <Spacer />
                        <Text>{home_score_text}</Text>
                        {home_win ? 
                            <Icon color='gray.800' size='md' position='absolute' right='-17px'>
                                <FaCaretLeft />
                            </Icon>
                        : <></>}
                    </Flex>
                    <Separator orientation='horizontal' />
                    <Flex position='relative' gap='1' color={home_win ? 'gray.500' : 'gray.800'}>
                        <Flag countryCode={away_flag_code} w='28px'/>
                        {away_name}
                        <Spacer />
                        <Text>{away_score_text}</Text>
                        {away_win ? 
                            <Icon color='gray.800' size='md' position='absolute' right='-17px'>
                                <FaCaretLeft />
                            </Icon>
                        : <></>}
                    </Flex>
                </Flex>
            </VStack>
        </Box>
    );
}

function RoundsHeader(props: RoundsHeaderProps) {
    return (
        <Box maxW='100%' mx='auto' mt='-2' position='sticky' top={['84px', '100px', '110px']} zIndex={100}>
            <Flex overflowX='auto' backgroundColor='white/80' backdropFilter='saturate(180%) blur(3px)'
                css={{scrollbarWidth: 'none'}}
                borderWidth='0px 1px 2px 1px' borderBottomRadius='md' borderBottomColor='blue.border'
                shadow='0 5px 10px -5px rgba(0, 0, 0, 0.4)' ref={props.segmentBarRef}>
                <SegmentGroup.Root p='1' value={`${props.focusRound}`} onValueChange={(e) => props.setFocusRound(parseInt(e.value ?? '2'))}
                    fontWeight='bold' bg='transparent' boxShadow='none'>
                        {props.rounds.map((r) => (
                            <SegmentGroup.Item key={r.id} value={`${r.id}`} color='gray.700' fontSize={['12px','14px']} px='1' cursor='pointer' _focusVisible={{outline: '2px solid -webkit-focus-ring-color'}}>
                                <SegmentGroup.ItemText p='2' _hover={props.focusRound === r.id ? {} : {borderRadius: 'full', bg: 'gray.200/50', outline: 'none' }}>{r.name}</SegmentGroup.ItemText> 
                                <SegmentGroup.ItemHiddenInput />
                            </SegmentGroup.Item>
                        ))}
                    <SegmentGroup.Indicator shadow='sm' bg='rgba(0, 110, 255, 0.25)' borderRadius='full' border="1px solid" borderColor='white/60'/>
                </SegmentGroup.Root>
            </Flex>
        </Box>
    );
}

function KnockoutRound(props: KnockoutRoundProps) {
    return (
        <VStack id={`round-${props.round.id}`} w={`${ROUND_WIDTH}px`} gap={0} align='stretch'>
            {props.round.matches.map((m,i) =>
                <Flex key={i} h={`${props.slotHeight-GAP}px`} mb={`${GAP}px`} align='center' transition='all 200ms ease'>
                    <KnockoutMatch key={i} data={m} />
                </Flex>
            )}
        </VStack>
    );
}

function getSlotMultiplier(distance: number) {
    if (distance < 1) {
        return 1;
    }

    return Math.pow(2, distance);
}

function getSlotHeights(rounds: BracketRoundData[], focusRound: number) {
    return rounds.map((r) => {
        const sm = getSlotMultiplier(r.id-focusRound);
        const slotHeight = sm * CARD_HEIGHT + (sm) * GAP;

        return slotHeight;
    });
}

const R32 = [74, 77, 73, 75, 83, 84, 81, 82, 76, 78, 79, 80, 86, 88, 85, 87];
const R16 = [89, 90, 93, 94, 91, 92, 95, 96];
const QF = [97, 98, 99, 100];
const SF = [101, 102];
const F = [104];
const ROUNDS = [R32, R16, QF, SF, F];

function getBMData(matches: Map<string,MatchData>) {
    const BMData: MatchData[] = [];
    for (let i=0; i<ROUNDS.length; i++) {
        const round = ROUNDS[i];
        for (const match of round) {
            let data = matches.get(`${match}`) ?? emptyBMData(i+2, match);
            BMData.push(data);
        }
    }
    return BMData;
}

function buildRounds(matches: MatchData[]) {
    const grouped = Map.groupBy(matches, (m) => m.round);

    const rounds = [2,3,4,5,6].map((id) => ({
        id: id,
        name: ROUND_NAMES[id],
        matches: grouped.get(id) ?? []
    }));

    return rounds;
}

function buildPaths(rounds: BracketRoundData[], slotHeights: number[]) {
    const paths = [];

    for (let i=0; i<rounds.length-1; i++) {
        const sh = slotHeights[i];
        const nsh = slotHeights[i+1];

        for (let j=0; j<rounds[i].matches.length; j++) {
            const aX = i * (ROUND_WIDTH + ROUND_GAP) + ROUND_WIDTH;
            const bX = (i+1) * (ROUND_WIDTH + ROUND_GAP);
            const aY = (j * sh) + (sh-GAP)/2;
            const bY = (Math.floor(j/2) * nsh) + (nsh-GAP)/2;
            const midX = (aX + bX)/2;

            paths.push(`
                M ${aX} ${aY}
                H ${midX}
                V ${bY}
                H ${bX}
            `);
        }
    }

    return paths;
}

export function Knockout() {
    const [matches, setMatches] = useState<MatchData[]>(defaultBM());
    const [focusRound, setFocusRound] = useState(2);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const segmentBarRef = useRef<HTMLDivElement>(null);
    const live = useLiveMatch();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(API_URL+'/match/knockouts');
                const json = await res.json();
                const BMData = getBMData(new Map(Object.entries(json)));
                setMatches(BMData);
            } catch (err) {
                console.log(err);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        if (!live) return;

        setMatches((prevMatches) => 
            prevMatches.map((m) => {
                if (m.number === live.number) {
                    return live;
                }
                return m;
            })
        );

    }, [live]);

    const rounds = useMemo(() => buildRounds(matches), [matches]);
    const slotHeights = useMemo(() => getSlotHeights(rounds, focusRound), [rounds, focusRound]);
    const paths = useMemo(() => buildPaths(rounds, slotHeights), [rounds, slotHeights]);

    const contentWidth = rounds.length * ROUND_WIDTH + (rounds.length - 1) * ROUND_GAP;
    const contentHeight = CARD_HEIGHT*16 + GAP*15;
    const spacerWidth = contentWidth - ROUND_WIDTH;

    useEffect(() => {
        const roundEl = document.getElementById(`round-${focusRound}`);
        const container = scrollContainerRef.current!
        const roundLeft = roundEl ? Math.max(roundEl.offsetLeft - 12, 0) : 0;
        container.scrollTo({left: roundLeft, behavior: 'smooth'});
        //window.scrollTo({top: 0, behavior: 'smooth'});

        const segmentBar = segmentBarRef.current!
        const segmentEl = segmentBar.querySelector(`[value="${focusRound}"]`)?.parentElement as HTMLElement | null;
        const segmentLeft = segmentEl ? segmentEl.offsetLeft - (segmentBar.offsetWidth/2) + (segmentEl.offsetWidth/2) : 0;
        segmentBar.scrollTo({left: segmentLeft, behavior: 'smooth'});
    }, [focusRound]);

    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const SWIPE_THRESHOLD = 50;
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
        touchStartY.current = e.targetTouches[0].clientY;
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null || touchStartY.current === null) { return; }

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchEndX - touchStartX.current;
        const diffY = touchEndY - touchStartY.current;
        touchStartX.current = null;
        touchStartY.current = null;

        if (Math.abs(diffY) > Math.abs(diffX)) { return; }

        if (Math.abs(diffX) > SWIPE_THRESHOLD) {
            if (diffX > 0) {
                setFocusRound(Math.max(2, focusRound-1));
            } else {
                setFocusRound(Math.min(6, focusRound+1));
            }
        }
    };

    return (
        <Flex position='relative' direction='column' gap='5'>
            <RoundsHeader focusRound={focusRound} setFocusRound={setFocusRound} segmentBarRef={segmentBarRef} rounds={rounds}/>
            <Box position='relative' overflow='hidden' css={{ touchAction: 'pan-y'}} w='100%' h={FOCUSED_HEIGHTS[focusRound]} minH='100vh' 
                ref={scrollContainerRef} transition='all 200ms ease'
                onTouchStart={(e) => handleTouchStart(e)}
                onTouchEnd={(e) => handleTouchEnd(e)}>
                <svg
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: `${contentWidth}px`,
                        height: `${contentHeight}px`,
                        pointerEvents: 'none'
                    }}>
                    {paths.map((d,i) => (
                        <path key={i} d={d} stroke='var(--chakra-colors-gray-200)' strokeWidth='2' fill='none' />
                    ))}
                </svg>
                <HStack align='stretch' gap={`${ROUND_GAP}px`} w={`${contentWidth+spacerWidth+ROUND_GAP}px`} h='100%'>
                    {rounds.map((r,i) => <KnockoutRound key={r.id} round={r} slotHeight={slotHeights[i]}/>)}
                    <Box flex='none' w={`${spacerWidth}px`} />
                </HStack>
            </Box>
        </Flex>
    );
}

