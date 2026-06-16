import * as Flags from 'country-flag-icons/react/3x2';
import { Icon } from '@chakra-ui/react';

interface FlagProps {
    countryCode: string,
    size?: "sm" | "md" | "lg"
}

const sizes = {
    sm: '30px',
    md: '40px',
    lg: '60px'
}

export function Flag({countryCode, size = 'sm'}: FlagProps) {
    if (!countryCode) { return null; }

    const key = countryCode as keyof typeof Flags;
    const FlagComponent = Flags[key];

    if (!FlagComponent) {
        console.warn(`Flag component for country code "${countryCode}" not found.`);
        return null; 
    }

    return (
        <Icon w={sizes[size]} h='auto' border='1px solid' borderColor='gray.300' asChild>
            <FlagComponent />
        </Icon>
);
}