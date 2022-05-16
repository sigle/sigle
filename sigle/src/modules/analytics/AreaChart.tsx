import React, { useMemo, useCallback, useEffect } from 'react';
import { AreaClosed, Bar } from '@visx/shape';
import { scaleTime, scaleLinear } from '@visx/scale';
import { TooltipWithBounds, defaultStyles, useTooltip } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { LinearGradient } from '@visx/gradient';
import { max, extent, bisector } from 'd3-array';
import { curveNatural } from '@visx/curve';
import { AxisBottom } from '@visx/axis';
import { theme } from '../../stitches.config';
import { withParentSize } from '@visx/responsive';
import { WithParentSizeProvidedProps } from '@visx/responsive/lib/enhancers/withParentSize';
import { WithParentSizeProps } from '@visx/responsive/lib/enhancers/withParentSizeModern';

const fontFamily = '"Lato", sans-serif';

type TooltipData = StatsData;

const background = theme.colors.gray11.toString();
const violet = theme.colors.violet11.toString();
const green = theme.colors.green11.toString();

const tooltipStyles = {
  ...defaultStyles,
  background,
  border: '1px solid white',
  color: theme.colors.gray2.toString(),
};

// accessors
const getDate = (d: StatsData) => new Date(d.date);
const getViewValue = (d: StatsData) => d.value;
const bisectDate = bisector<StatsData, Date>((d) => new Date(d.date)).left;

interface StatsData {
  value: number;
  date: string;
}

interface AreaChartProps extends WithParentSizeProps {
  // width: number;
  // height: number;
  data: StatsData[];
  color: 'purple' | 'green';
  margin?: { top: number; right: number; bottom: number; left: number };
}

const AreaChart = ({
  parentWidth: width,
  parentHeight: height,
  margin = { top: 20, left: 0, bottom: 20, right: 0 },
  data,
  color,
}: AreaChartProps & WithParentSizeProvidedProps) => {
  if (width! < 10) return null;

  useEffect(() => {
    if (data) {
      console.log();
    }
  }, []);

  const gradient = color === 'purple' ? violet : green;

  const axisColor = theme.colors.gray11.toString();
  const axisBottomTickLabelProps = {
    textAnchor: 'middle' as const,
    fontFamily,
    fontSize: 12,
    fill: axisColor,
  };

  // bounds
  const innerWidth = width! - margin.left - margin.right;
  const innerHeight = height! - margin.top - margin.bottom;

  const xMax = Math.max(width! - margin.left - margin.right, 0);
  const yMax = Math.max(innerHeight! + 20, 0);

  // scales
  const dateScale = useMemo(
    () =>
      scaleTime({
        range: [margin.left, innerWidth + margin.left],
        domain: extent(data, getDate) as [Date, Date],
      }),
    [innerWidth, margin.left, data]
  );
  const viewValueScale = useMemo(
    () =>
      scaleLinear({
        range: [innerHeight + margin.top, margin.top],
        domain: [0, max(data, getViewValue) || 0],
        nice: true,
      }),
    [margin.top, innerHeight, data]
  );

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  } = useTooltip<StatsData>();

  // tooltip handler
  const handleTooltip = useCallback(
    (
      event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>
    ) => {
      const { x } = localPoint(event) || { x: 0 };
      const x0 = dateScale.invert(x);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      let d = d0;
      if (d1 && getDate(d1)) {
        d =
          x0.valueOf() - getDate(d0).valueOf() >
          getDate(d1).valueOf() - x0.valueOf()
            ? d1
            : d0;
      }
      showTooltip({
        tooltipData: d,
        tooltipLeft: x,
        tooltipTop: viewValueScale(getViewValue(d)),
      });
    },
    [showTooltip, viewValueScale, dateScale]
  );

  return (
    <div>
      <svg width={width} height={height}>
        <LinearGradient
          id={color === 'purple' ? 'purple-gradient' : 'green-gradient'}
          from={gradient}
          fromOpacity={1}
          fromOffset="10%"
          to={gradient}
          toOpacity={0.2}
          toOffset="100%"
        />
        <AreaClosed<StatsData>
          data={data}
          x={(d) => dateScale(getDate(d)) ?? 0}
          y={(d) => viewValueScale(getViewValue(d)) ?? 0}
          yScale={viewValueScale}
          fill={
            color === 'purple'
              ? 'url(#purple-gradient)'
              : 'url(#green-gradient)'
          }
          curve={curveNatural}
        />

        <AxisBottom
          top={yMax}
          scale={dateScale}
          numTicks={7}
          tickLabelProps={() => axisBottomTickLabelProps}
          stroke={axisColor}
          tickStroke={axisColor}
        />

        <Bar
          x={margin.left}
          y={margin.top}
          width={innerWidth}
          height={innerHeight}
          fill="transparent"
          //rx={14}
          onTouchStart={handleTooltip}
          onTouchMove={handleTooltip}
          onMouseMove={handleTooltip}
          onMouseLeave={() => hideTooltip()}
        />

        {tooltipData && (
          <g>
            <circle
              cx={tooltipLeft}
              cy={tooltipTop + 1}
              r={4}
              fill="black"
              fillOpacity={0.1}
              stroke="black"
              strokeOpacity={0.1}
              strokeWidth={2}
              pointerEvents="none"
            />
            <circle
              cx={tooltipLeft}
              cy={tooltipTop}
              r={4}
              fill={gradient}
              stroke="white"
              strokeWidth={2}
              pointerEvents="none"
            />
          </g>
        )}
      </svg>
      {tooltipData && (
        <div>
          <TooltipWithBounds
            key={Math.random()}
            top={tooltipTop - 12}
            left={tooltipLeft + 12}
            style={tooltipStyles}
          >
            {`${getViewValue(tooltipData)} views`}
          </TooltipWithBounds>
        </div>
      )}
    </div>
  );
};

const enhancedAreaChart = withParentSize<AreaChartProps>(AreaChart);

export { enhancedAreaChart as AreaChart };
