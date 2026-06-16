import {
    Table,
    Text,
    VStack,
    Box,
    Spinner,
    Flex,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { API_URL } from '../lib/Constants';
import { Flag } from './Flag';
import './Group.css';

export interface TeamData {
    id: number,
    position: number,
    country: string,
    flagCode: string,
    fifaCode: string,
    won: number,
    drawn: number,
    lost: number,
    goalsFor: number,
    goalsAgainst: number
    groupId: number
}

export interface GroupProps {
    id: number,
    teams: TeamData[]
}

function TeamRow(team: TeamData) {
    const played = team.won + team.drawn + team.lost
    const gd = team.goalsFor - team.goalsAgainst
    const points = 3*team.won + team.drawn

    const teamCol = <Flex gap={[2,3]}>
                        {team.position}
                        <Flag countryCode={team.flagCode} />
                        <Text hideFrom='md'>{team.fifaCode}</Text>
                        <Text hideBelow='md'>{team.country}</Text>
                    </Flex>;
    


    const widths = {base: '50px', md: '60px'};
    const cols = [
        {key: 'team', value: teamCol, hideMobile: false, width: 'auto', bold: true},
        {key: 'played', value: played, hideMobile: false, width: widths, bold: false},
        {key: 'win', value: team.won, hideMobile: false, width: widths, bold: false},
        {key: 'draw', value: team.drawn, hideMobile: false, width: widths, bold: false},
        {key: 'loss', value: team.lost, hideMobile: false, width: widths, bold: false},
        {key: 'for', value: team.goalsFor, hideMobile: true, width: widths, bold: false},
        {key: 'against', value: team.goalsAgainst, hideMobile: true, width: widths, bold: false},
        {key: 'diff', value: gd, hideMobile: false, width: widths, bold: false},
        {key: 'points', value: points, hideMobile: false, width: widths, bold: true}
    ];

    return (
        <Table.Row key={team.id}>
            {cols.map(col => <Table.Cell w={col.width} fontWeight={col.bold ? 'semibold' : 'normal'} hideBelow={col.hideMobile ? 'md' : undefined} px={[1, 3]} py={[2, 3]} textAlign='center' key={col.key}>{col.value}</Table.Cell>)}
        </Table.Row>
    )
}


function GroupTable(props: GroupProps) {
    const columns = ['', 'MP', 'W', 'D', 'L ', 'GF', 'GA', 'GD', 'P']
    const hideMobile = ['GF', 'GA'];

    return(
        <Box border='1px solid' borderColor='gray.100' borderRadius='md' p={[3, 3]}>
            <VStack alignItems='start'>
                <Text fontWeight='bold' color='gray.600' fontSize='1.25rem'>Group {String.fromCharCode(65+props.id)}</Text>
                <Table.ScrollArea w='100%'>
                    <Table.Root id='group' fontSize='clamp(1rem, 0.95rem + 0.25vw, 1.25rem)'>
                        <Table.Header>
                            <Table.Row key='titles'>
                                {columns.map((column, i) => 
                                <Table.ColumnHeader color='gray.500' fontWeight={column === 'P' ? 'semibold' : 'normal'} hideBelow={hideMobile.includes(column) ? 'md' : undefined} textAlign='center' key={i}>{column}</Table.ColumnHeader>)}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {props.teams.map((team) => TeamRow(team))}
                        </Table.Body>
                    </Table.Root>
                </Table.ScrollArea>
            </VStack>
        </Box>
    )
}

export function GroupTables() {
    const [teams, setTeams] = useState<TeamData[][]>([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(API_URL+'/groups');
                const json = await res.json();
                const teamArr: TeamData[][] = [[],[],[],[],[],[],[],[],[],[],[],[]];

                for (const row of json) {
                const data: TeamData = {id: row.id, position: row.position, flagCode: row.flag_code, fifaCode: row.fifa_code, country: row.country, won: row.won, drawn: row.drawn, lost: row.lost, goalsFor: row.goals_for, goalsAgainst: row.goals_against, groupId: row.groupid};
                teamArr[data.groupId].push(data);
                }
                setTeams(teamArr);
                setIsLoading(false);
            } catch (err) {
                console.log(err);
            }
        }

    fetchData();
  }, []);

  return (
    <>
        {isLoading ? <Spinner size='xl'/>: null}
        <VStack align='stretch' gap='5'>
            {teams.map((groupTeams, i) => <GroupTable key={i} id={i} teams={groupTeams} />)}
        </VStack>
    </>
  );
}

