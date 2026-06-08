import { Box, HStack, VStack, Text, StackDivider, Flex, Divider, Icon, Tr, Td, Table, Tbody, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel, IconButton, Spinner, Heading } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import * as icons from "./Icons";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import { FaChevronLeft, FaChevronRight, FaExclamationTriangle } from "react-icons/fa";
import { API_URL } from "../lib/Constants";

interface MatchData {
    date: number,
    homeTeam: string,
    awayTeam: string,
    homeScore: number,
    awayScore: number,
    homeEmoji: string,
    awayEmoji: string,
    homeEvents: MatchEvent[],
    awayEvents: MatchEvent[]
}

interface MatchProps {
    data: MatchData
}

interface MatchEvent {
    time: number,
    extra_time: number,
    player: string,
    assist: string,
    type: string,
    detail: string
}

interface EventRowProps {
    data: MatchEvent,
    id: number,
    alignR: boolean
}

function iconForEvent(event: string, detail: string) {
    let icon;
    switch (event) {
        case 'Goal':
            if (detail === 'Own Goal') { icon = icons.OwnGoalIcon; }
            else if (detail === 'Missed Penalty') { icon = FaExclamationTriangle; }
            else { icon = icons.GoalIcon; }
            break;
        case 'Card':
            icon = (detail === 'Yellow Card') ? icons.YellowCardIcon : icons.RedCardIcon;
            break;
        case 'subst':
            icon = icons.SubIcon;
            break;
        case 'Var':
            icon = icons.VarIcon;
            break;
        default:
            icon = icons.TimeIcon;
            break;
    }

    return icon;
}

function timeForEvent(time: number, extra: number) {
    if (extra) {
        return `${time}+${extra}'`;
    } else {
        return `${time}'`;
    }
}

function shorten(name: string) {
    const split = name.split(' ');
    if (split.length === 1) { return name; }
    const first = split[0];
    const second = split[1];
    if (first.length > 2) {
        return `${first.charAt(0)}. ${second}`;
    } else { 
        return name;
    }
}

function mainTextForEvent(event: string, detail: string, player: string, assist: string) {
    const ps = shorten(player);
    const as = assist ? shorten(assist) : null;

    switch (event) {
        case 'Goal':
            switch (detail) {
                case 'Normal Goal':
                    return ps;
                case 'Own Goal':
                    return `${ps} (Own goal)`;
                case 'Penalty':
                    return `${ps} (Penalty)`;
                case 'Missed Penalty':
                    return `${ps} (Missed penalty)`;
                default:
                    return 'Goal event error';
            }
        case 'Card':
            return ps;
        case 'subst':
            return as;
        case 'Var':
            return `Goal cancelled (${ps})`;
        default:
            return 'Event error';
    }
}

function extraTextForEvent(event: string, detail: string, player: string, assist: string) {
    const ps = shorten(player);
    const as = assist ? shorten(assist) : null;

    switch (event) {
        case 'Goal':
            switch (detail) {
                case 'Normal Goal':
                    return assist ? `(${as})` : null;
                case 'Own Goal':
                case 'Penalty': 
                case 'Missed Penalty':
                    return null;
                default:
                    return 'Goal event error';
            }
        case 'Card':
            return null;
        case 'subst':
            return `(${ps})`;
        case 'Var':
            return null;
        default:
            return 'Event error';
    }
}

function EventRow(props: EventRowProps) {
    if (props.data.detail === 'Penalty confirmed') { return null; }

    const alignDir = props.alignR ? 'right' : 'left';
    const flexDir = props.alignR ? 'row-reverse' : 'row';
    const isGoal = props.data.type === 'Goal';
    return (
        <Tr key={props.id} display='flex' flexDirection={flexDir} >
            <Td key='icon' p='2px' textAlign={alignDir}><Icon as={iconForEvent(props.data.type, props.data.detail)} /></Td>
            <Td key='time' p='2px' textAlign={alignDir} fontSize='0.6rem' textColor='gray.600' fontWeight={isGoal ? 'bold' : 'normal'}>{timeForEvent(props.data.time, props.data.extra_time)}</Td>
            <Td key='main' p='2px' textAlign={alignDir} fontSize='0.6rem' fontWeight={isGoal ? 'bold' : 'normal'}>{mainTextForEvent(props.data.type, props.data.detail, props.data.player, props.data.assist)}</Td>
            <Td key='xtra' p='2px' textAlign={alignDir} style={{wordWrap: 'break-word'}} fontSize='0.4rem'>{extraTextForEvent(props.data.type, props.data.detail, props.data.player, props.data.assist)}</Td>
        </Tr>
    );
}

function MatchDetails(homeEvents: MatchEvent[], awayEvents: MatchEvent[]) {
    return (
        <Flex w='100%' justifyContent='space-between'>
            <Table variant='unstyled' alignSelf='start'>
                <Tbody>
                    {homeEvents.map((e, i) => <EventRow data={e} id={i} key={i} alignR={false}/>)}
                </Tbody>
            </Table>
            <Divider orientation='vertical' borderColor='gray.200' h='auto' m='3'/>
            <Table variant='unstyled' alignSelf='start'>
                <Tbody>
                    {awayEvents.map((e, i) => <EventRow data={e} id={i} key={i} alignR={true}/>)}
                </Tbody>
            </Table>
        </Flex>
    );
}

function getFormattedDate(date: number) {
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZoneName: 'short'
    }

    const out = new Intl.DateTimeFormat(undefined, options).format(date);

    return out;
}

function toBackendDate(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth()+1;
    const day = date.getDate();

    return year+'-'+month+'-'+day;
}

function Match(props: MatchProps) {
    return (
        <Box textColor='gray.700' border='1px solid' borderColor='gray.200' borderRadius='md' p='5' mb='5' whiteSpace='nowrap'>
            <VStack divider={<StackDivider borderColor='gray.200'/>}>
                <Text fontSize='0.8rem'>{getFormattedDate(props.data.date)}</Text>
                <Flex align='center' w='100%' mx='10'>
                    {/* Team 1 */}
                    <VStack spacing='0' flex='1'>
                        <Text fontSize='3rem'>{props.data.homeEmoji}</Text>
                        <Text fontSize='1rem'>{props.data.homeTeam}</Text>
                    </VStack>
                    {/* Score */}
                    <Text alignSelf='center' fontSize='2rem' fontWeight='bold'>{props.data.homeScore ?? ' '} - {props.data.awayScore ?? ' '}</Text>
                    {/* Team 2 */}
                    <VStack spacing='0' flex='1'>
                        <Text fontSize='3rem'>{props.data.awayEmoji}</Text>
                        <Text fontSize='1rem'>{props.data.awayTeam}</Text>
                    </VStack>
                </Flex>
                <Accordion w='100%' allowToggle>
                    <AccordionItem border='white'>
                        <AccordionButton justifyContent='center'>
                            <Text fontSize='0.8rem' textColor='gray.800'>Details</Text>
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel>
                            {MatchDetails(props.data.homeEvents, props.data.awayEvents)}
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>
            </VStack>
        </Box>
    );
}

export function Matches() {
    const [match, setMatch] = useState<MatchData[]>([]);
    const [date, setDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(API_URL+'/match?date='+toBackendDate(date));
                const json = await res.json();
                setMatch(json);
                setIsLoading(false);
            } catch (err) {
                console.log(err);
            }
        }

    fetchData();
  }, [date]);

    function prevDate() {
        const pd = new Date(date);
        pd.setDate(date.getDate()-1);
        setDate(pd);
    }

    function nextDate() {
        const nd = new Date(date);
        nd.setDate(date.getDate()+1);
        setDate(nd);
    }

    return (
        <VStack>
            <HStack>
                <IconButton aria-label='Previous' icon={<FaChevronLeft />} onClick={prevDate}/>
                <SingleDatepicker name='date-input' date={date} onDateChange={setDate}/>
                <IconButton aria-label='Next' icon={<FaChevronRight />} onClick={nextDate}/>
            </HStack>
            {isLoading ? <Spinner mt='10' size='xl'/> : null}
            <Flex direction='column'>
                {match.map((m, i) => <Match key={i} data={m}/>)}
            </Flex>
            {(!isLoading && match.length === 0) ? <Heading fontSize='1.25rem' textColor='gray.500' mt='20'>No matches on this day.</Heading> : null}
        </VStack>
    )
}