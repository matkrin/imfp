const energies = [...Array(10000 - 10 + 1).keys()].map((x) => x + 10);

const checkbox = document.querySelector("#checkbox");
let lightTheme = true;
checkbox.addEventListener("change", function () {
  if (this.checked) {
    lightTheme = false;
  } else {
    lightTheme = true;
  }
});

function calcImfp(energy) {
  imfp = 143 / (energy * energy) + 0.054 * Math.sqrt(energy);
  return imfp;
}

const imfps = energies.map((x) => calcImfp(x));

const data = [];
for (let i = 0; i < energies.length; i++) {
  data.push({ energy: energies[i], imfp: imfps[i] });
}

const form = document.querySelector("form");
const input = document.querySelector('input[type="text"]');
const lambda = document.querySelector("#imfp");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (isNaN(input.value) || input.value == 0) {
    lambda.style.color = "#ff392e";
    lambda.textContent = "Please enter a number";

    input.style.backgroundColor = lightTheme ? "#ffe2e1" : "#6d1b25";
  } else {
    lambda.style.color = lightTheme ? "black" : "white";
    lambda.textContent = `\u{3bb} = ${calcImfp(input.value).toFixed(2)} nm`;

    input.style.border = "none";
    input.style.backgroundColor = "";

    d3.selectAll(".plot-lines").remove();
    if (input.value >= 10 && input.value <= 10000) {
      addLines(input.value);
    }
  }
});

// D3 SVG
// dimensions and margins
const margin = {
  top: 20,
  right: 200,
  bottom: 30,
  left: 60,
};
const width = 850 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// append the svg object to div with imfp id
const svg = d3
  .select("#imfp-plot")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom + 20)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// X axis
const xScale = d3
  .scaleLog()
  .domain([energies[0], energies[energies.length - 1]])
  .range([0, width]);
svg
  .append("g")
  .attr("class", "axis")
  .attr("transform", "translate(0," + height + ")")
  .call(
    d3
      .axisBottom(xScale)
      .ticks(4)
      .tickValues([10, 100, 1000, 10000])
      .tickFormat(d3.format(".0f"))
  );
svg
  .append("g")
  .attr("class", "axis")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(xScale).ticks(4).tickFormat(""));
svg
  .append("g")
  .attr("class", "axis")
  .call(d3.axisTop(xScale).ticks(0).tickSize(0));
svg
  .append("text")
  .attr("class", "plot-text")
  .attr("text-anchor", "middle")
  .attr("x", width / 2)
  .attr("y", height + margin.top + 20)
  .text("Energy [eV]");

// Y axis
const yScale = d3.scaleLog().domain([0.3, 10]).range([height, 0]);
svg
  .append("g")
  .attr("class", "axis")
  .call(
    d3
      .axisLeft(yScale)
      .ticks(2)
      .tickValues([1, 10])
      .tickFormat(d3.format(".0f"))
  );
svg.append("g").attr("class", "axis").call(d3.axisLeft(yScale).tickFormat(""));
svg
  .append("g")
  .attr("class", "axis")
  .attr("transform", `translate(${width})`)
  .call(d3.axisRight(yScale).ticks(0).tickSize(0));
svg
  .append("text")
  .attr("class", "plot-text")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .attr("x", -margin.left - 160)
  .attr("y", -margin.top - 10)
  .text("\u{3bb} [nm]");

// Circle that travels along the curve of chart
const focus = svg
  .append("g")
  .append("circle")
  .style("fill", "#ffb2ae")
  .attr("stroke", "red")
  .attr("r", 6.5)
  .style("opacity", 0);

// Text for the energy that travels along the curve of chart
const focusTextEnergy = svg
  .append("g")
  .append("text")
  .style("opacity", 0)
  .attr("text-anchor", "left")
  .attr("alignment-baseline", "middle");

// Text for the IMFP that travels along the curve of chart
const focusTextImfp = svg
  .append("g")
  .append("text")
  .style("opacity", 0)
  .attr("text-anchor", "left")
  .attr("alignment-baseline", "middle");

// Add the universal curce as path
svg
  .append("path")
  .datum(data)
  .attr("id", "plot-curve")
  .attr(
    "d",
    d3
      .line()
      .x((d) => xScale(d.energy))
      .y((d) => yScale(d.imfp))
  );

// Rectangle on top of the svg for handling the mouse position
svg
  .append("rect")
  .style("fill", "none")
  .style("pointer-events", "all")
  .attr("width", width)
  .attr("height", height)
  .on("mouseover", mouseover)
  .on("mousemove", mousemove)
  .on("mouseout", mouseout);

function mouseover() {
  focus.style("opacity", 1);
  focusTextEnergy.style("opacity", 1);
  focusTextImfp.style("opacity", 1);
}

function mousemove() {
  const bisect = d3.bisector((d) => d.energy).left;

  let xPosition = xScale.invert(d3.mouse(this)[0]);
  let i = bisect(data, xPosition);
  let selectedData = data[i];
  focus
    .attr("cx", xScale(selectedData.energy))
    .attr("cy", yScale(selectedData.imfp));
  focusTextEnergy
    .html(`E : ${selectedData.energy} eV`)
    .attr("x", xScale(selectedData.energy) + 15)
    .attr("y", yScale(selectedData.imfp) + 10)
    .attr("class", "plot-text");
  focusTextImfp
    .html(`\u{3bb} : ${d3.format(".2f")(selectedData.imfp)} nm`)
    .attr("x", xScale(selectedData.energy) + 15)
    .attr("y", yScale(selectedData.imfp) + 30)
    .attr("class", "plot-text");
}

function mouseout() {
  focus.style("opacity", 0);
  focusTextEnergy.style("opacity", 0);
  focusTextImfp.style("opacity", 0);
}

function addLines(energy) {
  let index = energies.indexOf(Math.round(energy));
  svg
    .append("g")
    .datum(data)
    .append("line")
    .attr("class", "plot-lines")
    .attr("x1", xScale(data[index].energy)) //<<== change your code here
    .attr("y1", 0)
    .attr("x2", xScale(data[index].energy)) //<<== and here
    .attr("y2", height);

  svg
    .append("g")
    .datum(data)
    .append("line")
    .attr("class", "plot-lines")
    .attr("x1", 0) //<<== change your code here
    .attr("y1", yScale(data[index].imfp))
    .attr("x2", width) //<<== and here
    .attr("y2", yScale(data[index].imfp));
}
