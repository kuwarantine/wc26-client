import * as Flags from 'country-flag-icons/react/3x2';
import { chakra, Icon, IconProps } from '@chakra-ui/react';

interface BaseFlagProps {
    countryCode: string,
}

interface FlagProps extends IconProps, BaseFlagProps {}

function shouldForwardProp(prop: string) {
    return prop === 'w' || prop === 'countryCode';
}

export function BaseFlag(props: FlagProps) {
    if (!props.countryCode) { return null; }

    const key = props.countryCode as keyof typeof Flags;
    const FlagComponent = Flags[key];

    if (!FlagComponent) {
        console.warn(`Flag component for country code "${props.countryCode}" not found.`);
        return null; 
    }

    return (
        <Icon w={props.w} h='auto' border='1px solid' borderColor='gray.300' asChild>
            <FlagComponent />
        </Icon>
);
}

export const Flag = chakra(BaseFlag, {}, { shouldForwardProp });