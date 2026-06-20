import { Box, HStack, VStack, Text, Separator, Flex, Icon, Table, Accordion, IconButton, Spinner, Heading, DatePicker, Portal } from "@chakra-ui/react";
import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { today, getLocalTimeZone, DateValue } from "@internationalized/date";
import * as icons from "./Icons";
import { FaChevronLeft, FaChevronRight, FaExclamationTriangle } from "react-icons/fa";
import { API_URL } from "../lib/Constants";
import { Flag } from "./Flag";

interface MatchProps {
    date: number,
    finishCode: string,
    winner: string,
    homeTeam: string,
    awayTeam: string,
    homeScore: number,
    awayScore: number,
    homeET: number | null,
    awayET: number | null,
    homePen: number | null,
    awayPen: number | null,
    homeFlagCode: string,
    awayFlagCode: string,
    homeFifaCode: string,
    awayFifaCode: string,
    homeEvents: MatchEvent[],
    awayEvents: MatchEvent[]
}

const emptyMatch = () => {
    return {
        date: 0,
        winner: 'draw',
        finishCode: 'FT',
        homeTeam: '',
        awayTeam: '',
        homeScore: 0,
        awayScore: 0,
        homeET: null,
        awayET: null,
        homePen: null,
        awayPen: null,
        homeFlagCode: '',
        awayFlagCode: '',
        homeFifaCode: '',
        awayFifaCode: '',
        homeEvents: [],
        awayEvents: []
    }
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

interface MatchDatePickerProps {
    date: DateValue,
    setDate: Dispatch<SetStateAction<DateValue>>
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
        <Table.Row key={props.id} display='flex' flexDirection={flexDir} >
            <Table.Cell key='icon' p='2px' textAlign={alignDir}><Icon as={iconForEvent(props.data.type, props.data.detail)} /></Table.Cell>
            <Table.Cell key='time' p='2px' textAlign={alignDir} fontSize='0.6rem' color='gray.600' fontWeight={isGoal ? 'bold' : 'normal'}>{timeForEvent(props.data.time, props.data.extra_time)}</Table.Cell>
            <Table.Cell key='main' p='2px' textAlign={alignDir} fontSize='0.6rem' fontWeight={isGoal ? 'bold' : 'normal'}>{mainTextForEvent(props.data.type, props.data.detail, props.data.player, props.data.assist)}</Table.Cell>
            <Table.Cell key='xtra' p='2px' textAlign={alignDir} style={{wordWrap: 'break-word'}} fontSize='0.4rem'>{extraTextForEvent(props.data.type, props.data.detail, props.data.player, props.data.assist)}</Table.Cell>
        </Table.Row>
    );
}

function MatchDetails(homeEvents: MatchEvent[], awayEvents: MatchEvent[]) {
    return (
        <Flex w='100%' justifyContent='space-between'>
            <Table.Root unstyled alignSelf='start'>
                <Table.Body>
                    {homeEvents.map((e, i) => <EventRow data={e} id={i} key={i} alignR={false}/>)}
                </Table.Body>
            </Table.Root>
            <Separator orientation='vertical' borderColor='gray.200' h='auto' m='3'/>
            <Table.Root unstyled alignSelf='start'>
                <Table.Body>
                    {awayEvents.map((e, i) => <EventRow data={e} id={i} key={i} alignR={true}/>)}
                </Table.Body>
            </Table.Root>
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

function MatchDatePicker(props: MatchDatePickerProps) {
    return (
    <DatePicker.Root openOnClick maxWidth="20rem" value={[props.date]} onValueChange={(e) => props.setDate(e.value[0])}>
      <DatePicker.Control>
        <DatePicker.Input />
      </DatePicker.Control>
      <Portal>
        <DatePicker.Positioner>
          <DatePicker.Content>
            <DatePicker.View view="day">
              <DatePicker.Header />
              <DatePicker.DayTable />
            </DatePicker.View>
            <DatePicker.View view="month">
              <DatePicker.Header />
              <DatePicker.MonthTable />
            </DatePicker.View>
            <DatePicker.View view="year">
              <DatePicker.Header />
              <DatePicker.YearTable />
            </DatePicker.View>
          </DatePicker.Content>
        </DatePicker.Positioner>
      </Portal>
    </DatePicker.Root>
  )
}

export function LastUpdate() {
    const [match, setMatch] = useState<MatchProps>(emptyMatch());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(API_URL+'/last');
                const json = await res.json();
                setMatch(json);
            } catch (err) {
                console.log(err);
            }
        }

        fetchData();
    }, []);

    const homeScore = (match.finishCode === 'FT') ? match.homeScore : match.homeET;
    const awayScore = (match.finishCode === 'FT') ? match.awayScore : match.awayET;
    const underText = (code: string) => {
        if (code === 'PEN') {
            return `PEN: ${match.homePen} - ${match.awayPen}`;
        } else {
            return code;
        }
    }

    return (
        <Box color='gray.700'>
            <Text fontWeight='semibold' fontSize={['0.65rem','0.85rem','1rem']}>Last Update</Text>
            <Box>
                <Flex w='100%' gap={[2,3]}>
                    {/* Team 1 */}
                    <VStack gap='0' flex='1'>
                        <Flag countryCode={match.homeFlagCode} w={['28px','34px','40px']} />
                        <Text fontSize={['0.65rem','0.85rem','1rem']}>{match.homeFifaCode}</Text>
                    </VStack>
                    {/* Score */}
                    <VStack alignSelf='center'>
                        <Text fontSize={['1rem','1.3rem','1.5rem']} fontWeight='bold'>{homeScore ?? ' '} - {awayScore ?? ' '}</Text>
                        <Text fontSize={['0.5rem','0.65rem','0.8rem']}>{underText(match.finishCode)}</Text>
                    </VStack>
                    {/* Team 2 */}
                    <VStack gap='0' flex='1'>
                        <Flag countryCode={match.awayFlagCode} w={['28px','34px','40px']} />
                        <Text fontSize={['0.65rem','0.85rem','1rem']}>{match.awayFifaCode}</Text>
                    </VStack>
                </Flex>
            </Box>
        </Box>
        );
}

function Match(props: MatchProps) {
    const homeScore = (props.finishCode === 'FT') ? props.homeScore : props.homeET;
    const awayScore = (props.finishCode === 'FT') ? props.awayScore : props.awayET;
    const underText = (code: string) => {
        if (code === 'PEN') {
            return `PEN: ${props.homePen} - ${props.awayPen}`;
        } else {
            return code;
        }
    }

    return (
        <Box color='gray.700' border='1px solid' borderColor='gray.200' borderRadius='md' p='5'>
            <VStack separator={<Separator borderColor='gray.200'/>}>
                <Text fontSize='0.8rem'>{getFormattedDate(props.date)}</Text>
                <Flex w='100%'>
                    {/* Team 1 */}
                    <VStack gap='1' flex='1'>
                        <Flag countryCode={props.homeFlagCode} w='60px'/>
                        <Text fontSize='1rem' fontWeight='semibold'>{props.homeTeam}</Text>
                    </VStack>
                    {/* Score */}
                    <VStack alignSelf='center'>
                        <Text fontSize='2rem' fontWeight='bold'>{homeScore ?? ' '} - {awayScore ?? ' '}</Text>
                        <Text fontSize='1rem'>{underText(props.finishCode)}</Text>
                    </VStack>
                    {/* Team 2 */}
                    <VStack gap='1' flex='1'>
                        <Flag countryCode={props.awayFlagCode} w='60px' />
                        <Text fontSize='1rem' fontWeight='semibold'>{props.awayTeam}</Text>
                    </VStack>
                </Flex>
                <Accordion.Root w='100%' collapsible>
                    <Accordion.Item value="details" border='white'>
                        <Accordion.ItemTrigger justifyContent='center'>
                            <Text fontSize='0.8rem' color='gray.800'>Details</Text>
                            <Accordion.ItemIndicator />
                        </Accordion.ItemTrigger>
                        <Accordion.ItemContent>
                            <Accordion.ItemBody>
                                {MatchDetails(props.homeEvents, props.awayEvents)}
                            </Accordion.ItemBody>
                        </Accordion.ItemContent>
                    </Accordion.Item>
                </Accordion.Root>
            </VStack>
        </Box>
    );
}

export function Matches() {
    const localTZ = getLocalTimeZone();
    const [match, setMatch] = useState<MatchProps[]>([]);
    const [date, setDate] = useState<DateValue>(today(localTZ));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                const params = new URLSearchParams({
                    date: date.toString(),
                    zone: localTZ
                })

                const res = await fetch(`${API_URL}/match?${params.toString()}`);
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
        setDate(date.subtract({days:1}))
    }

    function nextDate() {
        setDate(date.add({days:1}))
    }

    return (
        <VStack>
            <HStack>
                <IconButton aria-label='Previous' onClick={prevDate} color='gray.500' backgroundColor='gray.100' borderColor='gray.200'>
                    <FaChevronLeft />
                </IconButton>
                <MatchDatePicker date={date} setDate={setDate}/>
                <IconButton aria-label='Next' onClick={nextDate} color='gray.500' backgroundColor='gray.100' borderColor='gray.200'>
                    <FaChevronRight />
                </IconButton>
            </HStack>
            {isLoading ? <Spinner mt='10' size='xl'/> : null}
            <Flex direction='column' w={{base: '100%', md: '350px'}} gap='5' mb='5'>
                {match.map((m, i) => <Match key={i} {...m}/>)}
            </Flex>
            {(!isLoading && match.length === 0) ? <Heading fontSize='1.25rem' color='gray.500' mt='20'>No matches on this day.</Heading> : null}
        </VStack>
    )
}