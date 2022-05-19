import { eachDayOfInterval, format } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnalyticsHistoricalResponse, StatsData } from '../../../types';
import { WithParentSizeProvidedProps } from '@visx/responsive/lib/enhancers/withParentSize';
import { withParentSize } from '@visx/responsive';
import { scaleLinear, scaleTime } from '@visx/scale';
import { bisector, extent, max } from 'd3-array';
import { Bar, Line } from '@visx/shape';
import { styled, theme } from '../../../stitches.config';
import { defaultStyles, useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { AreaChart } from './AreaChart';
import { margin, TooltipDate, tooltipStyles, TooltipText } from './utils';

// prevent flash of no content in graph by initializing range data with a constant value (1)
const today = new Date();
const fromDate = new Date(new Date().setDate(today.getDate() - 7));

const dates = eachDayOfInterval({
  start: fromDate,
  end: today,
});

const initialRange: StatsData[] = dates.map((date) => {
  return {
    value: 0,
    date: date.toString(),
    visits: 0,
  };
});

// accessors
const getDate = (d: StatsData) => new Date(d.date);
const getViews = (d: StatsData) => d.value;
const getVisits = (d: StatsData) => d.visits;
const bisectDate = bisector<StatsData, Date>((d) => new Date(d.date)).left;

const tickFormat = (d: any) => {
  return format(d, 'dd/MM');
};

const StatsWeekly = ({
  parentWidth: width,
  parentHeight: height,
}: WithParentSizeProvidedProps) => {
  const [data, setData] = useState<StatsData[]>(initialRange);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const baseUrl = window.location.origin;

    const statsRes = await fetch(
      `${baseUrl}/api/analytics/historical?dateFrom=${format(
        fromDate,
        'yyyy-MM-dd'
      )}&dateGrouping=day`
    );

    const statsData: AnalyticsHistoricalResponse = await statsRes.json();
    const stats: StatsData[] = statsData.historical.map((item) => {
      return {
        value: item.pageviews,
        date: item.date,
        visits: item.visits,
      };
    });

    setData(stats);
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
        range: [0, xMax],
        domain: extent(data, getDate) as [Date, Date],
      }),
    [xMax, margin.left, data]
  );

  const charValueScale = useMemo(() => {
    const maxViews = max(data, getViews) || 0;
    const maxVisits = max(data, getVisits) || 0;

    return scaleLinear({
      range: [yMax, 0],
      domain: [0, maxViews > maxVisits ? maxViews : maxVisits],
      nice: true,
    });
  }, [yMax, data]);

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
        tooltipTop: charValueScale(getViews(d)),
      });
    },
    [showTooltip, charValueScale, dateScale]
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
          height={height!}
          tickFormat={tickFormat}
        >
          <Bar
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            rx={14}
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => hideTooltip()}
          />
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
        </AreaChart>
      </svg>
      {tooltipData && (
        <div>
          <TooltipInPortal
            key={Math.random()}
            top={tooltipTop - 40}
            left={tooltipLeft + 60}
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
            >{`${tooltipData.value} Views`}</TooltipText>
          </TooltipInPortal>
        </div>
      )}
    </>
  );
};

const enhancedStatsWeekly = withParentSize(StatsWeekly);

export { enhancedStatsWeekly as StatsWeekly };
