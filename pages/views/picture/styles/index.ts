import { Info } from '@pages/icon';
import { rem } from 'polished';
import styled from 'styled-components';
import { Cell, Grid } from 'styled-css-grid';

export const Wrapper = styled.div`
  max-width: ${rem('1040px')};
  width: 100%;
  margin: 0 auto;
  margin-top: ${rem('40px')};
  padding: 0 ${rem('20px')};
`;

export const UserHeader = styled(Grid)`
  margin: 0 auto;
  margin-bottom: ${rem('20px')};
  max-width: ${rem('780px')};
`;

export const UserLink = styled.a`
display: flex;
text-decoration: none;
align-items: center;
color: ${_ => _.theme.colors.text};
`;

export const UserName = styled.h3`
  font-size: ${_ => rem(_.theme.fontSizes[2])};
`;

export const UserInfo = styled(Cell)`
  display: flex;
  align-items: center;
`;

export const PictureBox = styled.div`
  border-radius: ${rem('3px')};
  overflow: hidden;
  box-shadow: ${_ => _.theme.colors.shadowColor} ${rem('0px')} ${rem('6px')} ${rem('20px')};
`;

export const Content = styled.div`
  max-width: ${rem('780px')};
  margin: ${rem('48px')} auto;
`;

export const Title = styled.h2`
  font-size: ${_ => rem(_.theme.fontSizes[5])};
  margin-bottom: ${rem('18px')};
`;

export const GpsCotent = styled.div`
  margin: ${rem('24px')} 0;
`;

export const PictureBaseInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${_ => _.theme.colors.secondary};
`;

export const BaseInfoItem = styled.div`
  display: flex;
  align-items: center;
  font-size: ${_ => rem(_.theme.fontSizes[1])};
  & svg {
    margin-right: ${rem('6px')};
    margin-top: -${rem('4px')};
  }
`;

export const BaseInfoHandleBox = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  grid-gap: ${rem('6px')};
`;

export const Bio = styled.div`
  font-size: ${_ => rem(_.theme.fontSizes[2])};
  margin-top: ${rem('18px')};
`;

export const InfoButton = styled(Info)`
  cursor: pointer;
  transition: transform 0.1s;
  &:active {
    transform: scale(0.7);
  }
`;

export const TagBox = styled.div`
  display: grid;
  grid-template-columns: max-content;
  margin-top: ${rem('18px')};
  grid-gap: ${rem('6px')};
  grid-row-gap: ${rem('6px')};
`;