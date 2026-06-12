import './App.css'
import { Box, ChakraProvider, Flex, Image, VStack, Link as ChakraLink, Spacer, HStack, Separator, IconButton, Drawer, CloseButton, Portal, defaultSystem, AbsoluteCenter } from '@chakra-ui/react'
import { IoMenu } from 'react-icons/io5';
import { Outlet, Link as RouterLink } from 'react-router-dom';

function Logo() {
  return (
    <Flex flex={{base: 'initial', md: '1'}} justifySelf={{base: 'center', md: 'initial'}} justify={{md: 'flex-start'}}>
      <Image src='/wc.png' maxW='200px' aspectRatio='1086/326' m='2'/>
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
    <HStack justifySelf='center' fontSize='20px' gap='24px' separator={<Separator borderColor='gray.200' orientation='vertical' height='16' />}>
      {links.map((l, i) => 
          <ChakraLink asChild>
            <RouterLink key={i} to={l.to}>{l.title}</RouterLink>
          </ChakraLink>)
      }
    </HStack>
  );
}

function MobileLinks() {
  return (
    <VStack fontSize='20px' gap='24px' separator={<Separator borderColor='gray.200' width='50%' />}>
      {links.map((l, i) => 
        <ChakraLink key={i} asChild>
          <RouterLink to={l.to}>{l.title}</RouterLink>
        </ChakraLink>)}
    </VStack>
  );
}

function MenuDrawer() {
  return (
    <Drawer.Root placement='top'>
      <Drawer.Trigger asChild>
        <IconButton ml='4' borderColor='gray.400' backgroundColor='gray.200' aria-label={'Menu'}>
          <IoMenu />
        </IconButton>
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.CloseTrigger asChild>
              <CloseButton />
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
    <Flex as='header' align='center' position='sticky' top='0px' px={[3, 3]} py={[5,5]} w='100vw' borderBottom='1px solid' borderColor='gray.200' backgroundColor='whiteAlpha.800' backdropFilter='saturate(180%) blur(3px)' style={{zIndex: 200}}>
        <Box display='contents' hideFrom='md'>
          <Spacer />
          <AbsoluteCenter>
            <Logo />
          </AbsoluteCenter>
          <MenuDrawer />
        </Box>
        <Box display='contents' hideBelow='md'>
          <Logo />
          <DesktopLinks />
          <Spacer />
        </Box>
    </Flex>
  );
}


function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      <VStack h='100vh'>
        <NavBar />
        <Box maxWidth='100vw' h='100%'>
          <Outlet />
        </Box>
      </VStack>
    </ChakraProvider>
  );
}

export default App;
