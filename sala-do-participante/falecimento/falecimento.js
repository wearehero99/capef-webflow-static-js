const API_AUTH_URL = "https://{API_NAME}.capef.com.br/auth/access-token";
const API_DEMISE_DATE_URL =
  "https://apifalecimento.capef.com.br/Consultar/Mes/{MONTH_VALUE}/Ano/{YEAR_VALUE}";

const API_NAMES = {
  apiFalecimento: "apifalecimento",
};

const anoSelect = document.getElementById("ano");
const mesSelect = document.getElementById("mes");
const mesLabel = document.getElementById("mesLabel");
const submitButton = $("#demise-submit");
const loadingIcon = $("#loading-icon");
const preloader = $(".preloader");
const cDateTag = $(".c-date-tag");

// set date tag sticky position
cDateTag.style.top = "200px";

// set preloader and loader style
loadingIcon.style.background = "#28343e";
loadingIcon.style.padding = "10px";
loadingIcon.style.borderRadius = "6px";
// black box shadow
loadingIcon.style.boxShadow =
  "0px 0px 0px 1px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.2)";

preloader.style.display = "none";
preloader.style.opacity = 1;
preloader.style.position = "fixed";
preloader.style.top = 0;
preloader.style.left = 0;
preloader.style.width = "100%";
preloader.style.height = "100%";

// Define o valor mínimo e máximo do campo de seleção de ano
const minYear = 1968;
const maxYear = new Date().getFullYear();

const month = $("#mes");
const year = $("#ano");
const demiseList = $("#demise-list");
const dateTag = $("#date-tag");

// Preenche as opções do campo de seleção de ano
for (let year = maxYear; year >= minYear; year--) {
  const option = document.createElement("option");
  option.value = year;
  option.text = year;
  anoSelect.appendChild(option);
}

anoSelect.addEventListener("change", () => {
  // Habilita o campo de seleção de mês e mostra a label correspondente
  mesSelect.disabled = false;
  mesLabel.style.display = "inline-block";
});

function $(selector) {
  return document.querySelector(selector);
}

async function getToken(apiName) {
  return await fetch(API_AUTH_URL.replace("{API_NAME}", apiName), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "Hero99",
      password: "d7OwsEqTXc",
    }),
  })
    .then((result) => result.json())
    .catch((error) => console.log("🚀 ~ error:", error));
}

const getRequestOptions = (accessToken) => {
  return {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    redirect: "follow",
  };
};

const makeAuthorizedRequest = async (url, apiName) => {
  const token = await getToken(API_NAMES[apiName]);
  const options = getRequestOptions(token.access_Token);

  return await fetch(url, options)
    .then((response) => response.json())
    .catch((error) => console.log("🚀 ~ error:", error));
};

const demiseResponse = async ({ date }) => {
  let url;

  if (date) {
    const demiseMonthText = month.options[month.selectedIndex].textContent;
    const demiseMonth = $("#demise-month");
    const demiseYear = $("#demise-year");
    dateTag.style.display = "flex";
    demiseMonth.innerHTML = demiseMonthText;
    demiseYear.innerHTML = year.value.toString().padStart(2, "0");
    url = API_DEMISE_DATE_URL.replace("{MONTH_VALUE}", date.month).replace(
      "{YEAR_VALUE}",
      date.year
    );
  }

  return makeAuthorizedRequest(url, "apiFalecimento");
};

function createElement(tag, ...classes) {
  const element = document.createElement(tag);
  element.classList.add(...classes);
  return element;
}

function createListItem(element) {
  const listItem = createElement("li", "list-item");
  const lDot = createElement("div", "l-dot");
  const dot = createElement("div", "dot");
  const lNameList = createElement("div", "l-name-list");
  const nameWrapper = createElement("div", "c-name_icon");
  const noteIconWrapper = createElement("div", "list-icon");
  const noteIcon = createElement("img");
  noteIcon.src =
    "https://assets.website-files.com/639787ef2df6f2cf951c2cba/63d12cbaec1e975a4abb2ddb_Alert%20Circle.svg";
  const noteTooltip = createElement("div", "c-tooltip");

  const name = createElement("div", "body-normal-600");
  const date = createElement("div", "body-small-500-2", "text-color-gray-04");

  const nameText = document.createTextNode(element.nome);
  const demiseDateText = `${new Date(element.data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}`;
  const demiseDate = document.createTextNode(demiseDateText);

  name.appendChild(nameText);
  date.appendChild(demiseDate);

  noteTooltip.innerHTML = `
    <div class="text-weight-bold">
      <div>Nota de falecimento</div>
    </div>
    <br/>
    <div>
    <div>Com pesar, comunicamos o falecimento da nossa participante <span class="text-weight-bold">${element.nome}</span>, ocorrido no dia ${demiseDateText}.</div>
    </div>
    <br/>
    <div>
      <div>Á sua família. nossas sinceras condolências.</div>
    </div>
  `;

  noteIconWrapper.appendChild(noteIcon);

  nameWrapper.appendChild(name);
  nameWrapper.appendChild(noteIconWrapper);
  nameWrapper.appendChild(noteTooltip);

  lNameList.appendChild(nameWrapper);
  lNameList.appendChild(date);
  lDot.appendChild(dot);
  lDot.appendChild(lNameList);
  listItem.appendChild(lDot);

  return listItem;
}

function createNoItemsMessage() {
  const listItem = createElement("li", "list-item");
  const lDot = createElement("div", "l-dot");
  const dot = createElement("div", "dot");
  const lNameList = createElement("div", "l-name-list");
  const nameWrapper = createElement("div", "c-name_icon");
  const name = createElement("div", "body-normal-600");
  const nameText = document.createTextNode("Não há nenhum aviso de falecimento no mês selecionado");

  name.appendChild(nameText);
  nameWrapper.appendChild(name);

  lNameList.appendChild(nameWrapper);
  lDot.appendChild(dot);
  lDot.appendChild(lNameList);
  listItem.appendChild(lDot);

  return listItem;
}

async function searchDemises() {
  preloader.style.display = "flex";

  const date = { month: month.value, year: year.value };

  const response = await demiseResponse({ date });

  const list = $("#demise-list");
  list.innerHTML = "";

  if (response.length) {
    if (typeof response[0] !== "string") {
      const filteredData = ar.filter(item=> {
        const data = new Date(item.data)
        if(data.getMonth()+1 === 5){
            return item
        }
      })

      if(filteredData.length){
        const items = filteredData.map(createListItem);
              items.forEach((item) => list.appendChild(item));
      }else{
          list.appendChild(createNoItemsMessage());
      }
    } else {
      list.appendChild(createNoItemsMessage());
    }
  } else {
    list.appendChild(createNoItemsMessage());
  }

  // On hover .list-icon show next div .c-tooltip
  const noteIcons = document.querySelectorAll(".list-icon");
  noteIcons.forEach((noteIcon) => {
    noteIcon.addEventListener("mouseover", () => {
      noteIcon.nextElementSibling.style.display = "block";
    });
    noteIcon.addEventListener("mouseout", () => {
      noteIcon.nextElementSibling.style.display = "none";
    });
  });

  preloader.style.display = "none";
}

$("#demise-submit").addEventListener("click", searchDemises);

function setCurrentDate() {
  // Format dob
  const currentDate = new Date();
  // Get current date day
  const currentDay = currentDate.getDate().toString();
  // Get current date month number
  const currentMonth = currentDate.getMonth() + 1;
  // get Current date year
  const currentYear = currentDate.getFullYear();

  // set current date year
  anoSelect.value = currentYear;

  // Set current date month
  mesSelect.value = currentMonth;

  // click on submitButton
  submitButton.click();
}

setCurrentDate();
