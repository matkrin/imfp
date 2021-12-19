const theme = document.querySelector("#theme");
const toggleSwitch = document.querySelector(
  '.theme-switch input[type="checkbox"]'
);

toggleSwitch.addEventListener("change", () => {
  let input = document.querySelector('input[type="text"]');

  if (
    theme.href == "https://cdn.jsdelivr.net/npm/water.css@2/out/light.min.css"
  ) {
    theme.href = "https://cdn.jsdelivr.net/npm/water.css@2/out/dark.min.css";
    document.documentElement.setAttribute("theme", "dark");

    document.querySelector("#imfp").style.color = "#b9bec9";

    if (input.style.backgroundColor === "rgb(255, 226, 225)") {
      input.style.backgroundColor = "#6d1b25";
    }
  } else {
    theme.href = "https://cdn.jsdelivr.net/npm/water.css@2/out/light.min.css";
    document.documentElement.setAttribute("theme", "light");
    document.querySelector("#imfp").style.color = "black";

    if (input.style.backgroundColor === "rgb(109, 27, 37)") {
      input.style.backgroundColor = "#ffe2e1";
    }
  }
});
