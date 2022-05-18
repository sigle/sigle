import { AreaClosed, LinePath } from '@visx/shape';
import { LinearGradient } from '@visx/gradient';
import { curveNatural } from '@visx/curve';
import { AxisScale } from '@visx/axis';
import { theme } from '../../../stitches.config';
import { WithParentSizeProps } from '@visx/responsive/lib/enhancers/withParentSizeModern';
import { Group } from '@visx/group';

const violet = theme.colors.violet5.toString();
const green = theme.colors.green3.toString();

const violetStroke = theme.colors.violet11.toString();
const greenStroke = theme.colors.green11.toString();

// accessors
const getDate = (d: StatsData) => new Date(d.date);
const getValue = (d: StatsData) => d.value;

interface StatsData {
  value: number;
  date: string;
}

interface AreaChartProps extends WithParentSizeProps {
  data: StatsData[];
  color: 'purple' | 'green';
  margin?: { top: number; right: number; bottom: number; left: number };
  width: number;
  top?: number;
  left?: number;
  yMax: number;
  xScale: AxisScale<number>;
  yScale: AxisScale<number>;
  children?: React.ReactNode;
}

export const AreaChart = ({
  margin,
  data,
  color,
  width,
  yMax,
  top,
  left,
  xScale,
  yScale,
  children,
}: AreaChartProps) => {
  if (width! < 10) return null;

  const gradient = color === 'purple' ? violet : green;

  return (
    <Group
      style={{ border: '1px solid red' }}
      left={left || margin?.left}
      top={top || margin?.top}
    >
      <LinePath
        data={data}
        x={(d) => xScale(getDate(d)) ?? 0}
        y={(d) => yScale(getValue(d)) ?? 0}
        stroke={color === 'purple' ? violetStroke : greenStroke}
        strokeWidth={4}
        curve={curveNatural}
      />
      <LinearGradient
        id={color === 'purple' ? 'purple-gradient' : 'green-gradient'}
        from={gradient}
        fromOpacity={0.5}
        to={gradient}
        toOpacity={0}
        toOffset={0.75}
      />
      <AreaClosed<StatsData>
        data={data}
        x={(d) => xScale(getDate(d)) ?? 0}
        y={(d) => yScale(getValue(d)) ?? 0}
        yScale={yScale}
        fill={
          color === 'purple' ? 'url(#purple-gradient)' : 'url(#green-gradient)'
        }
        curve={curveNatural}
      />
      {children}
    </Group>
  );
};
