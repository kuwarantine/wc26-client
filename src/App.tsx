import './App.css'
import { Box, ChakraProvider, Flex, Image, VStack, Link as ChakraLink, Spacer, HStack, StackDivider, Show, Hide, IconButton, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, useDisclosure } from '@chakra-ui/react'
import { IoMenu } from 'react-icons/io5';
import { Outlet, Link as RouterLink } from 'react-router-dom';

function Logo() {
  return (
    <Flex flex={{base: 'initial', md: '1'}} justifySelf={{base: 'center', md: 'initial'}} justify={{md: 'flex-start'}}>
      <Image src='/euros.png' maxW='200px' aspectRatio='1086/482' m='2'/>
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
    <HStack justifySelf='center' fontSize='18' spacing='24px' divider={<StackDivider borderColor='gray.200' />}>
      {links.map((l, i) => <ChakraLink key={i} as={RouterLink} to={l.to} _hover={{textDecoration: 'none'}}>{l.title}</ChakraLink>)}
    </HStack>
  );
}

function MenuButton({onClick}: {onClick: ()=>void}) {
  return (
    <Flex flex='1'>
      <IconButton ml='4' borderColor='gray.400' backgroundColor='gray.200' icon={<IoMenu />} aria-label={'Menu'} onClick={onClick} />
    </Flex>
  );
}

function MobileLinks({onClose}: {onClose: ()=>void}) {
  return (
    <VStack fontSize='24' spacing='24px'>
      {links.map((l, i) => <ChakraLink key={i} as={RouterLink} to={l.to} onClick={onClose} _hover={{textDecoration: 'none'}}>{l.title}</ChakraLink>)}
    </VStack>
  );
}

function MenuDrawer({isOpen, onClose}: {isOpen: boolean, onClose: ()=>void}) {
  return (
    <Drawer isOpen={isOpen} placement='top' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader display='flex' justifyContent='center'>
          <Image src='/euros.png' maxW='100px' aspectRatio='1086/482' m='2'/>
        </DrawerHeader>
        <DrawerBody mb='8'>
          <MobileLinks onClose={onClose}/>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

function NavBar() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex as='header' align='center' position='sticky' top='0px' p={[0, 3]} w='100vw' borderBottom='1px solid' borderColor='gray.200' backgroundColor='whiteAlpha.800' backdropFilter='saturate(180%) blur(3px)' style={{zIndex: 200}}>
        <Hide above='md'>
          <Spacer />
          <Logo />
          <MenuDrawer isOpen={isOpen} onClose={onClose} />
          <MenuButton onClick={onOpen} aria-label='Menu'/>
        </Hide>
        <Show above='md'>
          <Logo />
          <DesktopLinks />
          <Spacer />
        </Show>
    </Flex>
  );
}


function App() {
  return (
    <ChakraProvider>
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
