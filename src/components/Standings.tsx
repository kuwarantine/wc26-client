import { Table, SkeletonText, Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { API_URL } from "../lib/Constants";

const columns = ['', 'Team Name', 'Points', '+'];

interface UserPoints {
    name: string,
    points: number,
    last_match_points: number
}

interface LastMatchCellProps {
    points: number,
    isMax: boolean
}

function ranksWithTies(standings: UserPoints[]) {
    const pts = new Set<number>();
    const ranks: (number | null)[] = [];
    
    for (let i=0; i<standings.length; i++) {
        if (pts.has(standings[i].points)) { 
            ranks.push(null); 
        } else { 
            ranks.push(i+1);
            pts.add(standings[i].points); 
        }
    }

    return ranks;
}

function LastMatchCell(props: LastMatchCellProps) {
    if (props.isMax) {
        return (
            <Table.Cell
                px={[0,3]}
                bg='green.subtle'
                borderLeft='3px solid'
                borderLeftColor="green.solid"
                fontWeight='semibold'
                textAlign="center" fontSize='inherit'>
                    {props.points}
            </Table.Cell>
        );
    } else {
        return (
            <Table.Cell px={[0,3]} textAlign="center" fontSize='inherit'>{props.points}</Table.Cell>
        );
    }   
}

export function Standings() {
    const [standings, setStandings] = useState<UserPoints[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await fetch(API_URL+'/standings');
                const json = await res.json();
                setStandings(json);
                setLoading(false);
            } catch (err) {
                console.log(err);
            }
        }

        fetchData();
    }, []);

    const ranks = ranksWithTies(standings);
    const maxLast = standings.reduce((max, u) => Math.max(max, u.last_match_points), 0)

    return (
        <Box>
            <Table.Root maxW='450px' mx='auto' fontSize='clamp(1rem, 0.95rem + 0.25vw, 1.25rem)'>
                <Table.Header>
                    <Table.Row key='titles'>
                        {columns.map((col, i) => <Table.ColumnHeader fontWeight='bold' textAlign='center' key={i}>{col}</Table.ColumnHeader>)}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {standings.map((user, i) => 
                        <Table.Row key={i}>
                            <Table.Cell textAlign='center' px={[0, 3]} fontWeight='bold' key='pos'>{ranks[i]}</Table.Cell>
                            <Table.Cell textAlign='center' px={[0, 3]} key='name'>{user.name}</Table.Cell>
                            <Table.Cell textAlign='center' px={[0, 3]} fontWeight='semibold' key='pts'>{user.points}</Table.Cell>
                            <LastMatchCell points={user.last_match_points} isMax={user.last_match_points === maxLast} />
                        </Table.Row>)}
                </Table.Body>
            </Table.Root>
            <SkeletonText loading={loading} noOfLines={20} gap="10"/>
        </Box>
    );
}