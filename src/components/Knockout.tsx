import { VStack, Text, Flex, Divider, Spacer, Box, forwardRef } from "@chakra-ui/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { API_URL } from "../lib/Constants";

interface Coords {
    xr: number | 0,
    xl?: number | 0,
    y: number | 0
}

interface LineCoords {
    t: Coords,
    b: Coords,
    s: Coords
}

interface BracketMatchData {
    date: number | null,
    homeTeam: string,
    awayTeam: string,
    homeScore: number | null,
    awayScore: number | null,
    homeET: number | null,
    awayET: number | null,
    homePen: number | null,
    awayPen: number | null,
    homeEmoji: string,
    awayEmoji: string,
    matchNumber: number
}

const emptyBMData = (m: number) => {
    return {
        date: null,
        homeTeam: 'TBD',
        awayTeam: 'TBD',
        homeScore: null,
        awayScore: null,
        homeET: null,
        awayET: null,
        homePen: null,
        awayPen: null,
        homeEmoji: '',
        awayEmoji: '',
        matchNumber: m
    };
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

function Line(pos: LineCoords) {
    const midX = ((pos.s.xl ?? 0) + (pos.t.xr ?? 0)) / 2;

    return (
            <>
                <line x1={pos.t.xr} x2={midX} y1={pos.t.y} y2={pos.t.y}/>
                <line x1={pos.b.xr} x2={midX} y1={pos.b.y} y2={pos.b.y}/>
                <line x1={midX} x2={pos.s.xl} y1={pos.s.y} y2={pos.s.y}/>
                <line y1={pos.t.y} y2={pos.b.y} x1={midX} x2={midX}/>
            </>
    )
}

function getCoords(element: HTMLDivElement | null) {
    const pos = element?.getBoundingClientRect();
    const xr = pos?.right;
    const xl = pos?.left;
    const y = (pos?.y || 0) +((pos?.height || 0) / 2);

    return {xr: xr || 0, xl: xl || 0, y: y || 0};
}

function getThreeCoords(t: Coords, b: Coords, s: Coords) {
    return { t: t, b: b, s: s };
}

function getLines(cells: Coords[]) {
    // 0 - 7, 8 - 11, 12-13, 14
    // 0-1 -> 8, 2-3 -> 9, 4-5 -> 10, 6-7 -> 11, 8-9 -> 12, 10-11 -> 13, 12-13 -> 14
    const lines: LineCoords[] = [];
    lines.push(getThreeCoords(cells[0], cells[1], cells[8]));
    lines.push(getThreeCoords(cells[2], cells[3], cells[9]));
    lines.push(getThreeCoords(cells[4], cells[5], cells[10]));
    lines.push(getThreeCoords(cells[6], cells[7], cells[11]));
    lines.push(getThreeCoords(cells[8], cells[9], cells[12]));
    lines.push(getThreeCoords(cells[10], cells[11], cells[13]));
    lines.push(getThreeCoords(cells[12], cells[13], cells[14]));

    return lines;
}

function KnockoutCell({data}: {data: BracketMatchData}) {
    return (
        <Box border='1px solid' borderColor='gray.100' borderRadius='md' px='2' py='1' fontSize='0.8rem' whiteSpace='nowrap'>
            <VStack spacing='0'>
                <Flex w='100%' mb='1' fontSize='0.6rem' textColor='gray.600'>
                    <Text fontWeight='600'>Match {data.matchNumber}</Text>
                    <Spacer />
                    <Text>{data.date ? getFormattedDate(data.date) : ''}</Text>
                </Flex>
                <Flex w='100%'>
                    <Text align='left'>{data.homeEmoji}{data.homeTeam}</Text>
                    <Spacer minW='2rem'/>
                    <Text>{data.homeScore ?? '-'}</Text>
                </Flex>
                <Divider orientation='horizontal' />
                <Flex w='100%'>
                    <Text align='left'>{data.awayEmoji}{data.awayTeam}</Text>
                    <Spacer minW='2rem'/>
                    <Text>{data.awayScore ?? '-'}</Text>
                </Flex>
            </VStack>
        </Box>
    );
}

const Cell = forwardRef<{data: BracketMatchData}, 'div'>((props, ref) => (
    <Box ref={ref}><KnockoutCell {...props} /></Box>
));

const R16 = [38, 40, 43, 44, 37, 39, 42, 41];
const QF = [48, 47, 45, 46];
const SF = [50, 49];
const F = [51];
const ROUNDS = [R16, QF, SF, F];

function getBMData(matches: Map<string,BracketMatchData>) {
    const BMData: BracketMatchData[] = [];
    for (const round of ROUNDS) {
        for (const match of round) {
            const data = matches.get(`${match}`) ?? emptyBMData(match);
            BMData.push(data);
        }
    }
    return BMData;
}

export function Knockout() {
    const mainRef = useRef<HTMLDivElement | null>(null);
    const cellRefs = useRef<Array<HTMLDivElement | null>>([]);
    const [coords, setCoords] = useState<LineCoords[]>();
    const [mc, setMC] = useState<Coords>({xr:0, y:0});
    const [right, setRight] = useState<number | undefined>(768);

    const [matches, setMatches] = useState<BracketMatchData[]>(new Array(15).fill(emptyBMData(1)));

    function draw() {    
        const crds = [...Array(15).keys()].map((i) => getCoords(cellRefs.current[i]));
        const lines = getLines(crds);
        setCoords(lines);
        const rect = mainRef.current?.getBoundingClientRect();
        setRight(cellRefs.current[14]?.getBoundingClientRect().right);
        setMC({xr: rect?.x || 0, y: rect?.y || 0});
    }

    useLayoutEffect(() => {
        draw();
    }, [matches]);

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
        window.addEventListener('resize', draw);
        return () => { window.removeEventListener('resize', draw); };
    }), [];

    return (
            <Box ref={mainRef} position='relative' h='100%' overflowX='auto'>
                <Box position='absolute' top={-mc.y} left={-mc.xr} pointerEvents='none'>
                    <svg height='100vh' width={`calc(${right}px + 1em)`} strokeWidth={'2px'} stroke='#CBD5E0'>
                        {coords?.map((c, i) => <Line key={i} t={c.t} b={c.b} s={c.s}/>)}
                    </svg>
                </Box>
                <Flex h='100%' w='100vw' p='1rem' justify={{md: 'center'}}>
                    <Flex direction='column' h='100%' justify='space-around' mr='3rem'>
                        <Cell ref={c => cellRefs.current[0] = c} data={matches[0]}/>
                        <Cell ref={c => cellRefs.current[1] = c} data={matches[1]}/>
                        <Cell ref={c => cellRefs.current[2] = c} data={matches[2]}/>
                        <Cell ref={c => cellRefs.current[3] = c} data={matches[3]}/>
                        <Cell ref={c => cellRefs.current[4] = c} data={matches[4]}/>
                        <Cell ref={c => cellRefs.current[5] = c} data={matches[5]}/>
                        <Cell ref={c => cellRefs.current[6] = c} data={matches[6]}/>
                        <Cell ref={c => cellRefs.current[7] = c} data={matches[7]}/>       
                    </Flex>
                    <Flex direction='column' h='100%' justify='space-around' mr='3em'>
                        <Cell ref={c => cellRefs.current[8] = c} data={matches[8]}/>
                        <Cell ref={c => cellRefs.current[9] = c} data={matches[9]}/>
                        <Cell ref={c => cellRefs.current[10] = c} data={matches[10]}/>
                        <Cell ref={c => cellRefs.current[11] = c} data={matches[11]}/>
                    </Flex>
                    <Flex direction='column' h='100%' justify='space-around' mr='3em'>
                        <Cell ref={c => cellRefs.current[12] = c} data={matches[12]}/>
                        <Cell ref={c => cellRefs.current[13] = c} data={matches[13]}/>
                    </Flex>
                    <Flex direction='column' h='100%' justify='space-around' mr='3em'>
                        <Cell ref={c => cellRefs.current[14] = c} data={matches[14]}/>
                    </Flex>
                </Flex>
        </Box>
    );
}

