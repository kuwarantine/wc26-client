import {
    Table,
    Text,
    VStack,
    Box,
    Spinner,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { API_URL } from '../lib/Constants';
import './Group.css';

export interface TeamData {
    id: number,
    position: number,
    country: string,
    emoji: string,
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

    const keys = ['pos', 'emj', 'cty', 'pld', 'won', 'drn', 'lst', 'for', 'agt', 'gdf', 'pts'];
    const vals = [team.position, team.emoji, team.country, played, team.won, team.drawn, team.lost, team.goalsFor, team.goalsAgainst, gd, points];

    return (
        <Table.Row key={team.id}>
            {vals.map((v, i) => <Table.Cell px={[0, 3]} py={[2, 3]} textAlign='center' key={keys[i]}>{v}</Table.Cell>)}
        </Table.Row>
    )
}

const columns: string[] = ['', '', '', 'Played', 'Won', 'Drawn', 'Lost', 'For', 'Against', 'Difference', 'Points']

function GroupTable(props: GroupProps) {
    return(
        <Box border='1px solid' borderColor='gray.100' borderRadius='md' p={[3, 3]} m={[5, 5]}>
            <VStack alignItems='start'>
                <Text fontWeight='bold' color='gray.600' fontSize='1.25rem'>Group {String.fromCharCode(65+props.id)}</Text>
                <Table.ScrollArea w='100%'>
                    <Table.Root id='group' fontSize='clamp(1rem, 0.95rem + 0.25vw, 1.25rem)' style={{borderCollapse: 'collapse'}}>
                        <Table.Header>
                            <Table.Row key='titles'>
                                {columns.map((column, i) => <Table.ColumnHeader textAlign='center' key={i}>{column}</Table.ColumnHeader>)}
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
                const data: TeamData = {id: row.id, position: row.position, emoji: row.emoji, country: row.country, won: row.won, drawn: row.drawn, lost: row.lost, goalsFor: row.goals_for, goalsAgainst: row.goals_against, groupId: row.groupid};
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
        {teams.map((groupTeams, i) => <GroupTable key={i} id={i} teams={groupTeams} />)}
    </>
  );
}

