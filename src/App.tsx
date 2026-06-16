import './App.css';
import { Box, ChakraProvider, Flex, Image, VStack, Link as ChakraLink, Spacer, HStack, Separator, IconButton, Drawer,
  CloseButton, Portal, defaultSystem, AbsoluteCenter, useDrawerContext } from '@chakra-ui/react';
import { IoMenu } from 'react-icons/io5';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import { LastUpdate } from './components/Match';


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
  {to: '/knockouts', title: 'Knockouts'}
];

function DesktopLinks() {
  return (
    <HStack justifySelf='center' fontSize='20px' gap={{md: '14px', lg: '24px'}} separator={<Separator borderColor='gray.200' orientation='vertical' height='16' />}>
      {links.map((l, i) => 
          <ChakraLink asChild>
            <RouterLink key={i} to={l.to}>{l.title}</RouterLink>
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
          <RouterLink to={l.to} onClick={() => drawer.setOpen(false)}>{l.title}</RouterLink>
        </ChakraLink>)}
    </VStack>
  );
}

function MenuDrawer() {
  return (
    <Drawer.Root placement='top'>
      <Drawer.Trigger asChild>
        <IconButton m='4' borderColor='gray.400' backgroundColor='gray.200' aria-label={'Menu'}>
          <IoMenu />
        </IconButton>
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.CloseTrigger asChild>
              <CloseButton/>
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
    <Box as='header' position='sticky' top='0px' maxH='110px' borderBottom='1px solid' borderColor='gray.200' backgroundColor='whiteAlpha.800' backdropFilter='saturate(180%) blur(3px)' style={{zIndex: 200}}>
      <Flex mx='auto' position='relative' px={[2, 3]} py={[0, 3]} maxW='1280px'>
          <Box display='contents' hideFrom='md'>
            <Box scale={[0.65, 0.85, 1]} transformOrigin='left center'>
              <LastUpdate />
            </Box>
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
      <NavBar />
      <Box maxWidth='1280px' h='100%' mx='auto' my='2' px='5'>
        <Outlet />
      </Box>
    </ChakraProvider>
  );
}

export default App;
