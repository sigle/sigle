import { format } from 'date-fns';
import { useCallback, useMemo } from 'react';
import {
  WithParentSizeProps,
  WithParentSizeProvidedProps,
} from '@visx/responsive/lib/enhancers/withParentSize';
import { withParentSize } from '@visx/responsive';
import { scaleLinear, scaleTime } from '@visx/scale';
import { bisector, extent, max } from 'd3-array';
import { Bar, Line } from '@visx/shape';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { theme } from '../../../stitches.config';
import { AreaChart } from './AreaChart';
import { TooltipDate, tooltipStyles, TooltipText } from './tooltipUtils';
import { StatsData } from './types';

// accessors
const getDate = (d: StatsData) => new Date(d.date);
const getViews = (d: StatsData) => d.pageviews;
const getVisits = (d: StatsData) => d.visits;
const bisectDate = bisector<StatsData, Date>((d) => new Date(d.date)).left;

interface StatsChartProps extends WithParentSizeProps {
  data: StatsData[] | undefined;
  type: 'weekly' | 'monthly' | 'all';
}

const StatsChart = ({
  parentWidth: width,
  parentHeight: height,
  data,
  type,
}: StatsChartProps & WithParentSizeProvidedProps) => {
  const margin = {
    top: 20,
    left: type === 'weekly' || type === 'monthly' ? 28 : 44,
    bottom: 40,
    right: 0,
  };

  const tickFormat = (d: Date) => {
    return format(d, 'dd/MM');
    // TODO enable this part again once we start having more data in
    // if (type === 'weekly' || type === 'monthly') {
    //   return format(d, 'dd/MM');
    // } else {
    //   return format(d, 'MMM yyyy');
    // }
  };

  // bounds
  const innerWidth = width! - margin.left - margin.right;
  const innerHeight = height! - margin.top - margin.bottom;

  const xMax = Math.max(width! - margin.left - margin.right, 0);
  const yMax = Math.max(innerHeight!, 0);

  // scales
  const dateScale = useMemo(
    () =>
      scaleTime({
        range: [margin.left, xMax],
        domain: data && (extent(data, getDate) as [Date, Date]),
      }),
    [xMax, margin.left, data],
  );

  const maxViews = (data && max(data, getViews)) || 0;
  const maxVisits = (data && max(data, getVisits)) || 0;

  const maxValue = maxViews > maxVisits ? maxViews : maxVisits;

  const charValueScale = useMemo(() => {
    return scaleLinear({
      range: [yMax, margin.top],
      domain: [0, maxValue ? maxValue : 10],
    });
  }, [yMax, margin.top, data]);

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  } = useTooltip<StatsData>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  });

  // tooltip handler
  const handleTooltip = useCallback(
    (
      event:
        | React.TouchEvent<SVGRectElement>
        | React.MouseEvent<SVGRectElement>,
    ) => {
      const { x } = localPoint(event) || { x: 0 };
      const x0 = dateScale.invert(x);
      const index = data && bisectDate(data, x0, 1);
      const d0 = data && data[index! - 1];
      const d1 = data && data[index!];
      let d = d0;
      if (d1 && d0 && getDate(d1)) {
        d =
          x0.valueOf() - getDate(d0).valueOf() >
          getDate(d1).valueOf() - x0.valueOf()
            ? d1
            : d0;
      }
      showTooltip({
        tooltipData: d,
        tooltipLeft: x,
        tooltipTop: d && charValueScale(getViews(d)),
      });
    },
    [showTooltip, charValueScale, dateScale],
  );

  return (
    <>
      <svg ref={containerRef} width={width} height={height}>
        <AreaChart
          yScale={charValueScale}
          xScale={dateScale}
          yMax={yMax}
          margin={margin}
          data={data}
          width={width!}
          tickFormat={tickFormat}
        >
          <Bar
            x={margin.left}
            y={margin.top}
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            rx={14}
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => hideTooltip()}
          />
        </AreaChart>
        {tooltipData && (
          <g>
            <Line
              from={{ x: tooltipLeft, y: margin.top }}
              to={{ x: tooltipLeft, y: innerHeight + margin.top }}
              stroke={theme.colors.gray7.toString()}
              strokeWidth={1}
              pointerEvents="none"
            />
          </g>
        )}
      </svg>
      {tooltipData && (
        <div>
          <TooltipInPortal
            key={Math.random()}
            top={tooltipTop - 40}
            left={tooltipLeft}
            style={tooltipStyles}
          >
            <TooltipDate>
              {format(new Date(tooltipData.date), 'EEEE, MMMM d, yyyy')}
            </TooltipDate>
            <TooltipText
              css={{ color: '$green11' }}
            >{`${tooltipData.visits} Visitors`}</TooltipText>
            <TooltipText
              css={{ color: '$violet11' }}
            >{`${tooltipData.pageviews} Views`}</TooltipText>
          </TooltipInPortal>
        </div>
      )}
    </>
  );
};

const enhancedStatsChart = withParentSize<StatsChartProps>(StatsChart);

export { enhancedStatsChart as StatsChart };
