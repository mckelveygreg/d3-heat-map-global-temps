const root = document.getElementById('root');
const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

d3.json(url)
    .then(data => buildGraph(data));

const buildGraph = (data) => {
    const dataset = data.monthlyVariance;
    //console.log(dataset);
    // Dimensions
    const padding = { top: 100, right: 10, bottom: 150, left: 80 }
    console.log(padding);
    const width = root.clientWidth - padding.right - padding.left;
    const height = root.clientHeight - padding.top - padding.bottom;
    const yearMax = d3.max(dataset, d => d.year);
    const yearMin = d3.min(dataset, d => d.year);
    const tempMax = d3.max(dataset, d => d.variance);
    const tempMin = d3.min(dataset, d => d.variance);
    const cellWidth = Math.ceil((width)/(yearMax - yearMin));
    const cellHeight = Math.ceil((height)/12);
    
    const svg = d3.select(root)
                    .append('svg')
                    .attr('width', width + padding.right + padding.left)
                    .attr('height', height + padding.top + padding.bottom)
                    .append('g')
                    .attr('transform', `translate(${padding.left}, ${padding.top})`)
    // Titles
    svg.append('text')
        .text('Monthly Global Land-Surface Temperature')
        .attr('text-anchor', 'middle')
        .attr('id', 'title')
        .attr('font-size', '20')
        .attr('transform', `translate(${width/2}, -50)`);
    svg.append('text')
        .text('1753 - 2015: base temperature 8.66℃')
        .attr('id', 'description')
        .attr('text-anchor', 'middle')
        .attr('transform', `translate(${width/2}, -25)`);

    // x-scale
    const parseTimeYear = d3.timeParse('%Y');
    const xScaleYear = d3.scaleTime()
                            .domain([parseTimeYear(yearMin), parseTimeYear(yearMax)])
                            .range([0, width])
    const xAxis = d3.axisBottom(xScaleYear)
                    .tickFormat(d3.timeFormat('%Y'))
                    .tickArguments([d3.timeYear.every(10)]);

    // Y-Scale, Months
    const formatMonth = (month) => {
        let date = new Date(0);
        date.setUTCMonth(month);
        return d3.timeFormat('%B')(date);
    }
   
    const yScaleMonth = d3.scaleBand()
                .domain([1,2,3,4,5,6,7,8,9,10,11,12])
                .range([0,height])
    
    const yAxis = d3.axisLeft(yScaleMonth)                
                    .tickFormat(formatMonth);
                    
    // Axes
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .property('id', 'x-axis')
        .call(xAxis);
    svg.append('g')
        .attr('transform', `translate(${0}, ${0})`)
        .property('id', 'y-axis')
        .call(yAxis);

    // Color Scale
    // Smooth Colors
    const colors = d3.quantize(d3.interpolateRdYlBu, 10).reverse();
    const colorScale = d3.scaleSequential()
                        .domain([tempMax, tempMin])
                        .interpolator(d3.interpolateRdYlBu);
    // Blocky colors
    // const colorScale = d3.scaleSequential()
    //                     .domain([tempMax, tempMin])
    //                     .interpolator(d3.interpolateRdYlBu);

    // Tooltip
    const tooltip = d3.select('body')
                        .append('div')
                        .style('position', 'absolute')
                        .style('opacity', '0')
                        .text('filler text')
                        .attr('id', 'tooltip');

    // Rects Placement
    svg.selectAll('rect')
        .data(dataset)
        .enter()
        .append('rect')
        .attr('x', d => xScaleYear(parseTimeYear(d.year)))
        .attr('y', d => yScaleMonth(d.month))
        .attr('width', cellWidth)
        .attr('height', cellHeight)
        .attr('class', 'cell')
        .attr('data-month', d => d.month - 1)
        .attr('data-year', d => d.year)
        .attr('data-temp', d => d.variance)
        .attr('fill', d => colorScale(d.variance))
        .on('mouseover', (d, i) => (
            tooltip.style('opacity', '0.8')
                    .attr('data-year', d.year)
                    .style('z-index', '10')
                    .html(
                        `${formatMonth(d.month)} - ${d.year} </br>
                        Temp: ${d.variance + 8.66}&#8451;</br>
                        Variance: ${d.variance}&#8451;`
                    )))
                    .on('mousemove', () => (
                        tooltip.style('top', (d3.event.pageY - 5) + 'px')
                                .style('left', (d3.event.pageX + 10) + 'px')))
                    .on('mouseout', () => tooltip.style('opacity', '0').style('z-index', '-1'));
        
    // Legend
    
    const legendWidth = width * 0.85;

    //console.log(legendScaleText);
    
    const legendScale = d3.scaleLinear()
                            .domain(colorScale.domain())
                            .range([legendWidth, 0]);
 
    const legendContainer = svg.append('g')
                            .attr('id', 'legend')
                            .attr('x', 0)
                            .attr('y', height + 50)
                            .attr('width', legendWidth)
                            .attr('height', 50)
                            .attr('alignment-baseline', 'middle')
                            .attr('transform', `translate(${legendWidth*0.1},${height + 20})`); 

    const legendAxis = d3.axisBottom(legendScale)
                            .tickFormat(d3.format('.1f'))
                            .ticks(10);
    legendContainer.append('g')
                    .attr('transform', 'translate(0,20)')
                    .call(legendAxis);
    legendContainer.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('transform', `translate(${legendWidth/2},58)`)
                    .text('Change in Celcius from Base Temp');
    //--- Rect Legend
    // legendContainer.selectAll('.legend')
    //     .data(colors.reverse())
    //     .enter()
    //     .append('rect')
    //     .attr('class','legend')
    //     .attr('x', (d,i,a) => legendColorScale(i)) 
    //     .attr('y', 0)
    //     .attr('width', legendWidth/colors.length)
    //     .attr('height', 50)
    //     .attr('fill', (d,i) => d);

    // linearGradient Legend
    // href: https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient.html
    const defs = svg.append('defs');
    const linearGradient = defs.append('linearGradient')
                            .attr('id', 'linear-gradient');
    const colorScaleTest = d3.scaleLinear()
                            .range(colors);
    linearGradient.selectAll('stop')
                    .data( colorScaleTest.range())
                    .enter().append('stop')
                    .attr('offset', (d,i) => i/(colorScaleTest.range().length-1))
                    .attr('stop-color', d => d);
    

    //Draw the rectangle and fill with gradient
    legendContainer.append("rect")
        .attr("width", legendWidth)
        .attr("height", 20)
        .style("fill", "url(#linear-gradient)");
}