/* eslint-disable max-len */
import React from 'react';

import { IIconProps } from './type';

export const Star1: React.FC<IIconProps> = ({
  size = 24, color = 'currentcolor', ...otherProps
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill={color}
    viewBox="0 0 24 22"
    style={{ color }}
    {...otherProps}
  >
    <path d="M11.0825 1.61573C11.4307 0.812853 12.5693 0.812852 12.9175 1.61573L15.0238 6.47316C15.1687 6.80732 15.4838 7.03626 15.8464 7.07081L21.117 7.57304C21.9882 7.65605 22.34 8.73892 21.684 9.31814L17.7152 12.8224C17.4422 13.0635 17.3218 13.4339 17.401 13.7894L18.5521 18.9573C18.7423 19.8115 17.8212 20.4807 17.0676 20.0358L12.5084 17.3441C12.1948 17.159 11.8052 17.159 11.4916 17.3441L6.93241 20.0358C6.17882 20.4807 5.25768 19.8115 5.44794 18.9573L6.59899 13.7894C6.67817 13.4339 6.55781 13.0635 6.28479 12.8224L2.31599 9.31814C1.66 8.73892 2.01184 7.65605 2.88301 7.57304L8.1536 7.07081C8.51618 7.03626 8.8313 6.80732 8.9762 6.47316L11.0825 1.61573Z" strokeWidth="2" />
  </svg>
);
