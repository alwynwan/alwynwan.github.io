var cachedData = null;
var contentsWrapper = document.querySelector(".config-options__wrapper");

function loadConfig(config) {
  var config =
    /\[\/Script\/Pal\.PalGameWorldSettings]\nOptionSettings=\((.*)\)/g.exec(
      config
    )[1];

  console.debug(config);

  var regex = /(?:([^=,"]+)=(?:"([^"]*)"|([^=,]+))(?:,|$))/g;
  var configSplit;
  var configObj = {};

  while ((configSplit = regex.exec(config)) !== null) {
    var configUseful = configSplit.slice(1).filter(Boolean);
    configObj[configUseful[0]] = configUseful[1] ?? "";
  }

  console.debug(configObj);

  if (!contentsWrapper) return;

  // Clean out the wrapper
  contentsWrapper.replaceChildren();

  contentsWrapper.insertAdjacentHTML(
    "afterbegin",
    Object.entries(configObj)
      .map(
        ([key, value]) =>
          `<div class="config-options__item">
  <span class="config-options__item-name">${key}</span>
  <input class="config-options__item-input" type="text" value="${value}" />
  </div>`
      )
      .join("")
  );
}

function saveStringToFile(filename, content) {
  var blob = new Blob([content], { type: "text/plain" });
  var url = URL.createObjectURL(blob);

  var link = document.createElement("a");
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
}

document.getElementById("input_file").addEventListener("change", function (e) {
  var file = e.target.files[0];
  var reader = new FileReader();

  reader.onload = function (e) {
    var contents = e.target.result;

    cachedData = contents;

    if (!contents) return;

    loadConfig(contents);
  };

  reader.readAsText(file);
});

document.querySelector(".open").addEventListener("click", function () {
  loadConfig(cachedData);
});

document.querySelector(".save").addEventListener("click", function (e) {
  var contentsWrapper = document.querySelector(".config-options__wrapper");

  var configObj = {};

  for (var i = 0; i < contentsWrapper.children.length; i++) {
    var child = contentsWrapper.children[i];

    var key = child.querySelector(".config-options__item-name").innerText;
    var value = child.querySelector(".config-options__item-input").value;

    configObj[key] = value;
  }

  var configString = Object.entries(configObj)
    .map(([key, value]) => `${key}=${value}`)
    .join(",");

  var newConfig = `[\/Script\/Pal.PalGameWorldSettings]\nOptionSettings=(${configString})`;

  saveStringToFile("PalGameWorldSettings.ini", newConfig);
});

document.querySelector("#filter").addEventListener("keyup", function (e) {
  if (!document.querySelectorAll(".config-options__item-name").length) return;

  const filterValue = e.target.value;

  contentsWrapper.classList.toggle("no-filter", filterValue === "");

  const items = document.querySelectorAll(".config-options__item");

  items.forEach((item) => {
    item.classList.toggle(
      "matches-filter",
      item
        .querySelector(".config-options__item-name")
        .innerText.toLowerCase()
        .includes(filterValue.toLowerCase())
    );
  });
});
