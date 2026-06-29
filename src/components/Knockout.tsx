import { VStack, Text, Flex, Separator, Spacer, Box, HStack, SegmentGroup } from "@chakra-ui/react";
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { API_URL } from "../lib/Constants";
import { Flag } from "./Flag";
import { COUNTRIES } from "../lib/Countries";

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

interface BracketMatchData {
    date: number | null,
    round: number,
    homeID: number | null,
    awayID: number | null,
    homeScore: number | null,
    awayScore: number | null,
    homeET: number | null,
    awayET: number | null,
    homePen: number | null,
    awayPen: number | null,
    matchNumber: number
}

type BracketRoundData = {
    id: number,
    name: string,
    matches: BracketMatchData[]
}

interface KnockoutRoundProps {
    round: BracketRoundData,
    slotHeight: number
}

interface KnockoutMatchProps {
    data: BracketMatchData
}

interface RoundsHeaderProps {
    focusRound: number,
    setFocusRound: Dispatch<SetStateAction<number>>,
}

const emptyBMData = (r: number, m: number) => {
    return {
        date: null,
        round: r,
        homeID: null,
        awayID: null,
        homeScore: null,
        awayScore: null,
        homeET: null,
        awayET: null,
        homePen: null,
        awayPen: null,
        matchNumber: m
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

function getFormattedDate(date: number) {
    const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
    }

    const out = new Intl.DateTimeFormat(undefined, options).format(date);

    return out;
}

function KnockoutMatch({data}: KnockoutMatchProps) {
    const home_flag_code = data.homeID ? COUNTRIES[data.homeID].flag_code : '';
    const away_flag_code = data.awayID ? COUNTRIES[data.awayID].flag_code : '';
    const home_name = data.homeID ? COUNTRIES[data.homeID].name : 'TBD';
    const away_name = data.awayID ? COUNTRIES[data.awayID].name : 'TBD';

    const home_score_text = (data.homeScore !== null) ? `${data.homeET ?? data.homeScore}${(data.homePen !== null) ? `(${data.homePen})` : ''}` : '-';
    const away_score_text = (data.awayScore !== null) ? `${data.awayET ?? data.awayScore}${(data.awayPen !== null) ? `(${data.awayPen})` : ''}` : '-';

    return (
        <Box w='full' h={`${CARD_HEIGHT}px`} border='1px solid' borderColor='gray.200' borderRadius='md' px='2' pt='1' pb='2' fontSize='0.8rem' whiteSpace='nowrap'>
            <VStack gap='0' h='100%'>
                <Flex w='100%' mb='1' fontSize='0.7rem' color='gray.600'>
                    <Text fontWeight='600'>Match {data.matchNumber}</Text>
                    <Spacer />
                    <Text>{data.date ? getFormattedDate(data.date) : ''}</Text>
                </Flex>
                <Flex gap='2' mt='auto' align='stretch' direction='column' w='100%' fontWeight='bold' color='gray.700'>
                    <Flex gap='1'>
                        <Flag countryCode={home_flag_code} w='28px'/>
                        {home_name}
                        <Spacer minW='2rem'/>
                        <Text>{home_score_text}</Text>
                    </Flex>
                    <Separator orientation='horizontal' />
                    <Flex gap='1'>
                        <Flag countryCode={away_flag_code} w='28px'/>
                        {away_name}
                        <Spacer minW='2rem'/>
                        <Text>{away_score_text}</Text>
                    </Flex>
                </Flex>
            </VStack>
        </Box>
    );
}

function RoundsHeader(props: RoundsHeaderProps) {
    return (
        <Box mt='-2' position='sticky' top={['84px', '100px', '110px']} zIndex={100}>
            <Flex overflowX='auto' backgroundColor='white/80' backdropFilter='saturate(180%) blur(3px)'
                maxW='100%' justifySelf='center' css={{scrollbarWidth: 'none'}}
                borderWidth='0px 1px 2px 1px' borderBottomRadius='md' borderBottomColor='blue.border'
                shadow='0 5px 10px -5px rgba(0, 0, 0, 0.4)'>
                <SegmentGroup.Root p='1' value={`${props.focusRound}`} onValueChange={(e) => props.setFocusRound(parseInt(e.value ?? '2'))}
                    fontWeight='bold' bg='transparent'>
                    <SegmentGroup.Item key={2} value={'2'} color='gray.700' fontSize={['12px','14px']}>
                        Round of 32
                        <SegmentGroup.ItemHiddenInput />
                    </SegmentGroup.Item>
                    <SegmentGroup.Item key={3} value={'3'} color='gray.700' fontSize={['12px','14px']}>
                        Round of 16
                        <SegmentGroup.ItemHiddenInput />
                    </SegmentGroup.Item>
                    <SegmentGroup.Item key={4} value={'4'} color='gray.700' fontSize={['12px','14px']}>
                        Quarter-finals
                        <SegmentGroup.ItemHiddenInput />
                    </SegmentGroup.Item>
                    <SegmentGroup.Item key={5} value={'5'} color='gray.700' fontSize={['12px','14px']}>
                        Semi-finals
                        <SegmentGroup.ItemHiddenInput />
                    </SegmentGroup.Item>
                    <SegmentGroup.Item key={6} value={'6'} color='gray.700' fontSize={['12px','14px']}>
                        Final
                        <SegmentGroup.ItemHiddenInput />
                    </SegmentGroup.Item>
                    <SegmentGroup.Indicator shadow='sm' bg='rgba(0, 110, 255, 0.25)' borderRadius='full' border="1px solid" borderColor='white/60'/>
                </SegmentGroup.Root>
            </Flex>
        </Box>
    );
}

function KnockoutRound(props: KnockoutRoundProps) {
    return (
        <VStack id={`round-${props.round.id}`} w={`${ROUND_WIDTH}px`} gap={0}
                align='stretch' transition='all 200ms ease'>
            {props.round.matches.map((m,i) =>
                <Flex key={i} h={`${props.slotHeight-GAP}px`} mb={`${GAP}px`} align='center'>
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

function getBMData(matches: Map<string,BracketMatchData>) {
    const BMData: BracketMatchData[] = [];
    for (let i=0; i<ROUNDS.length; i++) {
        const round = ROUNDS[i];
        for (const match of round) {
            let data = matches.get(`${match}`) ?? emptyBMData(i+2, match);
            BMData.push(data);
        }
    }
    return BMData;
}

function buildRounds(matches: BracketMatchData[]) {
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
    const [matches, setMatches] = useState<BracketMatchData[]>(defaultBM());
    const [focusRound, setFocusRound] = useState(2);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

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

    const rounds = useMemo(() => buildRounds(matches), [matches]);
    const slotHeights = useMemo(() => getSlotHeights(rounds, focusRound), [rounds, focusRound]);
    const paths = useMemo(() => buildPaths(rounds, slotHeights), [rounds, slotHeights]);

    const contentWidth = rounds.length * ROUND_WIDTH + (rounds.length - 1) * ROUND_GAP;
    const contentHeight = CARD_HEIGHT*16 + GAP*15;
    const spacerWidth = contentWidth - ROUND_WIDTH;

    useEffect(() => {
        const roundEl = document.getElementById(`round-${focusRound}`);
        const container = scrollContainerRef.current!
        const left = roundEl ? Math.max(roundEl.offsetLeft - 12, 0) : 0;
        container.scrollTo({left: left, behavior: 'smooth'})
        window.scrollTo({top: 0, behavior: 'smooth'});

    }, [focusRound]);

    return (
        <Flex position='relative' direction='column' gap='5'>
            <RoundsHeader focusRound={focusRound} setFocusRound={setFocusRound} />
            <Box position='relative' overflow='hidden' css={{ touchAction: 'pan-y'}} w='100%' h={FOCUSED_HEIGHTS[focusRound]} ref={scrollContainerRef}>
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

