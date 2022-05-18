import { AreaClosed, LinePath } from '@visx/shape';
import { defaultStyles } from '@visx/tooltip';
import { LinearGradient } from '@visx/gradient';
import { curveNatural } from '@visx/curve';
import { AxisScale } from '@visx/axis';
import { theme } from '../../../stitches.config';
import { WithParentSizeProps } from '@visx/responsive/lib/enhancers/withParentSizeModern';
import { Group } from '@visx/group';

const violet = theme.colors.violet3.toString();
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
    <Group left={left || margin?.left} top={top || margin?.top}>
      <LinearGradient
        id={color === 'purple' ? 'purple-gradient' : 'green-gradient'}
        from={gradient}
        fromOpacity={0.3}
        to={gradient}
        toOpacity={0}
      />
      <LinePath
        data={data}
        x={(d) => xScale(getDate(d)) ?? 0}
        y={(d) => yScale(getValue(d)) ?? 0}
        stroke={color === 'purple' ? violetStroke : greenStroke}
        strokeWidth={4}
        curve={curveNatural}
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
