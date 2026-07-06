import './App.css';
import { Box, ChakraProvider, Flex, Image, VStack, Link as ChakraLink, Spacer, HStack, Separator, IconButton, Drawer,
  CloseButton, Portal, defaultSystem, AbsoluteCenter, useDrawerContext } from '@chakra-ui/react';
import { IoMenu } from 'react-icons/io5';
import { Outlet, NavLink } from 'react-router-dom';
import { LastUpdate } from './components/Match';
import { LiveMatchProvider } from './LiveMatchContext';


function Logo() {
  return (
    <Flex flex={{base: 'initial', md: '1'}} justifySelf={{base: 'center', md: 'initial'}}>
      <Image src='/wc.png' objectFit='contain' w={['125px', '150px', '150px', '200px']} aspectRatio='1086/326' m='2'/>
    </Flex>
  );
}

const links = [
  {to: '/standings', title: 'Standings'},
  {to: '/groups', title: 'Groups'},
  {to: '/matches', title: 'Matches'},
  {to: '/knockouts', title: 'Knockouts'},
  {to: '/picks', title: 'Picks'}
];

function DesktopLinks() {
  return (
    <HStack maxW={{md: '420px', lg: 'max-content'}} justifySelf='center' fontSize={{md: '16px', lg: '18px'}} gap='2px'
            separator={<Separator borderColor='gray.200' orientation='vertical' height='16' />}>
      {links.map((l, i) => 
          <ChakraLink asChild justifyContent='center' py='2' px={{md: '7px', lg:'12px'}} borderRadius='full'
          _currentPage={{shadow: 'sm', bg:'rgba(0, 110, 255, 0.25)', border:"1px solid", borderColor:'white/60'}}
          _hover={{"&:not([aria-current='page'])": {bg: 'gray.200/50', outline: 'none'}}}>
            <NavLink key={i} to={l.to}>{l.title}</NavLink>
          </ChakraLink>)
      }
    </HStack>
  );
}

function MobileLinks() {
  const drawer = useDrawerContext();

  return (
    <VStack fontSize='20px' gap='24px' separator={<Separator borderColor='gray.200' width='50%' />}>
      {links.map((l, i) => 
        <ChakraLink key={i} asChild>
          <NavLink to={l.to} onClick={() => drawer.setOpen(false)}>{l.title}</NavLink>
        </ChakraLink>)}
    </VStack>
  );
}

function MenuDrawer() {
  return (
    <Drawer.Root placement='top'>
      <Drawer.Trigger asChild>
        <IconButton size='xl' mt={['2', '3']} mr={['0', '2']}  variant='ghost' bg='transparent' aria-label={'Menu'}
        css={{'& svg': {w: '6', h: 'auto'}}}>
          <IoMenu />
        </IconButton>
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.CloseTrigger asChild>
              <CloseButton size='xl' bg='transparent' css={{'& svg': {w: '6', h: 'auto'}}} />
            </Drawer.CloseTrigger>
            <Drawer.Header display='flex' justifyContent='center'>
              <Image src='/wc.png' maxW='100px' aspectRatio='1086/326' m='2'/>
            </Drawer.Header>
            <Drawer.Body mb='8'>
              <MobileLinks />
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

function NavBar() {
  return (
    <Box as='header' position='sticky' top='0px' maxH='110px' borderBottom='1px solid' borderColor='gray.200' backgroundColor='white/80' backdropFilter='saturate(180%) blur(3px)' zIndex={200}>
      <Flex mx='auto' position='relative' px={[4, 4]} py={[3, 3]} maxW='1280px'>
          <Box display='contents' hideFrom='md'>
            <LastUpdate />
            <AbsoluteCenter mt={[0, 0]} ml={[4, 6]}>
              <Logo />
            </AbsoluteCenter>
            <Spacer />
            <MenuDrawer />
          </Box>
          <Box display='contents' hideBelow='md'>
            <Logo />
            <AbsoluteCenter>
              <DesktopLinks />
            </AbsoluteCenter>
            <LastUpdate />
          </Box>
        </Flex>
      </Box>
  );
}


function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      <LiveMatchProvider>
        <NavBar />
        <Box maxWidth='1280px' mx='auto' my='2' px='5'>
          <Outlet />
        </Box>
      </LiveMatchProvider>
    </ChakraProvider>
  );
}

export default App;
