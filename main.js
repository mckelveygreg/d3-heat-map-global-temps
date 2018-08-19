const root = document.getElementById('root');
const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

d3.json(url)
    .then(data => buildGraph(data));

const buildGraph = (data) => {
    const dataset = data.monthlyVariance;
    //console.log(dataset);
    // Dimensions
    const width = root.clientWidth;
    const height = root.clientHeight;
    const padding = 50;
    const yearMax = d3.max(dataset, d => d.year);
    const yearMin = d3.min(dataset, d => d.year);
    const tempMax = d3.max(dataset, d => d.variance);
    const tempMin = d3.min(dataset, d => d.variance);
    const cellWidth = (width - padding)/(yearMax - yearMin);
    const cellHeight = (height -padding)/12;
    
    const svg = d3.select(root)
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height);
    // Titles
    svg.append('text')
        .text('Monthly Global Land-Surface Temperature')
        .attr('text-anchor', 'middle')
        .attr('id', 'title')
        .attr('font-size', '20')
        .attr('transform', `translate(${width/2}, 50)`);
    svg.append('text')
        .text('1753 - 2015: base temperature 8.66℃')
        .attr('id', 'description')
        .attr('text-anchor', 'middle')
        .attr('transform', `translate(${width/2}, 75)`);

    // x-scale
    const parseTimeYear = d3.timeParse('%Y');
    const xScaleYear = d3.scaleTime()
                            .domain([parseTimeYear(yearMin), parseTimeYear(yearMax)])
                            .range([padding, width-padding])
    const xAxis = d3.axisBottom(xScaleYear).tickFormat(d3.timeFormat('%Y'))
                    .tickArguments([d3.timeYear.every(10)]);

    // Y-Scale, Months
    const formatMonth = (month) => {
        let date = new Date(0);
        date.setUTCMonth(month);
        return d3.timeFormat('%B')(date);
    }
   
    const yScaleMonth = d3.scaleBand()
                .domain([1,2,3,4,5,6,7,8,9,10,11,12])
                .range([padding,height - padding])
    
    const yAxis = d3.axisLeft(yScaleMonth)                
                    .tickFormat(formatMonth);

    console.log(yScaleMonth(0));
                    
    // Axes
    svg.append('g')
        .attr('transform', `translate(0,${height - padding})`)
        .property('id', 'x-axis')
        .call(xAxis);
    svg.append('g')
        .attr('transform', `translate(${padding}, 0)`)
        .property('id', 'y-axis')
        .call(yAxis);

    // Color Scale
    const colorScale = d3.scaleSequential()
                        .domain([tempMax, tempMin])
                        .interpolator(d3.interpolateRdYlBu);

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
        .attr('fill', d => colorScale(d.variance));    
}