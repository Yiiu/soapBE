import { rem } from 'polished';
import styled from 'styled-components';

export const Wrapper = styled.div`
  display: grid;
  grid-gap: ${rem('32px')};
`;

export const ItemBox = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-gap: ${rem('8px')};
`;

export const UserName = styled.p`
  font-weight: 700;
`;

export const MainBox = styled.div`
  display: grid;
  grid-row-gap: 6px;
`;

export const ContentBox = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-gap: ${rem('14px')};
`;

export const InfoBox = styled.div`
  display: grid;
  grid-template-columns: max-content;
  grid-gap: ${rem('6px')};
  font-size: ${_ => rem(_.theme.fontSizes[0])};
  color: ${_ => _.theme.colors.secondary};
`;