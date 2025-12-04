import { styled, useTheme, type Theme, type CSSObject } from '@mui/material/styles';
import { Box, Toolbar, List, CssBaseline, Divider, IconButton, Stack, Collapse, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { type AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import AccountPopover from './AccountPopover';
import { useFilteredNavigation, type NavItem } from './Sidebar.config';

import logoAlcaldia from '@assets/images/alcaldiavert-Azul.png';
import logoSigbaq from '@assets/images/sigbaq.jpg';

const drawerWidth = 280;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  borderRight: 'none',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  borderRight: 'none',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  backgroundColor: 'white',
  color: theme.palette.text.primary,
  elevation: 0,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

export default function DashboardLayout() {
  const theme = useTheme();
  const [open, setOpen] = useState(true);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const navigationItems = useFilteredNavigation();

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <img src={logoAlcaldia} alt="Alcaldía de Barranquilla" style={{ height: '40px' }} />
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={2} alignItems="center">
            <AccountPopover />
          </Stack>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'hidden' }}>
          <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
            <List component="nav">
              {navigationItems.map((item) => (
                <SidebarNavItem key={item.title} item={item} open={open} />
              ))}
            </List>
          </Box>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <img src={logoSigbaq} alt="Sigbaq Logo" style={{ width: open ? '100px' : '40px', transition: 'width 0.2s' }} />
          </Box>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        <Outlet />
      </Box>
    </Box>
  );
}

const SidebarNavItem = ({ item, open }: { item: NavItem, open: boolean }) => {
  const [isExpanded, setExpanded] = useState(false);
  const location = useLocation();

  const isChildActive = item.children ? item.children.some(child => location.pathname.startsWith(`/${item.segment}/${child.segment}`)) : false;

  useEffect(() => {
    if (isChildActive) {
      setExpanded(true);
    }
  }, [isChildActive]);

  if (item.kind === 'header') {
    return open ? (
      <ListSubheader sx={{ 
        bgcolor: 'inherit', 
        textTransform: 'uppercase', 
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'text.secondary',
        my: 1,
        px: 2.5,
        position: 'static'
      }}>
        {item.title}
      </ListSubheader>
    ) : null; // Don't show anything when collapsed
  }

  if (item.children) {
    return (
      <>
        <ListItemButton 
          onClick={() => open && setExpanded(!isExpanded)} 
          sx={{ 
            justifyContent: open ? 'initial' : 'center', 
            px: 2.5,
            minHeight: 48
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: 0, 
            mr: open ? 3 : 'auto', 
            justifyContent: 'center',
            color: 'inherit'
          }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText 
            primary={item.title} 
            sx={{ 
              opacity: open ? 1 : 0,
              whiteSpace: 'normal',
              '& .MuiListItemText-primary': {
                fontSize: '0.875rem',
                fontWeight: 500
              }
            }} 
          />
          {open && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
        <Collapse in={isExpanded && open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children.map((child) => (
              <ListItemButton
                key={child.title}
                component={NavLink}
                to={`/${item.segment}/${child.segment}`}
                sx={{
                  minHeight: 40,
                  pl: 4, // Increased left padding for nesting
                  pr: 2.5,
                  '&.active': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 0, 
                  mr: 3, 
                  justifyContent: 'center',
                  color: 'inherit'
                }}>
                  {child.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={child.title}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.8125rem',
                      fontWeight: 400
                    }
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      </>
    );
  }

  const routeTo = item.segment === "" ? "/" : `/${item.segment}`;
  
  return (
    <ListItemButton
      component={NavLink}
      to={routeTo}
      end={item.segment === ""} // Ensure exact match for home route
      sx={{
        minHeight: 48,
        justifyContent: open ? 'initial' : 'center',
        px: 2.5,
        '&.active': {
          backgroundColor: 'rgba(25, 118, 210, 0.08)',
          color: 'primary.main',
          '& .MuiListItemIcon-root': {
            color: 'primary.main',
          },
        },
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        }
      }}
    >
      <ListItemIcon sx={{ 
        minWidth: 0, 
        mr: open ? 3 : 'auto', 
        justifyContent: 'center',
        color: 'inherit'
      }}>
        {item.icon}
      </ListItemIcon>
      <ListItemText 
        primary={item.title} 
        sx={{ 
          opacity: open ? 1 : 0,
          '& .MuiListItemText-primary': {
            fontSize: '0.875rem',
            fontWeight: 500
          }
        }} 
      />
    </ListItemButton>
  );
};
