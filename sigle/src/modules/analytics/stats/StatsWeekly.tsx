import { eachDayOfInterval, format } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnalyticsHistoricalResponse } from '../../../types';
import { WithParentSizeProvidedProps } from '@visx/responsive/lib/enhancers/withParentSize';
import { withParentSize } from '@visx/responsive';
import { scaleLinear, scaleTime } from '@visx/scale';
import { bisector, extent, max } from 'd3-array';
import { AreaClosed, Bar, Line, LinePath } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { styled, theme } from '../../../stitches.config';
import { defaultStyles, TooltipWithBounds, useTooltip } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { Group } from '@visx/group';
import { LinearGradient } from '@visx/gradient';
import { curveNatural, curveBasis, curveCardinal } from '@visx/curve';

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
  left: 30,
  bottom: 20,
  right: 0,
};

// accessors
const getDate = (d: StatsData) => new Date(d.date);
const getViews = (d: StatsData) => d.value;
const getVisits = (d: StatsData) => d.visits;
const bisectDate = bisector<StatsData, Date>((d) => new Date(d.date)).left;

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

  const tickFormat = (d: any) => {
    return format(d, 'dd/MM');
  };

  // bounds
  const innerWidth = width! - margin.left - margin.right;
  const innerHeight = height! - margin.top - margin.bottom;

  const xMax = Math.max(width! - margin.left - margin.right, 0);
  const yMax = Math.max(innerHeight!, 0);

  console.log({ width, height, innerWidth, innerHeight, xMax, yMax });

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

  const violet = theme.colors.violet3.toString();
  const green = theme.colors.green3.toString();

  const violetStroke = theme.colors.violet11.toString();
  const greenStroke = theme.colors.green11.toString();

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

  const axisLeftTickLabelProps = {
    dx: '-0.25em',
    dy: '0.25em',
    fontFamily,
    fontSize: 12,
    textAnchor: 'end' as const,
    fill: 'white',
  };

  return (
    <>
      <svg width={width} height={height}>
        <Group left={margin?.left} top={margin?.top}>
          <LinearGradient
            id={'purple-gradient'}
            from={violet}
            fromOpacity={0.7}
            to={violet}
            toOpacity={0}
          />
          <LinePath
            data={data}
            x={(d) => dateScale(getDate(d)) ?? 0}
            y={(d) => charValueScale(getViews(d)) ?? 0}
            stroke={violetStroke}
            strokeWidth={4}
            curve={curveNatural}
          />
          <AreaClosed<StatsData>
            data={data}
            x={(d) => dateScale(getDate(d)) ?? 0}
            y={(d) => charValueScale(getViews(d)) ?? 0}
            yScale={charValueScale}
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
            x={(d) => dateScale(getDate(d)) ?? 0}
            y={(d) => charValueScale(getVisits(d)) ?? 0}
            stroke={greenStroke}
            strokeWidth={4}
            curve={curveBasis}
          />
          <AreaClosed<StatsData>
            data={data}
            x={(d) => dateScale(getDate(d)) ?? 0}
            y={(d) => charValueScale(getVisits(d)) ?? 0}
            yScale={charValueScale}
            fill={'url(#green-gradient)'}
            curve={curveBasis}
          />

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
          <AxisLeft
            scale={charValueScale}
            numTicks={5}
            stroke={axisColor}
            tickStroke={axisColor}
            tickLabelProps={() => axisLeftTickLabelProps}
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
        </Group>
      </svg>
      {tooltipData && (
        <div>
          <TooltipWithBounds
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
          </TooltipWithBounds>
        </div>
      )}
    </>
  );
};

const enhancedStatsWeekly = withParentSize(StatsWeekly);

export { enhancedStatsWeekly as StatsWeekly };
