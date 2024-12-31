import * as React from "react";
import Svg, { Path } from "react-native-svg";

const ThreeDotsVertical = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={props.width || 24}
    height={props.height || 24}
    fill="none"
    color={props.color || '#6E6E6E'}
    {...props}
  >
    {/* Chấm trên */}
    <Path
      d="M12 6H12.01"
      stroke="currentColor"
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Chấm giữa */}
    <Path
      d="M12 12H12.01"
      stroke="currentColor"
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Chấm dưới */}
    <Path
      d="M12 18H12.01"
      stroke="currentColor"
      strokeWidth={props.strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default ThreeDotsVertical;
