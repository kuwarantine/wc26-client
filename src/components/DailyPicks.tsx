import { Box, Table, VStack, Text, Grid, Badge, Tabs, SkeletonText } from "@chakra-ui/react";
import { useState, useEffect, SetStateAction, Dispatch, useMemo } from "react";
import { Flag } from "./Flag";
import { COUNTRIES } from "../lib/Countries";
import { getLocalTimeZone, today } from "@internationalized/date";
import { API_URL } from "../lib/Constants";

interface Pick {
    name: string,
    match_id: number,
    winner_id: number | null,
    home_score: number,
    away_score: number,
    home_et: number | null,
    away_et: number | null,
    home_pen: number | null,
    away_pen: number | null
}

interface PickMatch {
    match_id: number,
    home_id: number,
    away_id: number,
    picks: Pick[]
}

interface MatchTabsProps {
    tab: string | null,
    setTab: Dispatch<SetStateAction<string | null>>,
    matches: PickMatch[]
}

function ScoreComponent(pick: Pick) {
    const FT = `${pick.home_score} - ${pick.away_score}`;
    const ET = pick.home_et ? `${pick.home_et} - ${pick.away_et}` : null;
    const PEN = pick.home_pen ? `${pick.home_pen} - ${pick.away_pen}` : null;

    return (
        <Grid justifyContent='center' justifyItems='start' templateColumns='max-content max-content' gap='6px 12px'>
            <Text fontFamily='mono'>{FT}</Text>
            <Badge variant='surface' colorPalette={pick.home_et ? 'gray' : 'blue'} opacity={pick.home_et ? 0.6 : 1}>FT</Badge>

            {pick.home_et ?
            <>
                <Text fontFamily='mono'>{ET}</Text>
                <Badge variant='surface' colorPalette={pick.home_pen ? 'gray' : 'blue'} opacity={pick.home_pen ? 0.6 : 1}>ET</Badge>
            </>
            : null
            }

            {pick.home_pen ?
            <>
                <Text fontFamily='mono'>{PEN}</Text>
                <Badge variant='surface' colorPalette='blue'>PEN</Badge>
            </>
            : null
            }
        </Grid>
    );
}

function PickRow(pick: Pick) {
    return (
        <Table.Row>
            <Table.Cell textAlign='center' w='150px'>
                {pick.name}
            </Table.Cell>
            <Table.Cell textAlign='center' fontFamily='mono'>
                {pick.winner_id ? <Flag countryCode={COUNTRIES[pick.winner_id].flag_code} w={['30px','45px']} /> : 'Draw'}
            </Table.Cell>
            <Table.Cell>
                <ScoreComponent {...pick}/>
            </Table.Cell>
        </Table.Row>
    )
}

function MatchTabs(props: MatchTabsProps) {
    const matches = props.matches;

    return (
        <Tabs.Root defaultValue={props.tab} value={props.tab} onValueChange={(e) => props.setTab(e.value)} mt='-2' pb='3' variant='plain'
            position='sticky' top={['84px', '100px', '110px']} zIndex={100}>
            <Tabs.List gap={['0', '2', '4']} w='max-content' maxW='100%' overflowX='auto' overflowY='hidden' whiteSpace='nowrap'
                backgroundColor='white/80' backdropFilter='saturate(180%) blur(3px)'
                justifySelf='center' p='2' h={['60px', '90px']}
                borderWidth='0px 1px 2px 1px' borderBottomRadius='md' borderBottomColor='blue.border'
                shadow='0 5px 10px -5px rgba(0, 0, 0, 0.4)'
                css={{
                    scrollbarWidth: 'none',
                }}
            >
                {matches.map((m) =>
                    <Tabs.Trigger color='gray.700' bg='transparent' value={`${m.match_id}`} key={m.match_id} flexShrink={0} h='auto'>
                        <VStack gap='0'>
                            <Flag countryCode={COUNTRIES[m.home_id].flag_code} w={['20px', '30px']}/>
                            {COUNTRIES[m.home_id].fifa_code}
                        </VStack>
                        <VStack gap='0'>
                            <Flag countryCode={COUNTRIES[m.away_id].flag_code} w={['20px', '30px']}/>
                            {COUNTRIES[m.away_id].fifa_code}
                        </VStack>
                    </Tabs.Trigger>
                )}
                <Tabs.Indicator shadow='xl' bg='rgba(0, 110, 255, 0.25)' borderRadius='full' border="1px solid" borderColor='white/60' />
            </Tabs.List>
        </Tabs.Root>
    );
}

export function DailyPicks() {
    const [matches, setMatches] = useState<PickMatch[]>([]);
    const localTZ = getLocalTimeZone();
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async() => {
            try {
                setLoading(true);

                const params = new URLSearchParams({
                    date: today(localTZ).toString(),
                    zone: localTZ
                });

                const res = await fetch(`${API_URL}/picks?${params.toString()}`);
                const json = await res.json();
                setMatches(json);
                setLoading(false);
            } catch (err) {
                console.log(err);
            }
        }

        fetchData();
    }, []);

    const picks = useMemo(() => {
        const p: Record<string,Pick[]> = {};
        for (const m of matches) {
            p[String(m.match_id)] = m.picks
        }
        return p;
    }, [matches]);

    const active = tab || (matches[0] ? String(matches[0].match_id) : '');
    const currentPicks = picks[active];

    return (
        <Box>
            {currentPicks ? <MatchTabs key={matches.length} matches={matches} tab={active} setTab={setTab} /> : <></>}
            <Table.Root maxW='450px' mx='auto' fontSize='clamp(1rem, 0.95rem + 0.25vw, 1.25rem)'>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader fontWeight='bold' textAlign='center'>
                            Name
                        </Table.ColumnHeader>
                        <Table.ColumnHeader fontWeight='bold' textAlign='center'>
                            Result
                        </Table.ColumnHeader>
                        <Table.ColumnHeader fontWeight='bold' textAlign='center'>
                            Score
                        </Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body> 
                    {currentPicks ? currentPicks.map((p, i) => <PickRow {...p} key={i} />) : <></>}
                </Table.Body>
            </Table.Root>
            <SkeletonText loading={loading} noOfLines={20} gap="10"/>
        </Box>
    );
}