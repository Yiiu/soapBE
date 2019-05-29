import { rem } from 'polished';
import React from 'react';
import styled from 'styled-components';
import { Grid } from 'styled-css-grid';

import { UserEntity } from '@pages/common/interfaces/user';
import { Avatar } from '@pages/components';

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
  user: UserEntity;
}

const Wrapper = styled(Grid)`
  width: ${rem('200px')};
  padding: ${rem('14px')} ${rem('10px')};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
`;

const UserBox = styled.div`
  margin-left: ${rem('16px')};
`;

const UserName = styled.p`
  font-size: ${rem('18px')};
  font-weight: 500;
  margin-bottom: ${rem('4px')};
`;

const Bio = styled.p`
  font-size: ${rem('12px')};
  font-weight: 400;
  color: ${_ => _.theme.colors.secondary}
`;

export default ({
  user,
  ...restProps
}: IProps) => {
  return (
    <div {...restProps}>
      <Wrapper columns={1}>
        <Header>
          <Avatar src={user.avatar} size={48} />
          <UserBox>
            <UserName>{user.username}</UserName>
            <Bio>{user.bio}</Bio>
          </UserBox>
        </Header>
      </Wrapper>
    </div>
  );
};
