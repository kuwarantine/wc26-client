import { VStack, Text, Flex, Separator, Spacer, Box, Grid } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { API_URL } from "../lib/Constants";

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
    matchNumber: number,
    lineDirection: string;
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
        matchNumber: m,
        lineDirection: 'none'
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

function KnockoutCell({data}: {data: BracketMatchData}) {
    return (
        <Box border='1px solid' borderColor='gray.100' borderRadius='md' px='2' py='1' fontSize='0.8rem' whiteSpace='nowrap'>
            <VStack gap='0'>
                <Flex w='100%' mb='1' fontSize='0.6rem' color='gray.600'>
                    <Text fontWeight='600'>Match {data.matchNumber}</Text>
                    <Spacer />
                    <Text>{data.date ? getFormattedDate(data.date) : ''}</Text>
                </Flex>
                <Flex w='100%'>
                    <Text textAlign='left'>{data.homeEmoji}{data.homeTeam}</Text>
                    <Spacer minW='2rem'/>
                    <Text>{data.homeScore ?? '-'}</Text>
                </Flex>
                <Separator orientation='horizontal' />
                <Flex w='100%'>
                    <Text textAlign='left'>{data.awayEmoji}{data.awayTeam}</Text>
                    <Spacer minW='2rem'/>
                    <Text>{data.awayScore ?? '-'}</Text>
                </Flex>
            </VStack>

            {data.lineDirection === "right" && (
                <Box
                position="absolute"
                top="50%"
                right="-18px"
                transform="translateY(-50%)"
                w="18px"
                h="100%" /* Height automatically matches the vertical gap of the column stack */
                borderRight="2px solid"
                borderTop="2px solid"
                borderBottom="2px solid"
                borderColor="border.disabled"
                pointerEvents="none"
                />
            )}

            {data.lineDirection === "left" && (
                <Box
                position="absolute"
                top="50%"
                left="-18px"
                transform="translateY(-50%)"
                w="18px"
                h="100%"
                borderLeft="2px solid"
                borderTop="2px solid"
                borderBottom="2px solid"
                borderColor="border.disabled"
                pointerEvents="none"
                />
            )}
        </Box>
    );
}

const R32L = [73, 76, 74, 75, 78, 77, 79, 80];
const R32R = [82, 81, 84, 83, 85, 88, 86, 87];
const R16L = [90, 89, 91, 92];
const R16R = [93, 94, 95, 96];
const QFL = [97, 98];
const QFR = [99, 100];
const SFL = [101];
const SFR = [102];
const F = [104];
const ROUNDS = [R32L, R16L, QFL, SFL, F, SFR, QFR, R16R, R32R];

function lineDirectionForMatch(m: number) {
    if (m === 104) {
        return 'none';
    }
    else if (m in R32L || m in R16L || m in QFL || m in SFL) {
        return 'right';
    } else {
        return 'left';
    }
}

function getBMData(matches: Map<string,BracketMatchData>) {
    const BMData: BracketMatchData[] = [];
    for (const round of ROUNDS) {
        for (const match of round) {
            let data = matches.get(`${match}`) ?? emptyBMData(match);
            data.lineDirection = lineDirectionForMatch(match);
            BMData.push(data);
        }
    }
    return BMData;
}

export function Knockout() {
    const [matches, setMatches] = useState<BracketMatchData[]>(new Array(31).fill(emptyBMData(1)));

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

    return (
        <Box position='relative' h='100%' overflowX='auto'>
            <Grid
                templateColumns="1fr 1fr 1fr 1fr 1.2fr 1fr 1fr 1fr 1fr"
                gap="4"
                p="6"
                alignItems="center"
                minW="1400px"
                overflowX="auto"
            >
                {/* ================= LEFT SIDE BRACKET ================= */}
                <VStack gap="6" gridColumn="1">
                    <KnockoutCell data={matches[0]} />
                    <KnockoutCell data={matches[1]} />
                    <KnockoutCell data={matches[2]} />
                    <KnockoutCell data={matches[3]} />
                    <KnockoutCell data={matches[4]} />
                    <KnockoutCell data={matches[5]} />
                    <KnockoutCell data={matches[6]} />
                    <KnockoutCell data={matches[7]} />
                </VStack>
                <VStack gap="20" pt="8" gridColumn="2">
                    <KnockoutCell data={matches[8]} />
                    <KnockoutCell data={matches[9]} />
                    <KnockoutCell data={matches[10]} />
                    <KnockoutCell data={matches[11]} />
                </VStack>
                <VStack gap="44" pt="20" gridColumn="3">
                    <KnockoutCell data={matches[12]} />
                    <KnockoutCell data={matches[13]} />
                </VStack>
                <VStack gap="44" gridColumn="4">
                    <KnockoutCell data={matches[14]} />
                </VStack>
                <VStack gap="44" gridColumn="5">
                    <KnockoutCell data={matches[15]} />
                </VStack>
                <VStack gap="44" gridColumn="6">
                    <KnockoutCell data={matches[16]} />
                </VStack>
                <VStack gap="44" pt="20" gridColumn="7">
                    <KnockoutCell data={matches[17]} />
                    <KnockoutCell data={matches[18]} />
                </VStack>
                <VStack gap="20" pt="8" gridColumn="8">
                    <KnockoutCell data={matches[19]} />
                    <KnockoutCell data={matches[20]} />
                    <KnockoutCell data={matches[21]} />
                    <KnockoutCell data={matches[22]} />
                </VStack>
                <VStack gap="6" gridColumn="9">
                    <KnockoutCell data={matches[23]} />
                    <KnockoutCell data={matches[24]} />
                    <KnockoutCell data={matches[25]} />
                    <KnockoutCell data={matches[26]} />
                    <KnockoutCell data={matches[27]} />
                    <KnockoutCell data={matches[28]} />
                    <KnockoutCell data={matches[29]} />
                    <KnockoutCell data={matches[30]} />
                </VStack>
            </Grid>
        </Box>
    );
}

