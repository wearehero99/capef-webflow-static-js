const API_AUTH_URL = "https://{API_NAME}.capef.com.br/auth/access-token";
const API_BIRTHDAY_NAME_URL =
  "https://apianiversario.capef.com.br/Consultar/PorNome?Nome={NAME_VALUE}";
const API_BIRTHDAY_DATE_URL =
  "https://apianiversario.capef.com.br/Consultar/Dia/{DAY_VALUE}/Mes/{MONTH_VALUE}";

const API_NAMES = {
  apiAniversario: "apianiversario",
};

const day = $("#dia");
const month = $("#mes");
const dateTag = $("#date-tag");

function atualizarDias() {
  const mes = +document.getElementById("mes").value; // Converter o valor de mes para um número inteiro
  const diasSelect = document.getElementById("dia");
  diasSelect.disabled = false;

  // Remove todas as opções existentes
  diasSelect.innerHTML = "";

  // Define o número de dias baseado no mês selecionado
  let numDias = 31;
  if (mes === 4 || mes === 6 || mes === 9 || mes === 11) {
    numDias = 30;
  } else if (mes === 2) {
    numDias = 29;
  }

  // Popula o dropdown de dias com as opções
  for (let i = 1; i <= numDias; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.text = i;
    diasSelect.appendChild(option);
  }
}

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

const birthdayResponse = async ({ name, date }) => {
  let url;

  if (name) {
    dateTag.style.display = "none";
    url = API_BIRTHDAY_NAME_URL.replace("{NAME_VALUE}", name);
  } else if (date) {
    const birthdayMonthText = month.options[month.selectedIndex].textContent;
    const birthdayMonth = $("#birthday-month");
    const birthdayDay = $("#birthday-day");
    dateTag.style.display = "flex";
    birthdayMonth.innerHTML = birthdayMonthText;
    birthdayDay.innerHTML = day.value.toString().padStart(2, "0");
    url = API_BIRTHDAY_DATE_URL.replace("{DAY_VALUE}", date.day).replace(
      "{MONTH_VALUE}",
      date.month
    );
  }

  return makeAuthorizedRequest(url, "apiAniversario");
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
  const status = createElement("div", "body-small-500-2", "text-color-gray-04");

  const nameText = document.createTextNode(element.nome);
  const statusText = document.createTextNode(element.status);

  name.appendChild(nameText);
  status.appendChild(statusText);

  lNameList.appendChild(name);
  lNameList.appendChild(status);
  lDot.appendChild(dot);
  lDot.appendChild(lNameList);
  listItem.appendChild(lDot);

  return listItem;
}

async function searchBirthdays() {
  const loadingIcon = $("#loading-icon");
  loadingIcon.style.display = "block";
  const name = $("#Pesquisar-por-nome").value.trim();
  const date = { month: month.value, day: day.value };

  const response = await birthdayResponse({ name, date });

  const list = $("#birthday-list");
  list.innerHTML = "";

  if (response.length) {
    const items = response.map(createListItem);
    items.forEach((item) => list.appendChild(item));
  }
  loadingIcon.style.display = "block";
}

$("#birthday-submit").addEventListener("click", searchBirthdays);
