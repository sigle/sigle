import { eachDayOfInterval, format } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnalyticsHistoricalResponse } from '../../../types';
import { AreaChart } from './AreaChart';
import { WithParentSizeProvidedProps } from '@visx/responsive/lib/enhancers/withParentSize';
import { withParentSize } from '@visx/responsive';
import { scaleLinear, scaleTime } from '@visx/scale';
import { bisector, extent, max } from 'd3-array';
import { Bar, Line } from '@visx/shape';
import { AxisBottom } from '@visx/axis';
import { styled, theme } from '../../../stitches.config';
import {
  defaultStyles,
  TooltipWithBounds,
  useTooltip,
  useTooltipInPortal,
} from '@visx/tooltip';
import { localPoint } from '@visx/event';

interface StatsData {
  value: number;
  date: string;
  visits: number;
}

interface ViewsData {
  value: number;
  date: string;
}

interface VisitsData {
  value: number;
  date: string;
}

// prevent flash of no content in graph by initializing range data with a constant value (1)
const today = new Date();
const fromDate = new Date(new Date().setDate(today.getDate() - 30));

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

const tooltipStyles = {
  ...defaultStyles,
  background: theme.colors.gray1.toString(),
  border: '1px solid',
  borderColor: theme.colors.gray7.toString(),
  color: theme.colors.gray11.toString(),
  padding: 8,
  boxShadow: 'none',
};

const TooltipDate = styled('p', { fontSize: 14 });

const TooltipText = styled('p', { mt: '$2' });

const fontFamily = '"Open Sans", sans-serif';
const axisColor = theme.colors.gray6.toString();
const axisLabelColor = theme.colors.gray11.toString();
const axisBottomTickLabelProps = {
  textAnchor: 'middle' as const,
  fontFamily,
  fontSize: 12,
  fill: axisLabelColor,
};

const margin = {
  top: 20,
  left: 0,
  bottom: 20,
  right: 0,
};

// accessors
const getDate = (d: StatsData) => new Date(d.date);
const getValue = (d: StatsData) => d.value;
const getVisits = (d: StatsData) => d.visits;
const bisectDate = bisector<StatsData, Date>((d) => new Date(d.date)).left;

const StatsMonthly = ({
  parentWidth: width,
  parentHeight: height,
}: WithParentSizeProvidedProps) => {
  const [viewData, setViewData] = useState<ViewsData[]>(initialRange);
  const [visitData, setVisitData] = useState<VisitsData[]>(initialRange);
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

    const views: ViewsData[] = statsData.historical.map((item) => {
      return {
        value: item.pageviews,
        date: item.date,
      };
    });

    const visits: VisitsData[] = statsData.historical.map((item) => {
      return {
        value: item.visits,
        date: item.date,
      };
    });

    const stats: StatsData[] = statsData.historical.map((item) => {
      return {
        value: item.pageviews,
        date: item.date,
        visits: item.visits,
      };
    });

    setViewData(views);
    setVisitData(visits);
    setData(stats);
  };

  const tickFormat = (d: any) => {
    return format(d, 'dd/MM');
  };

  // bounds
  const innerWidth = width! - margin.left - margin.right;
  const innerHeight = height! - margin.top - margin.bottom;

  const xMax = Math.max(width! - margin.left - margin.right, 0);
  const yMax = Math.max(innerHeight! - 10, 0);

  // scales
  const dateScale = useMemo(
    () =>
      scaleTime({
        range: [margin.left, innerWidth + margin.left],
        domain: extent(data, getDate) as [Date, Date],
      }),
    [xMax, margin.left, data]
  );

  const viewsValueScale = useMemo(
    () =>
      scaleLinear({
        range: [innerHeight + margin.top, margin.top],
        domain: [0, max(data, getValue) || 0],
        nice: true,
      }),
    [yMax, data]
  );

  const visitsValueScale = useMemo(
    () =>
      scaleLinear({
        range: [innerHeight + margin.top, margin.top],
        domain: [0, max(data, getVisits) || 0],
        nice: true,
      }),
    [yMax, data]
  );

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
        tooltipTop: viewsValueScale(getValue(d)),
      });
    },
    [showTooltip, viewsValueScale, dateScale]
  );

  return (
    <>
      <svg ref={containerRef} width={width} height={height}>
        <AreaChart
          margin={margin}
          yMax={yMax}
          xScale={dateScale}
          yScale={viewsValueScale}
          width={width!}
          color="purple"
          data={viewData}
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

          <AxisBottom
            top={yMax}
            scale={dateScale}
            numTicks={7}
            tickLabelProps={() => axisBottomTickLabelProps}
            stroke={axisColor}
            tickStroke={axisColor}
            tickFormat={tickFormat}
            hideTicks={true}
          />

          {tooltipData && (
            <g>
              <Line
                from={{ x: tooltipLeft, y: margin.top }}
                to={{ x: tooltipLeft, y: innerHeight + margin.top }}
                stroke={axisColor}
                strokeWidth={1}
                pointerEvents="none"
              />
            </g>
          )}
        </AreaChart>

        <AreaChart
          margin={margin}
          yMax={yMax}
          xScale={dateScale}
          yScale={visitsValueScale}
          width={width!}
          color="green"
          data={visitData}
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
        </AreaChart>
      </svg>
      {tooltipData && (
        <div>
          <TooltipInPortal
            key={Math.random()}
            top={tooltipTop - 40}
            left={tooltipLeft + 16}
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

const enhancedStatsMonthly = withParentSize(StatsMonthly);

export { enhancedStatsMonthly as StatsMonthly };
