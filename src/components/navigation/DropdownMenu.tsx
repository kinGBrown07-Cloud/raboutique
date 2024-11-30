import React from 'react';
import {
  Box,
  Button,
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  MenuList,
  MenuItem,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface MenuLink {
  title: string;
  path: string;
  description?: string;
  icon?: React.ReactNode;
}

interface MenuSection {
  title: string;
  links: MenuLink[];
}

interface DropdownMenuProps {
  title: string;
  sections?: MenuSection[];
  links?: MenuLink[];
  icon?: React.ReactNode;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  title,
  sections,
  links,
  icon,
}) => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setOpen(false);
  };

  const handleListKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <>
      <Button
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        endIcon={<KeyboardArrowDownIcon />}
        startIcon={icon}
        sx={{
          color: 'text.primary',
          '&:hover': {
            bgcolor: 'transparent',
            color: 'primary.main',
          },
          transition: 'all 0.2s',
          transform: open ? 'translateY(2px)' : 'none',
        }}
      >
        {title}
      </Button>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        placement="bottom-start"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          mt: 1,
        }}
      >
        {({ TransitionProps }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: 'top left',
            }}
          >
            <Paper
              elevation={4}
              sx={{
                borderRadius: 2,
                minWidth: 280,
                maxWidth: sections ? 600 : 320,
                overflow: 'hidden',
                bgcolor: 'background.paper',
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Box>
                  {sections ? (
                    // Menu avec sections
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: sections.length > 1 ? '1fr 1fr' : '1fr',
                        gap: 2,
                        p: 2,
                      }}
                    >
                      {sections.map((section) => (
                        <Box key={section.title}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            sx={{ px: 2, py: 1 }}
                          >
                            {section.title}
                          </Typography>
                          <MenuList>
                            {section.links.map((link) => (
                              <MenuItem
                                key={link.path}
                                onClick={() => handleMenuItemClick(link.path)}
                                sx={{
                                  borderRadius: 1,
                                  mx: 1,
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                  },
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {link.icon && (
                                    <Box sx={{ mr: 2, color: 'primary.main' }}>
                                      {link.icon}
                                    </Box>
                                  )}
                                  <Box>
                                    <Typography variant="body2">
                                      {link.title}
                                    </Typography>
                                    {link.description && (
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ display: 'block' }}
                                      >
                                        {link.description}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              </MenuItem>
                            ))}
                          </MenuList>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    // Menu simple
                    <MenuList
                      autoFocusItem={open}
                      id="menu-list-grow"
                      onKeyDown={handleListKeyDown}
                      sx={{ p: 1 }}
                    >
                      {links?.map((link) => (
                        <MenuItem
                          key={link.path}
                          onClick={() => handleMenuItemClick(link.path)}
                          sx={{
                            borderRadius: 1,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {link.icon && (
                              <Box sx={{ mr: 2, color: 'primary.main' }}>
                                {link.icon}
                              </Box>
                            )}
                            <Box>
                              <Typography variant="body2">{link.title}</Typography>
                              {link.description && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: 'block' }}
                                >
                                  {link.description}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </MenuList>
                  )}
                </Box>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default DropdownMenu;
