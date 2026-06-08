import { Table, TableContainer, Tbody, Thead, Tr, Td, Th, SkeletonText } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { API_URL } from "../lib/Constants";

const columns = ['Position', 'Team Name', 'Points'];

interface UserPoints {
    name: string,
    points: number
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

export function Standings() {
    const [standings, setStandings] = useState<UserPoints[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(API_URL+'/standings');
                const json = await res.json();
                setStandings(json);
                setIsLoading(false);
            } catch (err) {
                console.log(err);
            }
        }

        fetchData();
    }, []);

    const ranks = ranksWithTies(standings);

    return (
        <TableContainer>
            <Table fontSize='clamp(1rem, 0.95rem + 0.25vw, 1.25rem)'>
                <Thead>
                    <Tr key='titles'>
                        {columns.map((col, i) => <Th textAlign='center' key={i}>{col}</Th>)}
                    </Tr>
                </Thead>
                <Tbody>
                    {standings.map((user, i) => 
                        <Tr key={i}>
                            <Td textAlign='center' px={[0, 3]} fontWeight='bold' key='pos'>{ranks[i]}</Td>
                            <Td textAlign='center' px={[0, 3]} key='name'>{user.name}</Td>
                            <Td textAlign='center' px={[0, 3]} key='pts'>{user.points}</Td>
                        </Tr>)}
                </Tbody>
            </Table>
            <SkeletonText isLoaded={!isLoading} noOfLines={20} spacing={10}/>
        </TableContainer>
    );
}