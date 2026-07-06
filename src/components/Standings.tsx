import { Table, SkeletonText, Box, Icon } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { API_URL } from "../lib/Constants";
import { VscDash, VscTriangleDown, VscTriangleUp } from "react-icons/vsc";
import { useLiveContext, UserPoints } from "../LiveMatchContext";

const columns = ['', 'Team Name', '', 'Points', '+'];

interface LastMatchCellProps {
    points: number,
    shade: 'green' | 'yellow' | 'none'
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
    if (props.shade === 'none') {
        return (
            <Table.Cell px={[0,3]} textAlign="center" fontSize='inherit'>{props.points}</Table.Cell>
        );
    } else {
        return (
            <Table.Cell
                px={[0,3]}
                bg={props.shade === 'green' ? 'green.subtle' : 'yellow.subtle'}
                borderLeft='3px solid'
                borderLeftColor={props.shade === 'green' ? 'green.solid' : 'yellow.solid'}
                fontWeight='semibold'
                textAlign="center" fontSize='inherit'>
                    {props.points}
            </Table.Cell>
        );
    }   
}

function ChangeIcon(current: number, previous: number) {
    return (
        <>
            {current < previous && <Icon color='green' ><VscTriangleUp /></Icon>}
            {current > previous && <Icon color='red'><VscTriangleDown /></Icon>}
            {current === previous && <Icon color='gray'><VscDash /></Icon>}
        </>
    );
}

export function Standings() {
    const [standings, setStandings] = useState<UserPoints[]>([]);
    const [loading, setLoading] = useState(true);
    const liveStandings = useLiveContext()?.standings;

    useEffect(() => {
        if (liveStandings) {
            setLoading(false);
            return;
        }

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
    }, [liveStandings]);

    const displayedStandings = liveStandings ?? standings;
    const ranks = ranksWithTies(displayedStandings);
    const maxLast = displayedStandings.reduce((max, u) => Math.max(max, u.new_points), 0);

    return (
        <Box>
            <Table.Root maxW='450px' mx='auto' fontSize='clamp(1rem, 0.95rem + 0.25vw, 1.25rem)'>
                <Table.Header>
                    <Table.Row key='titles'>
                        {columns.map((col, i) => <Table.ColumnHeader fontWeight='bold' textAlign='center' key={i}>{col}</Table.ColumnHeader>)}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {displayedStandings.map((user, i) => 
                        <Table.Row key={i}>
                            <Table.Cell textAlign='center' px={[0, 3]} fontWeight='bold' key='pos'>{ranks[i]}</Table.Cell>
                            <Table.Cell textAlign='center' px={[0, 3]} key='name'>{user.name}</Table.Cell>
                            <Table.Cell textAlign='center' px={[0, 3]} key='change'>{ChangeIcon(user.current_rank, user.previous_rank)}</Table.Cell>
                            <Table.Cell textAlign='center' px={[0, 3]} fontWeight='semibold' key='pts'>{user.points}</Table.Cell>
                            <LastMatchCell points={user.new_points} shade={user.new_points === maxLast ? 'green' : user.new_points === 0 ? 'none' : 'yellow'} />
                        </Table.Row>)}
                </Table.Body>
            </Table.Root>
            <SkeletonText loading={loading} noOfLines={20} gap="10"/>
        </Box>
    );
}