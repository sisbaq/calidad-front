import { useState } from 'react';
import {
  Box,
  Divider,
  Typography,
  Stack,
  Avatar,
  IconButton,
  Button,
  Menu,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
// import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

export default function AccountPopover() {
  // const navigate = useNavigate();
  const { session, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // const handleGoToProfile = () => {
  //   navigate('/profile');
  //   handleMenuClose();
  // };

  const handleLogout = async () => {
    await logout();
    handleMenuClose();
  };

  return (
    <>
      <IconButton
        onClick={handleProfileMenuOpen}
        sx={{
          p: 0,
          ...(isMenuOpen && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => theme.palette.action.hover,
            },
          }),
        }}
      >
        <Avatar src="" alt={session?.user.fullName} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              p: 0,
              mt: 1.5,
              ml: 0.75,
              width: 250,
              borderRadius: 1.5,
              boxShadow: (theme) => theme.shadows[5],
            },
          },
        }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle2" noWrap>
            {session?.user.fullName}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {session?.user.email}
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ p: 1 }}>
          <Stack direction="row" spacing={1} justifyContent="center">
            {/* <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<AccountCircleIcon />}
              onClick={handleGoToProfile}
            >
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.1, fontWeight: 500 }}>
                  MI
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.1, fontWeight: 500 }}>
                  PERFIL
                </Typography>
              </Box>
            </Button> */}
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.1, fontWeight: 500 }}>
                  CERRAR
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.1, fontWeight: 500 }}>
                  SESIÓN
                </Typography>
              </Box>
            </Button>
          </Stack>
        </Box>
      </Menu>
    </>
  );
}
