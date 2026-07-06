import { Badge, Box, Flex } from "@chakra-ui/react";

export function LiveBadge() {
    const badgeColor = 'green';
    const dotColor = 'orange';

    return (
        <Badge size='xs' colorPalette={badgeColor} fontWeight='bold'>
            <Flex position='relative' h='8px' w='8px' align='center' justify='center'>
                <Box position='absolute' h='100%' w='100%' borderRadius='full' bg={`${dotColor}.500`}
                     animation="ping 2s cubic-bezier(0.16, 1, 0.3, 1) infinite"/>
                <Box h='100%' w='100%' borderRadius='full' bg={`${dotColor}.500`} />
            </Flex>
            LIVE
        </Badge>
    );
}