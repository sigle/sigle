import { AreaClosed, LinePath } from '@visx/shape';
import { LinearGradient } from '@visx/gradient';
import { curveBasis, curveNatural } from '@visx/curve';
import { AxisBottom, AxisLeft, AxisScale } from '@visx/axis';
import { theme } from '../../../stitches.config';
import { WithParentSizeProps } from '@visx/responsive/lib/enhancers/withParentSizeModern';
import { Group } from '@visx/group';
import { StatsData } from '../../../types';

const violet = theme.colors.violet5.toString();
const green = theme.colors.green3.toString();

const violetStroke = theme.colors.violet11.toString();
const greenStroke = theme.colors.green11.toString();

// accessors
const getDate = (d: StatsData) => new Date(d.date);
const getViews = (d: StatsData) => d.value;
const getVisits = (d: StatsData) => d.visits;

interface AreaChartProps extends WithParentSizeProps {
  data: StatsData[];
  margin: { top: number; right: number; bottom: number; left: number };
  width: number;
  height: number;
  top?: number;
  left?: number;
  yMax: number;
  xScale: AxisScale<number>;
  yScale: AxisScale<number>;
  tickFormat?: (d: any) => string;
  children?: React.ReactNode;
}

export const AreaChart = ({
  margin,
  data,
  width,
  height,
  yMax,
  top,
  left,
  xScale,
  yScale,
  tickFormat,
  children,
}: AreaChartProps) => {
  if (width! < 10) return null;

  const fontFamily = '"Open Sans", sans-serif';
  const axisColor = theme.colors.gray6.toString();
  const axisLabelColor = theme.colors.gray11.toString();
  const axisBottomTickLabelProps = {
    textAnchor: 'middle' as const,
    fontFamily,
    fontSize: 12,
    fill: axisLabelColor,
  };
  const axisLeftTickLabelProps = {
    dx: '-0.25em',
    dy: '0.25em',
    fontFamily,
    fontSize: 12,
    textAnchor: 'end' as const,
    fill: axisLabelColor,
  };

  return (
    <Group left={left || margin.left} top={top || margin.top}>
      <LinearGradient
        id={'purple-gradient'}
        from={violet}
        fromOpacity={0.7}
        to={violet}
        toOpacity={0}
      />
      <LinePath
        data={data}
        x={(d) => xScale(getDate(d)) ?? 0}
        y={(d) => yScale(getViews(d)) ?? 0}
        stroke={violetStroke}
        strokeWidth={4}
        curve={curveNatural}
      />
      <AreaClosed<StatsData>
        data={data}
        x={(d) => xScale(getDate(d)) ?? 0}
        y={(d) => yScale(getViews(d)) ?? 0}
        yScale={yScale}
        fill={'url(#purple-gradient)'}
        curve={curveNatural}
      />

      <LinearGradient
        id={'green-gradient'}
        from={green}
        fromOpacity={0.7}
        to={green}
        toOpacity={0}
      />
      <LinePath
        data={data}
        x={(d) => xScale(getDate(d)) ?? 0}
        y={(d) => yScale(getVisits(d)) ?? 0}
        stroke={greenStroke}
        strokeWidth={4}
        curve={curveBasis}
      />
      <AreaClosed<StatsData>
        data={data}
        x={(d) => xScale(getDate(d)) ?? 0}
        y={(d) => yScale(getVisits(d)) ?? 0}
        yScale={yScale}
        fill={'url(#green-gradient)'}
        curve={curveBasis}
      />
      <AxisBottom
        top={yMax + 2}
        scale={xScale}
        numTicks={7}
        tickLabelProps={() => axisBottomTickLabelProps}
        stroke={axisColor}
        tickStroke={axisColor}
        tickFormat={tickFormat}
        hideTicks={true}
      />
      <AxisLeft
        scale={yScale}
        numTicks={5}
        stroke={axisColor}
        tickStroke={axisColor}
        tickLabelProps={() => axisLeftTickLabelProps}
      />
      {children}
    </Group>
  );
};
