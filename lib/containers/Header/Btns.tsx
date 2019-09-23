import React, { useCallback } from 'react';

import { Avatar, EmojiText } from '@lib/components';
import { Popover } from '@lib/components/Popover';
import { Upload, User } from '@lib/icon';
import { AccountStore } from '@lib/stores/AccountStore';
import { ThemeStore } from '@lib/stores/ThemeStore';
import { useTranslation } from '@lib/i18n/useTranslation';
import { useAccountStore, useStores } from '@lib/stores/hooks';
import { Menu, MenuItem, MenuItemLink } from './Menu';
import {
  Href, MenuProfile, RightWarpper, UserName,
} from './styles';
import { BellButton } from './BellButton';

export interface IProps {
  accountStore?: AccountStore;
  themeStore?: ThemeStore;
}

export const Btns = () => {
  const { t } = useTranslation();
  const PopoverRef = React.useRef<Popover>(null);
  const { isLogin, userInfo, logout } = useAccountStore();
  const { themeStore } = useStores();
  const { theme, setTheme } = themeStore;
  const closeMenu = () => {
    PopoverRef.current!.close();
  };
  const handleLogout = useCallback(() => {
    closeMenu();
    logout();
  }, [logout]);
  const switchTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'base' : 'dark');
  }, [setTheme, theme]);
  let content = (
    <Href route="/login">
      <User />
    </Href>
  );
  if (isLogin && userInfo) {
    content = (
      <>
        <BellButton />
        <Popover
          ref={PopoverRef}
          trigger="click"
          mobile
          contentStyle={{ padding: 0 }}
          content={(
            <Menu>
              <MenuItem>
                <MenuItemLink onClick={closeMenu} route={`/@${userInfo.username}`}>
                  <MenuProfile>
                    <Avatar
                      size={48}
                      src={userInfo!.avatar}
                    />
                    <UserName>
                      <EmojiText
                        text={userInfo.fullName}
                      />
                    </UserName>
                  </MenuProfile>
                </MenuItemLink>
              </MenuItem>
              <MenuItem>
                <MenuItemLink onClick={closeMenu} route="/upload">
                  {t('menu.upload')}
                  <Upload size={18} />
                </MenuItemLink>
              </MenuItem>
              <MenuItem>
                <MenuItemLink onClick={closeMenu} route="/setting/profile">
                  {t('menu.setting')}
                </MenuItemLink>
              </MenuItem>
              <MenuItem>
                <MenuItemLink onClick={switchTheme}>
                  {theme === 'dark' ? t('menu.light') : t('menu.dark')}
                </MenuItemLink>
              </MenuItem>
              <MenuItem>
                <MenuItemLink onClick={handleLogout}>
                  {t('menu.signup')}
                </MenuItemLink>
              </MenuItem>
            </Menu>
          )}
        >
          <Avatar
            src={userInfo!.avatar}
          />
        </Popover>
      </>
    );
  }
  return (
    <RightWarpper>
      {content}
    </RightWarpper>
  );
};
