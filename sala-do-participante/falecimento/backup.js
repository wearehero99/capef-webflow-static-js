const API_AUTH_URL = "https://{API_NAME}.capef.com.br/auth/access-token";
const API_DEMISE_DATE_URL =
  "https://apifalecimento.capef.com.br/Consultar/Mes/{MONTH_VALUE}/Ano/{YEAR_VALUE}";

const API_NAMES = {
  apiFalecimento: "apifalecimento",
};

const anoSelect = document.getElementById("ano");
const mesSelect = document.getElementById("mes");
const mesLabel = document.getElementById("mesLabel");

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
  const name = createElement("div", "body-normal-600");
  const date = createElement("div", "body-small-500-2", "text-color-gray-04");

  const nameText = document.createTextNode(element.nome);
  const demiseDate = document.createTextNode(
    `${new Date(element.data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })}`
  );

  name.appendChild(nameText);
  date.appendChild(demiseDate);

  lNameList.appendChild(name);
  lNameList.appendChild(date);
  lDot.appendChild(dot);
  lDot.appendChild(lNameList);
  listItem.appendChild(lDot);

  return listItem;
}

async function searchDemises() {
  const loadingIcon = $("#loading-icon");
  loadingIcon.style.display = "block";
  const date = { month: month.value, year: year.value };

  const response = await demiseResponse({ date });

  const list = $("#demise-list");
  list.innerHTML = "";

  if (response.length) {
    const items = response.map(createListItem);
    items.forEach((item) => list.appendChild(item));
  }
  loadingIcon.style.display = "none";
}

$("#demise-submit").addEventListener("click", searchDemises);
